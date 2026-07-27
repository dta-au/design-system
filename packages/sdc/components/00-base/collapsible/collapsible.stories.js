import Component from './collapsible.stories.twig';

const meta = {
  title: 'Base/Utilities/Collapsible',
  component: Component,
  tags: ['!autodocs'],
};

export default meta;

export const Collapsible = {
  parameters: {
    layout: 'centered',
    html: {
      disable: true,
    },
  },
};
