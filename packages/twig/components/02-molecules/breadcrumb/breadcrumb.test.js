import DrupalAttribute from 'drupal-attribute';

const template = 'components/02-molecules/breadcrumb/breadcrumb.twig';

// The trail ends at the parent page, so 'Subcategory' is the parent of the
// current page and not the current page itself.
const links = [
  { text: 'Home', url: '/' },
  { text: 'Category', url: '/category' },
  { text: 'Subcategory', url: '/category/subcategory' },
];

describe('Breadcrumb Component', () => {
  test('renders with required attributes', async () => {
    const c = await dom(template, { links });

    expect(c.querySelectorAll('.ct-breadcrumb')).toHaveLength(1);

    const renderedLinks = c.querySelectorAll('.ct-breadcrumb__links__link');
    expect(renderedLinks).toHaveLength(4);

    // Mobile collapses to a back-link to the parent, which is the last item.
    expect(renderedLinks[0].textContent.trim()).toEqual('Subcategory');

    // Desktop.
    expect(renderedLinks[1].textContent.trim()).toEqual('Home');
    expect(renderedLinks[2].textContent.trim()).toEqual('Category');
    expect(renderedLinks[3].textContent.trim()).toEqual('Subcategory');

    const separators = c.querySelectorAll('.ct-breadcrumb__links__separator');
    expect(separators).toHaveLength(2);

    assertUniqueCssClasses(c);
  });

  test('renders with optional attributes', async () => {
    const c = await dom(template, {
      links,
      theme: 'dark',
      attributes: new DrupalAttribute().setAttribute('data-test', 'true'),
      modifier_class: 'custom-class',
    });

    expect(c.querySelectorAll('.ct-breadcrumb.custom-class.ct-theme-dark')).toHaveLength(1);
    expect(c.querySelector('.ct-breadcrumb').getAttribute('data-test')).toEqual('true');

    assertUniqueCssClasses(c);
  });

  test('renders without links', async () => {
    const c = await dom(template, {
      links: [],
    });

    expect(c.querySelectorAll('.ct-breadcrumb')).toHaveLength(0);
  });

  test('renders every item as a link with no current-page marker', async () => {
    const c = await dom(template, { links });

    const renderedLinks = c.querySelectorAll('.ct-breadcrumb__links__link');
    renderedLinks.forEach((link) => {
      expect(link.tagName).toEqual('A');
      expect(link.hasAttribute('href')).toBe(true);
    });

    expect(c.querySelectorAll('.ct-breadcrumb__links__link--active')).toHaveLength(0);
    expect(c.querySelectorAll('[aria-current]')).toHaveLength(0);

    assertUniqueCssClasses(c);
  });

  test('ignores the deprecated active_is_link prop', async () => {
    const c = await dom(template, {
      links,
      active_is_link: false,
    });

    const renderedLinks = c.querySelectorAll('.ct-breadcrumb__links__link');
    expect(renderedLinks).toHaveLength(4);
    renderedLinks.forEach((link) => {
      expect(link.tagName).toEqual('A');
    });
  });
});
