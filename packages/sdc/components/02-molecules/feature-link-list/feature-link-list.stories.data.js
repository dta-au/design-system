// phpcs:ignoreFile
export default {
  args: (theme = 'light') => ({
    theme,
    title: 'Feature links',
    vertical_spacing: null,
    with_background: false,
    items: [
      {
        title: 'About the department',
        description: 'Our mission, vision and structure.',
        url: 'https://example.com/about',
        is_external: false,
        is_new_window: false,
      },
      {
        title: 'News and media',
        description: 'Latest announcements and press releases.',
        url: 'https://example.com/news',
        is_external: false,
        is_new_window: false,
      },
      {
        title: 'Contact us',
        url: 'https://example.com/contact',
        is_external: false,
        is_new_window: false,
      },
      {
        title: 'Data.gov.au',
        description: 'Open government data portal.',
        url: 'https://data.gov.au',
        is_external: true,
        is_new_window: true,
      },
    ],
    modifier_class: '',
    attributes: null,
  }),
};
