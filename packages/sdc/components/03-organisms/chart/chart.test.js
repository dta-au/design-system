import { Twig } from 'twig-testing-library';
import * as fs from 'node:fs';

// chart.twig runs its labels through |t; register the identity filter the
// same way the Storybook twig plugin does.
Twig.extendFilter('t', (value) => value);

const template = 'components/03-organisms/chart/chart.twig';

const BASE = {
  chart_id: 'test-chart',
  chart_type: 'donut',
  title: 'Test chart',
  description: 'Chart under test.',
  x_key: 'source',
  y_keys: ['share'],
  rows: [
    { source: 'Renewable', share: 44 },
    { source: 'Fossil', share: 56 },
  ],
};

describe('Chart Component', () => {
  test('renders donut with legend and standard x/y table', async () => {
    const c = await dom(template, BASE);

    const figure = c.querySelector('figure.bdga-chart');
    expect(figure).not.toBeNull();
    expect(figure.classList.contains('bdga-chart--donut')).toBe(true);
    expect(figure.getAttribute('data-bdga-chart')).toEqual('donut');
    expect(c.querySelector('.bdga-chart__legend')).not.toBeNull();
    expect(c.querySelector('thead th[data-bdga-key="source"]')).not.toBeNull();
    expect(c.querySelector('thead th[data-bdga-key="share"]')).not.toBeNull();
    expect(c.querySelector('thead th[data-bdga-key="target"]')).toBeNull();
    assertUniqueCssClasses(c);
  });

  test('chord forces the 3-column flow table', async () => {
    const c = await dom(template, {
      ...BASE,
      chart_id: 'test-chord',
      chart_type: 'chord',
      y_keys: ['value'],
      rows: [
        { source: 'NSW', target: 'Vic', value: 10 },
        { source: 'Vic', target: 'NSW', value: 7 },
      ],
    });

    expect(c.querySelector('.bdga-chart--chord')).not.toBeNull();
    expect(c.querySelector('thead th[data-bdga-key="source"]')).not.toBeNull();
    expect(c.querySelector('thead th[data-bdga-key="target"]')).not.toBeNull();
    expect(c.querySelector('thead th[data-bdga-key="value"]')).not.toBeNull();
    assertUniqueCssClasses(c);
  });

  test('treemap keeps the standard x/y table and no legend', async () => {
    const c = await dom(template, {
      ...BASE,
      chart_id: 'test-treemap',
      chart_type: 'treemap',
    });

    expect(c.querySelector('.bdga-chart--treemap')).not.toBeNull();
    expect(c.querySelector('.bdga-chart__legend')).toBeNull();
    expect(c.querySelector('thead th[data-bdga-key="target"]')).toBeNull();
    assertUniqueCssClasses(c);
  });

  test('unknown chart type falls back to bar', async () => {
    const c = await dom(template, {
      ...BASE,
      chart_id: 'test-unknown',
      chart_type: 'sparkline',
    });

    expect(c.querySelector('.bdga-chart--bar')).not.toBeNull();
  });

  test('renders self-supplied wrappers by default', async () => {
    const c = await dom(template, BASE, false);

    expect(c.querySelector('.bdga-chart-block')).not.toBeNull();
    expect(c.querySelector('.bdga-chart-block .container .row .col-xxs-12 figure.bdga-chart')).not.toBeNull();
  });

  test('swap variant renders the icon control and drops the toolbar table button', async () => {
    const c = await dom(template, {
      ...BASE,
      chart_id: 'test-swap',
      table_toggle: 'swap',
      toolbar: true,
    });

    const figure = c.querySelector('figure.bdga-chart');
    expect(figure.classList.contains('bdga-chart--swap-table')).toBe(true);
    const btn = c.querySelector('[data-bdga-chart-table-swap]');
    expect(btn).not.toBeNull();
    expect(btn.getAttribute('aria-controls')).toEqual('test-swap__data');
    expect(c.querySelector('[data-bdga-chart-tool="table"]')).toBeNull();
    expect(c.querySelector('[data-bdga-chart-menu-button]')).not.toBeNull();
    expect(c.querySelector('details.bdga-chart__data')).not.toBeNull();
    assertUniqueCssClasses(c);
  });

  test('embedded renders the bare figure only', async () => {
    const c = await dom(template, {
      ...BASE,
      chart_id: 'test-embedded',
      embedded: true,
    });

    expect(c.querySelector('.bdga-chart-block')).toBeNull();
    expect(c.querySelector('.container')).toBeNull();
    const figure = c.querySelector('figure.bdga-chart');
    expect(figure).not.toBeNull();
    expect(figure.classList.contains('bdga-chart--embedded')).toBe(true);
    assertUniqueCssClasses(c);
  });

  test('stacked_bar renders the legend container and both series columns', async () => {
    const c = await dom(template, {
      ...BASE,
      chart_id: 'test-stacked',
      chart_type: 'stacked_bar',
      y_keys: ['gains', 'losses'],
      rows: [
        { source: 'Q1', gains: 30, losses: -10 },
        { source: 'Q2', gains: 20, losses: -40 },
      ],
    });

    const figure = c.querySelector('figure.bdga-chart');
    expect(figure.classList.contains('bdga-chart--stacked_bar')).toBe(true);
    expect(figure.getAttribute('data-bdga-chart')).toEqual('stacked_bar');
    expect(c.querySelector('.bdga-chart__legend')).not.toBeNull();
    expect(c.querySelector('thead th[data-bdga-key="gains"]')).not.toBeNull();
    expect(c.querySelector('thead th[data-bdga-key="losses"]')).not.toBeNull();
    // The fallback table carries negative values verbatim.
    expect(c.querySelector('td[data-value="-40"]')).not.toBeNull();
    assertUniqueCssClasses(c);
  });
});

