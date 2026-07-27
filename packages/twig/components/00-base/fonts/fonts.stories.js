import Component from './fonts.stories.twig';
import Constants from '../../../dist/constants.json';

const meta = {
  title: 'Base/Fonts',
  component: Component,
  argTypes: {
    fonts: {
      table: {
        disable: true,
      },
    },
    weights: {
      table: {
        disable: true,
      },
    },
  },
};

export default meta;

// The family string is a quoted SCSS list ('"Archivo", "Arimo", sans-serif');
// the first entry is the face itself, the rest are fallbacks.
const familyName = (font) => String(font.family)
  .replace(/^'|'$/g, '')
  .split(',')[0]
  .replace(/^"|"$/g, '')
  .trim();

export const Fonts = {
  parameters: {
    layout: 'centered',
    html: {
      disable: true,
    },
  },
  args: {
    fonts: Object.entries({
      ...Constants.SCSS_VARIABLES['ct-fonts-default'],
      ...Constants.SCSS_VARIABLES['ct-fonts'],
    }).map(([key, font]) => ({
      key,
      name: familyName(font),
    })),
    weights: Object.keys({
      ...Constants.SCSS_VARIABLES['ct-font-weights-default'],
      ...Constants.SCSS_VARIABLES['ct-font-weights'],
    }),
  },
};
