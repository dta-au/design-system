import Component from './responsive.stories.twig';

const meta = {
  title: 'Base/Utilities/Responsive',
  component: Component,
  tags: ['!autodocs'],
};

export default meta;

export const Responsive = {
  parameters: {
    layout: 'centered',
    html: {
      disable: true,
    },
  },
};
