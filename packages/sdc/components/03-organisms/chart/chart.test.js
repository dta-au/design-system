import { Twig } from 'twig-testing-library';

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
});
