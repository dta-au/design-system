export default {
  args: (theme = 'light') => ({
    theme,
    title: 'Related resources',
    items: [
      {
        variant: 'default',
        title: 'Apply for a grant',
        url: 'https://example.com/apply',
      },
      {
        variant: 'default',
        title: 'Grant guidelines (secure)',
        url: 'https://example.com/secure/grant-guidelines',
        is_secured: true,
      },
      {
        variant: 'default',
        title: 'Visit the national portal',
        url: 'https://national.example.gov',
        is_external: true,
        is_new_window: true,
      },
      {
        variant: 'download',
        title: 'Annual report 2025',
        url: 'https://example.com/annual-report.pdf',
        file_extension: 'PDF',
        file_size: '1.2 MB',
      },
      {
        variant: 'download',
        title: 'Cabinet submission',
        url: 'https://example.com/secure/cabinet-submission.pdf',
        file_extension: 'PDF',
        file_size: '3.4 MB',
        is_secured: true,
      },
      {
        variant: 'default',
        title: 'Board minutes (sign in to access)',
        url: '',
        is_secured: true,
        is_deactivated: true,
      },
    ],
    modifier_class: '',
    attributes: null,
  }),
};
