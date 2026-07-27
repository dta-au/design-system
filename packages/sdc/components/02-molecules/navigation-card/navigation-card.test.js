import DrupalAttribute from 'drupal-attribute';

const template = 'components/02-molecules/navigation-card/navigation-card.twig';

describe('Navigation Card Component', () => {
  test('renders with required attributes', async () => {
    const c = await dom(template, {
      title: 'Card Title',
      summary: 'This is a summary of the card.',
    });

    expect(c.querySelectorAll('.ct-navigation-card')).toHaveLength(1);
    expect(c.querySelector('.ct-navigation-card__title').textContent.trim()).toEqual('Card Title');
    expect(c.querySelector('.ct-navigation-card__summary').textContent.trim()).toEqual('This is a summary of the card.');

    assertUniqueCssClasses(c);
  });

  test('renders with optional attributes, with icon', async () => {
    const c = await dom(template, {
      content_top: 'Top content',
      image_over: 'Image over content',
      content_middle: 'Middle content',
      content_bottom: 'Bottom content',
      image: { url: 'https://example.com/image.jpg', alt: 'Image description' },
      image_as_icon: true,
      icon: 'call',
      title: 'Card Title',
      summary: 'This is a summary of the card.',
      link: { text: 'Learn more', url: 'https://example.com', is_new_window: true, is_external: true },
      theme: 'dark',
      attributes: new DrupalAttribute().setAttribute('data-test', 'true'),
      modifier_class: 'custom-class',
    });

    const element = c.querySelector('.ct-navigation-card');
    expect(element).not.toBeNull();
    expect(element.classList.contains('ct-theme-dark')).toBe(true);
    expect(element.classList.contains('custom-class')).toBe(true);
    expect(element.getAttribute('data-test')).toEqual('true');

    expect(c.querySelector('.ct-navigation-card__content-top').textContent.trim()).toEqual('Top content');
    expect(c.querySelector('.ct-navigation-card__content-middle').textContent.trim()).toEqual('Middle content');
    expect(c.querySelector('.ct-navigation-card__content-bottom').textContent.trim()).toEqual('Bottom content');
    expect(c.querySelector('.ct-navigation-card__title').textContent.trim()).toContain('Card Title');
    expect(c.querySelector('.ct-navigation-card__summary').textContent.trim()).toEqual('This is a summary of the card.');

    const image = c.querySelector('.ct-navigation-card__image img');
    expect(image).toBeNull();

    const icon = c.querySelector('.ct-navigation-card__icon');
    expect(icon).toBeTruthy();

    const link = c.querySelector('.ct-navigation-card__title-link');
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toEqual('https://example.com');
    expect(link.getAttribute('target')).toEqual('_blank');

    assertUniqueCssClasses(c);
  });

  test('renders with optional attributes, no icon, image as not icon', async () => {
    const c = await dom(template, {
      content_top: 'Top content',
      image_over: 'Image over content',
      content_middle: 'Middle content',
      content_bottom: 'Bottom content',
      image: { url: 'https://example.com/image.jpg', alt: 'Image description' },
      image_as_icon: false,
      icon: '',
      title: 'Card Title',
      summary: 'This is a summary of the card.',
      link: { text: 'Learn more', url: 'https://example.com', is_new_window: true, is_external: true },
      theme: 'dark',
      attributes: new DrupalAttribute().setAttribute('data-test', 'true'),
      modifier_class: 'custom-class',
    });

    const element = c.querySelector('.ct-navigation-card');
    expect(element).not.toBeNull();
    expect(element.classList.contains('ct-theme-dark')).toBe(true);
    expect(element.classList.contains('custom-class')).toBe(true);
    expect(element.getAttribute('data-test')).toEqual('true');

    expect(c.querySelector('.ct-navigation-card__content-top').textContent.trim()).toEqual('Top content');
    expect(c.querySelector('.ct-navigation-card__content-middle').textContent.trim()).toEqual('Middle content');
    expect(c.querySelector('.ct-navigation-card__content-bottom').textContent.trim()).toEqual('Bottom content');
    expect(c.querySelector('.ct-navigation-card__title').textContent.trim()).toContain('Card Title');
    expect(c.querySelector('.ct-navigation-card__summary').textContent.trim()).toEqual('This is a summary of the card.');

    const image = c.querySelector('.ct-navigation-card__image img');
    expect(image).toBeTruthy();
    expect(image.getAttribute('src')).toEqual('https://example.com/image.jpg');
    expect(image.getAttribute('alt')).toEqual('Image description');

    const icon = c.querySelector('.ct-navigation-card__icon');
    expect(icon).toBeNull();

    const link = c.querySelector('.ct-navigation-card__title-link');
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toEqual('https://example.com');
    expect(link.getAttribute('target')).toEqual('_blank');

    assertUniqueCssClasses(c);
  });

  test('does not render when title is empty', async () => {
    const c = await dom(template, {
      title: '',
      summary: 'This is a summary of the card.',
    });

    expect(c.querySelectorAll('.ct-navigation-card')).toHaveLength(0);
  });

  test('renders with image as icon', async () => {
    const c = await dom(template, {
      title: 'Card Title',
      image: { url: 'https://example.com/image.jpg', alt: 'Image description' },
      image_as_icon: true,
    });

    const icon = c.querySelector('.ct-navigation-card__icon');
    expect(icon).toBeTruthy();
    const imageIcon = icon.querySelector('img');
    expect(imageIcon).toBeTruthy();
    expect(imageIcon.getAttribute('src')).toEqual('https://example.com/image.jpg');
    expect(imageIcon.getAttribute('alt')).toEqual('Image description');

    assertUniqueCssClasses(c);
  });

  test('renders with link when provided', async () => {
    const c = await dom(template, {
      title: 'Card Title',
      summary: 'This is a summary of the card.',
      link: { text: 'Learn more', url: 'https://example.com' },
    });

    const link = c.querySelector('.ct-navigation-card__title-link');
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toEqual('https://example.com');

    assertUniqueCssClasses(c);
  });

  test('index variant renders its modifier class and moves the arrow onto the title', async () => {
    const c = await dom(template, {
      variant: 'index',
      title: 'Card Title',
      summary: 'This is a summary of the card.',
      link: { text: 'Learn more', url: 'https://example.com' },
    });

    const element = c.querySelector('.ct-navigation-card');
    expect(element.classList.contains('ct-navigation-card--index')).toBe(true);
    // The whole card stays the click target, exactly as on the default variant.
    expect(element.classList.contains('ct-navigation-card--card-clickable')).toBe(true);

    // text-icon groups the last word with the arrow, so it cannot orphan.
    const group = c.querySelector('.ct-navigation-card__title-link .ct-text-icon__group');
    expect(group).toBeTruthy();
    expect(group.textContent.trim()).toEqual('Title');

    const icon = group.querySelector('.ct-icon');
    expect(icon).toBeTruthy();
    expect(icon.getAttribute('aria-hidden')).toEqual('true');
    expect(c.querySelector('.ct-navigation-card__link-graphic')).toBeNull();

    // The decorative arrow must not leak into the link's accessible name.
    expect(c.querySelector('.ct-navigation-card__title-link').textContent.trim()).toEqual('Card Title');

    assertUniqueCssClasses(c);
  });

  test('default variant keeps the bottom arrow and emits no variant modifier', async () => {
    const c = await dom(template, {
      title: 'Card Title',
      summary: 'This is a summary of the card.',
      link: { text: 'Learn more', url: 'https://example.com' },
    });

    const element = c.querySelector('.ct-navigation-card');
    expect(element.className).not.toContain('ct-navigation-card--index');
    expect(element.className).not.toContain('ct-navigation-card--default');
    expect(c.querySelector('.ct-navigation-card__link-graphic')).toBeTruthy();
    expect(c.querySelector('.ct-navigation-card__title-link .ct-text-icon__group')).toBeNull();

    assertUniqueCssClasses(c);
  });

  test('index variant renders no arrow when only the title is clickable', async () => {
    const c = await dom(template, {
      variant: 'index',
      title: 'Card Title',
      link: { text: 'Learn more', url: 'https://example.com' },
      is_title_click: true,
    });

    expect(c.querySelector('.ct-navigation-card__title-link .ct-text-icon__group')).toBeNull();
    expect(c.querySelector('.ct-navigation-card__link-graphic')).toBeNull();

    assertUniqueCssClasses(c);
  });
});
