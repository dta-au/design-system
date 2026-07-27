import { create } from 'storybook/theming';

export default create({
  base: 'light',

  brandTitle: 'digital.gov.au design system',
  brandUrl: 'https://github.com/dta-au/design-system',
  brandImage: './assets/logos/digital.gov.au-docs.svg',
  brandTarget: '_self',

  colorPrimary: '#0064a8',
  colorSecondary: '#0064a8',

  appBg: '#ebedf0',
  appContentBg: '#ffffff',
  appPreviewBg: '#ffffff',
  appBorderColor: '#c5cad1',
  appBorderRadius: 4,

  textColor: '#1f2329',
  textInverseColor: '#ffffff',

  barBg: '#ebedf0',
  barTextColor: '#5a6675',
  barSelectedColor: '#0064a8',
  barHoverColor: '#0064a8',

  inputBg: '#ffffff',
  inputBorder: '#c5cad1',
  inputTextColor: '#1f2329',
  inputBorderRadius: 4,
});
