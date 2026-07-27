const template = 'components/03-organisms/link-list/link-list.twig';

const sampleItems = [
  { title: 'First', url: 'https://example.com/first' },
  {
    title: 'Locked',
    is_secured: true,
    is_deactivated: true,
  },
];

describe('Link List', () => {
  test('renders nothing without items', async () => {
    const c = await dom(template, { items: [] });

    expect(c.querySelector('.ct-link-list')).toBeNull();
  });

  test('renders heading and one card per item', async () => {
    const c = await dom(template, { title: 'Related resources', items: sampleItems });

    expect(c.querySelector('.ct-link-list')).not.toBeNull();
    expect(c.querySelector('.ct-link-list__title')).not.toBeNull();
    expect(c.querySelector('.ct-link-list__items')).not.toBeNull();
    // One link-card rendered per item.
    expect(c.querySelectorAll('.ct-link-card')).toHaveLength(2);

    assertUniqueCssClasses(c);
  });

  test('passes item flags through to the card', async () => {
    const c = await dom(template, { items: sampleItems });

    // Secured + deactivated item -> deactivated secured card.
    expect(c.querySelector('.ct-link-card--secured')).not.toBeNull();
    expect(c.querySelector('.ct-link-card--deactivated')).not.toBeNull();

    assertUniqueCssClasses(c);
  });

  test('applies theme class', async () => {
    const c = await dom(template, { theme: 'dark', items: sampleItems });

    const root = c.querySelector('.ct-link-list');
    expect(root.classList.contains('ct-theme-dark')).toBe(true);

    assertUniqueCssClasses(c);
  });

  test('connected variant adds its modifier class', async () => {
    const c = await dom(template, { variant: 'connected', items: sampleItems });

    expect(c.querySelector('.ct-link-list--connected')).not.toBeNull();

    assertUniqueCssClasses(c);
  });

  test('defaults to the ungrouped variant', async () => {
    const c = await dom(template, { items: sampleItems });

    expect(c.querySelector('.ct-link-list--default')).not.toBeNull();
    expect(c.querySelector('.ct-link-list--connected')).toBeNull();

    assertUniqueCssClasses(c);
  });
});
