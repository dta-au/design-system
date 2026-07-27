import DrupalAttribute from 'drupal-attribute';

const template = 'components/02-molecules/search-bar/search-bar.twig';

describe('Search Bar Component', () => {
  test('renders with default props', async () => {
    const c = await dom(template, {});

    const form = c.querySelector('.ct-search-bar');
    expect(form).not.toBeNull();
    expect(form.tagName.toLowerCase()).toEqual('form');
    expect(form.getAttribute('role')).toEqual('search');

    const label = c.querySelector('.ct-visually-hidden');
    expect(label).toBeTruthy();
    expect(label.textContent.trim()).toEqual('Search keywords');

    const input = c.querySelector('.ct-search-bar__input');
    expect(input).toBeTruthy();
    expect(input.getAttribute('type')).toEqual('search');
    expect(input.getAttribute('name')).toEqual('keywords');

    const button = c.querySelector('.ct-search-bar__button');
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('Search');

    assertUniqueCssClasses(c);
  });

  test('renders with custom label, placeholder, and button_text', async () => {
    const c = await dom(template, {
      label: 'Find content',
      placeholder: 'Search here...',
      button_text: 'Go',
    });

    const label = c.querySelector('.ct-visually-hidden');
    expect(label.textContent.trim()).toEqual('Find content');

    const input = c.querySelector('.ct-search-bar__input');
    expect(input.getAttribute('placeholder')).toEqual('Search here...');

    const button = c.querySelector('.ct-search-bar__button');
    expect(button.textContent).toContain('Go');

    assertUniqueCssClasses(c);
  });

  test('renders with pre-filled input_value', async () => {
    const c = await dom(template, {
      input_value: 'planning permits',
    });

    const input = c.querySelector('.ct-search-bar__input');
    expect(input.getAttribute('value')).toEqual('planning permits');

    assertUniqueCssClasses(c);
  });

  test('applies theme class', async () => {
    const c = await dom(template, {
      theme: 'dark',
    });

    const form = c.querySelector('.ct-search-bar');
    expect(form.classList.contains('ct-theme-dark')).toBe(true);

    assertUniqueCssClasses(c);
  });

  test('renders with modifier_class', async () => {
    const c = await dom(template, {
      modifier_class: 'custom-class',
    });

    const form = c.querySelector('.ct-search-bar');
    expect(form.classList.contains('custom-class')).toBe(true);

    assertUniqueCssClasses(c);
  });

  test('renders with attributes', async () => {
    const c = await dom(template, {
      attributes: new DrupalAttribute().setAttribute('data-test', 'true'),
    });

    const form = c.querySelector('.ct-search-bar');
    expect(form.getAttribute('data-test')).toEqual('true');

    assertUniqueCssClasses(c);
  });
});
