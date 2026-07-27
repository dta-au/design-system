import DrupalAttribute from 'drupal-attribute';

const template = 'components/02-molecules/tabs/tabs.twig';

describe('Tabs Component', () => {
  test('renders with required attributes', async () => {
    const c = await dom(template, {
      panels: [
        { title: 'Tab 1', content: 'Content for Tab 1', id: 'tab1', is_selected: true },
        { title: 'Tab 2', content: 'Content for Tab 2', id: 'tab2', is_selected: false },
      ],
    });

    expect(c.querySelectorAll('.ct-tabs')).toHaveLength(1);
    expect(c.querySelectorAll('.ct-tabs__links a')).toHaveLength(2);
    expect(c.querySelectorAll('.ct-tabs__panels__panel')).toHaveLength(2);

    const selectedPanel = c.querySelector('.ct-tabs__panels__panel.selected');
    expect(selectedPanel).not.toBeNull();
    expect(selectedPanel.getAttribute('id')).toEqual('tab1');
    expect(selectedPanel.textContent.trim()).toEqual('Content for Tab 1');

    assertUniqueCssClasses(c);
  });

  test('renders with optional attributes', async () => {
    const c = await dom(template, {
      panels: [
        { title: 'Tab 1', content: 'Content for Tab 1', id: 'tab1', is_selected: true },
        { title: 'Tab 2', content: 'Content for Tab 2', id: 'tab2', is_selected: false },
      ],
      theme: 'dark',
      vertical_spacing: 'both',
      attributes: new DrupalAttribute().setAttribute('data-test', 'true'),
      modifier_class: 'custom-class',
    });

    const element = c.querySelector('.ct-tabs');
    expect(element).not.toBeNull();
    expect(element.classList.contains('ct-theme-dark')).toBe(true);
    expect(element.classList.contains('ct-vertical-spacing--both')).toBe(true);
    expect(element.classList.contains('custom-class')).toBe(true);
    expect(element.getAttribute('data-test')).toEqual('true');

    assertUniqueCssClasses(c);
  });

  test('does not render when panels are empty', async () => {
    const c = await dom(template, {
      panels: [],
    });

    expect(c.querySelectorAll('.ct-tabs')).toHaveLength(0);
  });

  test('renders with generated links from panels', async () => {
    const c = await dom(template, {
      panels: [
        { title: 'Tab 1', content: 'Content for Tab 1', id: 'tab1', is_selected: true },
        { title: 'Tab 2', content: 'Content for Tab 2', id: 'tab2', is_selected: false },
      ],
    });

    const links = c.querySelectorAll('.ct-tabs__links a');
    expect(links).toHaveLength(2);

    expect(links[0].getAttribute('href')).toEqual('#tab1-tab');
    expect(links[0].getAttribute('aria-controls')).toEqual('tab1');

    expect(links[1].getAttribute('href')).toEqual('#tab2-tab');
    expect(links[1].getAttribute('aria-controls')).toEqual('tab2');

    assertUniqueCssClasses(c);
  });

  test('marks the active link via is_active (links-only)', async () => {
    const c = await dom(template, {
      links: [
        { text: 'All', url: '#all', is_active: true },
        { text: 'Platform', url: '#platform' },
      ],
    });

    const links = c.querySelectorAll('.ct-tabs__links a');
    expect(links).toHaveLength(2);

    expect(links[0].classList.contains('ct-tabs__tab--selected')).toBe(true);
    // Links-only tabs are navigation links to separate URLs.
    expect(links[0].getAttribute('aria-current')).toEqual('page');

    expect(links[1].classList.contains('ct-tabs__tab--selected')).toBe(false);
    expect(links[1].getAttribute('aria-current')).toBeNull();

    assertUniqueCssClasses(c);
  });

  test('aria_current can be overridden', async () => {
    const c = await dom(template, {
      links: [{ text: 'All', url: '#all', is_active: true }],
      aria_current: 'true',
    });

    expect(c.querySelector('.ct-tabs__links a').getAttribute('aria-current')).toEqual('true');
  });

  test('renders an optional count inside the link, omitting it when absent', async () => {
    const c = await dom(template, {
      links: [
        { text: 'All', url: '#all', is_active: true, count: 128 },
        { text: 'Pattern', url: '#pattern', count: 0 },
        { text: 'Community', url: '#community' },
      ],
    });

    const links = c.querySelectorAll('.ct-tabs__links a');

    // Count sits inside the anchor so it stays part of the accessible name.
    expect(links[0].querySelector('.ct-tabs__count').textContent).toEqual('(128)');
    expect(links[0].textContent.replace(/\s+/g, ' ').trim()).toEqual('All (128)');

    // Zero is a meaningful facet count and must still render.
    expect(links[1].querySelector('.ct-tabs__count').textContent).toEqual('(0)');

    // No count supplied - degrades to the label alone.
    expect(links[2].querySelector('.ct-tabs__count')).toBeNull();
    expect(links[2].textContent.trim()).toEqual('Community');

    assertUniqueCssClasses(c);
  });

  test('collapse_mobile wraps links in a Details disclosure with the active label', async () => {
    const c = await dom(template, {
      collapse_mobile: true,
      collapse_label: 'Filters',
      links: [
        { text: 'All', url: '#all', is_active: true },
        { text: 'Platform', url: '#platform' },
      ],
    });

    const details = c.querySelector('.ct-tabs__disclosure');
    expect(details).not.toBeNull();
    expect(details.tagName.toLowerCase()).toEqual('details');
    expect(c.querySelector('.ct-tabs__disclosure__summary')).not.toBeNull();

    // Summary label is the active link's text.
    expect(c.querySelector('.ct-tabs__disclosure__label').textContent.trim()).toEqual('All');

    // The full link list still renders inside the disclosure.
    expect(c.querySelectorAll('.ct-tabs__disclosure .ct-tabs__links a')).toHaveLength(2);

    assertUniqueCssClasses(c);
  });

  test('collapse_mobile summary falls back to collapse_label when no link is active', async () => {
    const c = await dom(template, {
      collapse_mobile: true,
      collapse_label: 'Filters',
      links: [
        { text: 'All', url: '#all' },
        { text: 'Platform', url: '#platform' },
      ],
    });

    expect(c.querySelector('.ct-tabs__disclosure__label').textContent.trim()).toEqual('Filters');
  });

  test('does not render the disclosure without collapse_mobile', async () => {
    const c = await dom(template, {
      links: [
        { text: 'All', url: '#all', is_active: true },
        { text: 'Platform', url: '#platform' },
      ],
    });

    expect(c.querySelector('.ct-tabs__disclosure')).toBeNull();
    expect(c.querySelectorAll('.ct-tabs__links a')).toHaveLength(2);
  });
});