/**
 * Renderer tests: evaluate the vendored D3 build (the same UMD file the
 * Storybook preview head loads - see chart.mdx), mount the twig output and
 * attach the chart behaviour, then assert on the drawn SVG geometry.
 */
describe('Chart renderer', () => {
  const configFor = (props) => JSON.stringify({
    id: props.chart_id,
    type: props.chart_type,
    source: 'json',
    x_key: props.x_key,
    y_keys: props.y_keys,
    rows: props.rows,
  });

  const attachChart = async (props) => {
    const container = await dom(template, { ...props, config_json: configFor(props) }, false);
    document.body.appendChild(container);
    await import('./chart.js');
    window.Drupal.attachBehaviors(document);
    return container.querySelector('figure.bdga-chart');
  };

  const svgOf = (fig) => fig.querySelector('[data-bdga-chart-canvas] svg');
  // d3's default locale renders negatives as U+2212; parseFloat rejects it.
  const tickValues = (svg) => Array.from(svg.querySelectorAll('g.tick text'))
    .map((t) => parseFloat(t.textContent.replace('−', '-')))
    .filter(Number.isFinite);
  const zeroLineOf = (svg) => svg.querySelector('line.bdga-chart__zero-line');
  const expectValidHeights = (svg) => {
    Array.from(svg.querySelectorAll('rect')).forEach((r) => {
      const hv = Number(r.getAttribute('height'));
      expect(Number.isFinite(hv)).toBe(true);
      expect(hv).toBeGreaterThanOrEqual(0);
    });
  };

  beforeAll(() => {
    // Detach fixtures from the twig suite so the behaviour attach sweep only
    // sees renderer fixtures.
    document.body.replaceChildren();
    // eslint-disable-next-line no-eval
    (0, eval)(fs.readFileSync(
      new URL('../../../.storybook/static/d3-vendor/d3.v7.min.js', import.meta.url),
      'utf8'
    ));
  });

  test('stacked_bar diverges around zero instead of dropping negative rows', async () => {
    const fig = await attachChart({
      chart_id: 'js-stacked-diverging',
      chart_type: 'stacked_bar',
      title: 'Net position',
      x_key: 'quarter',
      y_keys: ['gains', 'losses'],
      rows: [
        { quarter: 'Q1', gains: 30, losses: -10 },
        { quarter: 'Q2', gains: 20, losses: -40 },
        { quarter: 'Q3', gains: 50, losses: 0 },
      ],
    });
    const svg = svgOf(fig);

    // Every row of every series draws - nothing silently dropped.
    expect(svg.querySelectorAll('g[data-bdga-series] rect')).toHaveLength(6);
    expectValidHeights(svg);

    // The y axis reaches below zero and the zero baseline is drawn.
    expect(Math.min(...tickValues(svg))).toBeLessThan(0);
    const zeroLine = zeroLineOf(svg);
    expect(zeroLine).not.toBeNull();

    // Negative segments hang from the baseline; positive ones sit on it.
    const zeroY = Number(zeroLine.getAttribute('y1'));
    const losses = svg.querySelectorAll('g[data-bdga-series="losses"] rect');
    expect(Number(losses[1].getAttribute('y'))).toBeCloseTo(zeroY, 6);
    expect(Number(losses[1].getAttribute('height'))).toBeGreaterThan(0);
    const gains = svg.querySelectorAll('g[data-bdga-series="gains"] rect');
    const gainsBottom = Number(gains[0].getAttribute('y')) + Number(gains[0].getAttribute('height'));
    expect(gainsBottom).toBeCloseTo(zeroY, 6);
  });

  test('stacked_bar keeps the zero floor when all values are positive', async () => {
    const fig = await attachChart({
      chart_id: 'js-stacked-positive',
      chart_type: 'stacked_bar',
      title: 'Totals',
      x_key: 'quarter',
      y_keys: ['gains', 'losses'],
      rows: [
        { quarter: 'Q1', gains: 30, losses: 10 },
        { quarter: 'Q2', gains: 20, losses: 40 },
      ],
    });
    const svg = svgOf(fig);

    expect(svg.querySelectorAll('g[data-bdga-series] rect')).toHaveLength(4);
    expectValidHeights(svg);
    expect(Math.min(...tickValues(svg))).toBeGreaterThanOrEqual(0);
    expect(zeroLineOf(svg)).toBeNull();
  });

  test('bar draws negative values below the zero baseline', async () => {
    const fig = await attachChart({
      chart_id: 'js-bar-negative',
      chart_type: 'bar',
      title: 'Monthly net',
      x_key: 'month',
      y_keys: ['net'],
      rows: [
        { month: 'Jan', net: 12 },
        { month: 'Feb', net: -8 },
        { month: 'Mar', net: 5 },
      ],
    });
    const svg = svgOf(fig);

    const rects = svg.querySelectorAll('rect');
    expect(rects).toHaveLength(3);
    expectValidHeights(svg);
    expect(Math.min(...tickValues(svg))).toBeLessThan(0);
    const zeroLine = zeroLineOf(svg);
    expect(zeroLine).not.toBeNull();
    const zeroY = Number(zeroLine.getAttribute('y1'));
    expect(Number(rects[1].getAttribute('y'))).toBeCloseTo(zeroY, 6);
    expect(Number(rects[1].getAttribute('height'))).toBeGreaterThan(0);
  });

  test('grouped_bar draws negative members downward from the baseline', async () => {
    const fig = await attachChart({
      chart_id: 'js-grouped-negative',
      chart_type: 'grouped_bar',
      title: 'Change by year',
      x_key: 'region',
      y_keys: ['first', 'second'],
      rows: [
        { region: 'North', first: 14, second: 9 },
        { region: 'South', first: 6, second: -11 },
      ],
    });
    const svg = svgOf(fig);

    expect(svg.querySelectorAll('rect[data-bdga-series]')).toHaveLength(4);
    expectValidHeights(svg);
    expect(Math.min(...tickValues(svg))).toBeLessThan(0);
    const zeroLine = zeroLineOf(svg);
    expect(zeroLine).not.toBeNull();
    const zeroY = Number(zeroLine.getAttribute('y1'));
    const south = svg.querySelectorAll('rect[data-bdga-series="second"]')[1];
    expect(Number(south.getAttribute('y'))).toBeCloseTo(zeroY, 6);
    expect(Number(south.getAttribute('height'))).toBeGreaterThan(0);
  });

  test('line plots negative points below the zero baseline', async () => {
    const fig = await attachChart({
      chart_id: 'js-line-negative',
      chart_type: 'line',
      title: 'Weekly delta',
      x_key: 'week',
      y_keys: ['delta'],
      rows: [
        { week: 'One', delta: 4 },
        { week: 'Two', delta: -6 },
        { week: 'Three', delta: 2 },
      ],
    });
    const svg = svgOf(fig);

    expect(Math.min(...tickValues(svg))).toBeLessThan(0);
    const zeroLine = zeroLineOf(svg);
    expect(zeroLine).not.toBeNull();
    const zeroY = Number(zeroLine.getAttribute('y1'));
    const markers = svg.querySelectorAll('path.bdga-chart__line-marker');
    expect(markers).toHaveLength(3);
    const markerY = (el) => Number(el.getAttribute('transform').match(/translate\([^,]+,([^)]+)\)/)[1]);
    expect(markerY(markers[1])).toBeGreaterThan(zeroY);
    expect(markerY(markers[0])).toBeLessThan(zeroY);
  });

  test('cleveland places negative dots left of a vertical zero rule', async () => {
    const fig = await attachChart({
      chart_id: 'js-cleveland-negative',
      chart_type: 'cleveland',
      title: 'Before and after',
      x_key: 'portfolio',
      y_keys: ['before', 'after'],
      rows: [
        { portfolio: 'Alpha', before: 4, after: -3 },
        { portfolio: 'Beta', before: 2, after: 5 },
      ],
    });
    const svg = svgOf(fig);

    expect(Math.min(...tickValues(svg))).toBeLessThan(0);
    const zeroLine = zeroLineOf(svg);
    expect(zeroLine).not.toBeNull();
    expect(zeroLine.getAttribute('x1')).toEqual(zeroLine.getAttribute('x2'));
    const zeroX = Number(zeroLine.getAttribute('x1'));
    const afterDots = svg.querySelectorAll('circle.bdga-chart__cleveland-dot--2');
    expect(afterDots).toHaveLength(2);
    expect(Number(afterDots[0].getAttribute('cx'))).toBeLessThan(zeroX);
    expect(Number(afterDots[1].getAttribute('cx'))).toBeGreaterThan(zeroX);
  });

  test('lollipop stems cross the zero baseline for negative values', async () => {
    const fig = await attachChart({
      chart_id: 'js-lollipop-negative',
      chart_type: 'lollipop',
      title: 'Score change',
      x_key: 'item',
      y_keys: ['change'],
      rows: [
        { item: 'A', change: 5 },
        { item: 'B', change: -3 },
      ],
    });
    const svg = svgOf(fig);

    const zeroLine = zeroLineOf(svg);
    expect(zeroLine).not.toBeNull();
    expect(Math.min(...tickValues(svg))).toBeLessThan(0);
    const zeroY = Number(zeroLine.getAttribute('y1'));
    const stems = svg.querySelectorAll('line.bdga-chart__lollipop-stem');
    expect(stems).toHaveLength(2);
    expect(Number(stems[1].getAttribute('y1'))).toBeCloseTo(zeroY, 6);
    expect(Number(stems[1].getAttribute('y2'))).toBeGreaterThan(zeroY);
    const dots = svg.querySelectorAll('circle.bdga-chart__lollipop-dot');
    expect(Number(dots[1].getAttribute('cy'))).toBeGreaterThan(zeroY);
  });
});
