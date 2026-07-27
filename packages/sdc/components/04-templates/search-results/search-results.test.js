import DrupalAttribute from 'drupal-attribute';

const template = 'components/04-templates/search-results/search-results.twig';

const sampleFilters = [
  {
    type: 'checkbox',
    label: 'Topic',
    name: 'topic',
    options: [
      { label: 'Planning', value: 'planning', count: 14 },
      { label: 'Environment', value: 'environment', count: 8 },
    ],
  },
  {
    type: 'radio',
    label: 'Content type',
    name: 'type',
    options: [
      { label: 'News', value: 'news' },
      { label: 'Events', value: 'events' },
    ],
  },
];

const sampleSortFilters = [
  {
    type: 'radio',
    label: 'Sort by',
    name: 'sort',
    options: [
      { label: 'Most relevant', value: 'relevance' },
      { label: 'Newest first', value: 'date-desc' },
    ],
  },
];

const sampleResults = [
  {
    title: 'First result title',
    url: 'http://example.com/first',
    description: 'First result description.',
  },
  {
    title: 'Second result title',
    url: 'http://example.com/second',
    description: 'Second result description.',
  },
];

describe('Search Results Template', () => {
  test('renders with default props', async () => {
    const c = await dom(template, {});

    expect(c.querySelector('.ct-search-results')).not.toBeNull();
    expect(c.querySelector('.ct-page')).not.toBeNull();

    assertUniqueCssClasses(c);
  });

  test('applies theme class', async () => {
    const c = await dom(template, { theme: 'dark' });

    const root = c.querySelector('.ct-search-results');
    expect(root.classList.contains('ct-theme-dark')).toBe(true);

    assertUniqueCssClasses(c);
  });

  test('applies modifier_class', async () => {
    const c = await dom(template, { modifier_class: 'custom-class' });

    const page = c.querySelector('.ct-page');
    expect(page.classList.contains('custom-class')).toBe(true);

    assertUniqueCssClasses(c);
  });

  test('renders with attributes', async () => {
    const c = await dom(template, {
      attributes: new DrupalAttribute().setAttribute('data-test', 'value'),
    });

    const page = c.querySelector('.ct-page');
    expect(page.getAttribute('data-test')).toEqual('value');

    assertUniqueCssClasses(c);
  });

  test('renders search slot', async () => {
    const c = await dom(template, {
      search: '<form class="ct-search-bar">Search form</form>',
    });

    expect(c.querySelector('.ct-search-results__search')).not.toBeNull();
    expect(c.querySelector('.ct-search-bar')).not.toBeNull();

    assertUniqueCssClasses(c);
  });

  test('renders results list', async () => {
    const c = await dom(template, {
      results: sampleResults,
      results_summary: 'Showing 1–2 of 2 results',
    });

    expect(c.querySelector('.ct-search-results__list')).not.toBeNull();
    expect(c.querySelectorAll('.ct-search-results__result')).toHaveLength(2);

    const summary = c.querySelector('.ct-search-results__summary');
    expect(summary).not.toBeNull();
    expect(summary.textContent.trim()).toEqual('Showing 1–2 of 2 results');

    assertUniqueCssClasses(c);
  });

  test('renders pagination slot', async () => {
    const c = await dom(template, {
      pagination: '<nav class="ct-pagination">Pagination</nav>',
    });

    expect(c.querySelector('.ct-search-results__pagination')).not.toBeNull();
    expect(c.querySelector('.ct-pagination')).not.toBeNull();

    assertUniqueCssClasses(c);
  });

  test('renders left layout filters in sidebar', async () => {
    const c = await dom(template, {
      filter_layout: 'left',
      filters: sampleFilters,
    });

    // Filters are in the sidebar slot.
    const sidebar = c.querySelector('.ct-layout__sidebar_top_left');
    expect(sidebar).not.toBeNull();
    expect(sidebar.querySelector('.ct-search-results__filters')).not.toBeNull();

    const groups = c.querySelectorAll('.ct-search-results__filter-group');
    expect(groups.length).toBeGreaterThanOrEqual(2);

    // Checkbox filter renders checkboxes.
    expect(c.querySelectorAll('.ct-checkbox').length).toBeGreaterThan(0);

    // Radio filter renders radios.
    expect(c.querySelectorAll('.ct-radio').length).toBeGreaterThan(0);

    // Apply and clear buttons are present.
    expect(c.querySelector('.ct-search-results__filter-apply')).not.toBeNull();
    expect(c.querySelector('.ct-search-results__filter-clear')).not.toBeNull();

    assertUniqueCssClasses(c);
  });

  test('renders horizontal layout with filter toggle', async () => {
    const c = await dom(template, {
      filter_layout: 'horizontal',
      filters: sampleFilters,
      sort_filters: sampleSortFilters,
    });

    const root = c.querySelector('.ct-search-results');
    expect(root.classList.contains('ct-search-results--horizontal')).toBe(true);

    // Sort controls render in the horizontal filter bar.
    expect(c.querySelector('.ct-group-filter__sort-filters')).not.toBeNull();

    // Mobile filter panel uses the core collapsible primitive (no bespoke JS).
    expect(c.querySelector('.ct-search-results__mobile-filters[data-collapsible]')).not.toBeNull();
    expect(c.querySelector('.ct-search-results__filter-toggle[data-collapsible-trigger]')).not.toBeNull();
    expect(c.querySelector('.ct-search-results__filter-groups[data-collapsible-panel]')).not.toBeNull();

    assertUniqueCssClasses(c);
  });

  test('renders date_range filter type', async () => {
    const c = await dom(template, {
      filter_layout: 'left',
      filters: [
        {
          type: 'date_range',
          label: 'Date range',
          name: 'date',
          options: [],
        },
      ],
    });

    const dateInputs = c.querySelectorAll('input[type="date"]');
    expect(dateInputs.length).toEqual(2);

    assertUniqueCssClasses(c);
  });

  test('renders without filters: no sidebar, results visible', async () => {
    const c = await dom(template, {
      filters: [],
      results: sampleResults,
    });

    expect(c.querySelector('.ct-search-results__filters')).toBeNull();
    expect(c.querySelector('.ct-layout__sidebar_top_left')).toBeNull();
    expect(c.querySelectorAll('.ct-search-results__result')).toHaveLength(2);

    assertUniqueCssClasses(c);
  });
});
