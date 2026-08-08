export default {
  args: (theme = 'light') => ({
    theme,
    title: 'Chapter',
    previous: {
      text: 'Executive summary',
      url: 'http://example.com',
      is_new_window: false,
      is_external: false,
    },
    next: {
      text: 'Whole-of-government adoption',
      url: 'http://example.com',
      is_new_window: false,
      is_external: false,
    },
    previous_label: 'Previous',
    next_label: 'Next',
    vertical_spacing: 'none',
    modifier_class: '',
    attributes: null,
  }),
};
