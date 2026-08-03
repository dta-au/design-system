import { Twig } from 'twig-testing-library';

// The chart family runs its labels through |t; register the identity filter
// the same way the Storybook twig plugin does.
Twig.extendFilter('t', (value) => value);

const template = 'components/03-organisms/chart-collection/chart-collection.twig';

const PANELS = [
  {
    chart_type: 'bar',
    title: 'Panel one',
    x_key: 'year',
    y_keys: ['renewable'],
    rows: [
      { year: '2024', renewable: 40 },
      { year: '2025', renewable: 44 },
    ],
  },
  {
    chart_type: 'donut',
    title: 'Panel two',
    x_key: 'source',
    y_keys: ['share'],
    rows: [
      { source: 'Renewable', share: 44 },
      { source: 'Fossil', share: 56 },
    ],
  },
];

const BASE = {
  collection_id: 'test-collection',
  title: 'Collection under test',
  description: 'Two related panels.',
  panels: PANELS,
};

describe('Chart Collection Component', () => {
  test('renders a named section of embedded panels', async () => {
    const c = await dom(template, BASE);

    const section = c.querySelector('section.bdga-chart-collection');
    expect(section).not.toBeNull();
    expect(section.getAttribute('aria-labelledby')).toEqual('test-collection__title');
    expect(section.getAttribute('aria-describedby')).toEqual('test-collection__desc');
    expect(section.classList.contains('bdga-chart-collection--cols-2')).toBe(true);
    expect(c.querySelector('.bdga-chart-collection__title').tagName).toEqual('H2');

    expect(c.querySelectorAll('figure.bdga-chart--embedded')).toHaveLength(2);
    // Panels drop their self-supplied wrappers; only the collection's own
    // container remains.
    expect(c.querySelectorAll('.container')).toHaveLength(1);
    expect(c.querySelector('.bdga-chart-block')).toBeNull();
    // Panel ids derive from the collection id; headings sit one level down.
    expect(c.querySelector('#test-collection__panel-1')).not.toBeNull();
    expect(c.querySelector('#test-collection__panel-2 h3')).not.toBeNull();
    assertUniqueCssClasses(c);
  });

  test('toolbar control targets every panel data table', async () => {
    const c = await dom(template, BASE, false);

    const btn = c.querySelector('[data-bdga-chart-collection-tables]');
    expect(btn).not.toBeNull();
    expect(btn.getAttribute('aria-expanded')).toEqual('false');
    expect(btn.getAttribute('aria-controls'))
      .toEqual('test-collection__panel-1__data test-collection__panel-2__data');
    expect(c.querySelectorAll('details.bdga-chart__data')).toHaveLength(2);
  });

  test('toolbar false renders no collection control', async () => {
    const c = await dom(template, { ...BASE, toolbar: false }, false);

    expect(c.querySelector('[data-bdga-chart-collection-tables]')).toBeNull();
  });

  test('forces the collection theme onto panels', async () => {
    const c = await dom(template, {
      ...BASE,
      theme: 'dark',
      panels: [{ ...PANELS[0], theme: 'light' }],
    }, false);

    const figure = c.querySelector('figure.bdga-chart');
    expect(figure.classList.contains('ct-theme-dark')).toBe(true);
  });

  test('renders nothing without panels', async () => {
    const c = await dom(template, { collection_id: 'test-empty', panels: [] }, false);

    expect(c.querySelector('.bdga-chart-collection')).toBeNull();
  });
});
