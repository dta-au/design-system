import DrupalAttribute from 'drupal-attribute';

const template = 'components/02-molecules/chapter-nav/chapter-nav.twig';

const previous = { text: 'Executive summary', url: 'https://example.com/exec' };
const next = { text: 'Productivity', url: 'https://example.com/productivity' };

describe('Chapter Nav Component', () => {
  test('renders both directions with their destination titles', async () => {
    const c = await dom(template, { previous, next });

    expect(c.querySelectorAll('.ct-chapter-nav')).toHaveLength(1);
    expect(c.querySelectorAll('.ct-chapter-nav__item')).toHaveLength(2);

    const previousLink = c.querySelector('.ct-chapter-nav__item--previous .ct-chapter-nav__link');
    expect(previousLink.getAttribute('href')).toEqual('https://example.com/exec');
    expect(previousLink.getAttribute('rel')).toEqual('prev');
    expect(previousLink.querySelector('.ct-chapter-nav__title').textContent.trim()).toEqual('Executive summary');

    const nextLink = c.querySelector('.ct-chapter-nav__item--next .ct-chapter-nav__link');
    expect(nextLink.getAttribute('href')).toEqual('https://example.com/productivity');
    expect(nextLink.getAttribute('rel')).toEqual('next');
    expect(nextLink.querySelector('.ct-chapter-nav__title').textContent.trim()).toEqual('Productivity');

    assertUniqueCssClasses(c);
  });

  test('renders only the next link on the first page', async () => {
    const c = await dom(template, { next });

    expect(c.querySelectorAll('.ct-chapter-nav__item--previous')).toHaveLength(0);
    expect(c.querySelectorAll('.ct-chapter-nav__item--next')).toHaveLength(1);
  });

  test('renders only the previous link on the last page', async () => {
    const c = await dom(template, { previous });

    expect(c.querySelectorAll('.ct-chapter-nav__item--previous')).toHaveLength(1);
    expect(c.querySelectorAll('.ct-chapter-nav__item--next')).toHaveLength(0);
  });

  test('does not render when neither direction has a url', async () => {
    const c = await dom(template, { previous: { text: 'No url' }, next: null });

    expect(c.querySelectorAll('.ct-chapter-nav')).toHaveLength(0);
  });

  test('names the landmark and the directions', async () => {
    const c = await dom(template, {
      previous,
      next,
      title: 'Criterion',
      previous_label: 'Back to',
      next_label: 'On to',
    });

    expect(c.querySelector('.ct-chapter-nav').getAttribute('aria-label')).toEqual('Criterion');

    const directions = Array.from(c.querySelectorAll('.ct-chapter-nav__direction'))
      .map((el) => el.textContent.trim());
    expect(directions).toEqual(['Back to:', 'On to:']);
  });

  test('hides the direction arrows from assistive technology', async () => {
    const c = await dom(template, { previous, next });

    const icons = c.querySelectorAll('.ct-chapter-nav__icon');
    expect(icons).toHaveLength(2);
    icons.forEach((icon) => expect(icon.getAttribute('aria-hidden')).toEqual('true'));
  });

  test('appends a new-tab notice instead of replacing the accessible name', async () => {
    const c = await dom(template, {
      next: { ...next, is_new_window: true },
    });

    const link = c.querySelector('.ct-chapter-nav__item--next .ct-chapter-nav__link');
    expect(link.getAttribute('target')).toEqual('_blank');
    expect(link.getAttribute('rel')).toEqual('next noopener noreferrer');
    expect(link.getAttribute('aria-label')).toBeNull();
    expect(link.querySelector('.ct-visually-hidden').textContent.trim()).toEqual('(opens in a new tab)');
    expect(link.textContent).toContain('Productivity');
  });

  test('renders with optional attributes', async () => {
    const c = await dom(template, {
      previous,
      next: { ...next, is_external: true },
      theme: 'dark',
      vertical_spacing: 'both',
      modifier_class: 'custom-class',
      attributes: new DrupalAttribute().setAttribute('data-test', 'true'),
    });

    const element = c.querySelector('.ct-chapter-nav');
    expect(element.classList.contains('ct-theme-dark')).toBe(true);
    expect(element.classList.contains('ct-vertical-spacing-inset--both')).toBe(true);
    expect(element.classList.contains('custom-class')).toBe(true);
    expect(element.getAttribute('data-test')).toEqual('true');

    const nextLink = c.querySelector('.ct-chapter-nav__item--next .ct-chapter-nav__link');
    expect(nextLink.classList.contains('ct-chapter-nav__link--external')).toBe(true);

    assertUniqueCssClasses(c);
  });
});
