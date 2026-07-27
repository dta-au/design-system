const config = {
  stories: [
    '../components/**/*.mdx',
    '../components/**/*.stories.js',
  ],
  // Reference addons and the framework by bare package name. Storybook 10
  // resolves them itself; the older getAbsolutePath() helper
  // (require.resolve('<pkg>/package.json')) is deprecated and throws
  // ERR_PACKAGE_PATH_NOT_EXPORTED for packages whose exports map omits
  // ./package.json (e.g. some @storybook/addon-a11y builds).
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-links',
    '@whitespace/storybook-addon-html',
    '@storybook/addon-docs',
  ],
  framework: {
    name: '@storybook/html-vite',
    options: {},
  },
  staticDirs: [{ from: '../dist/assets', to: '/assets' }, './static'],
};

export default config;
