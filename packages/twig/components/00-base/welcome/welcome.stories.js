import Component from './welcome.stories.twig';

const meta = {
  title: 'Welcome',
  component: Component,
  tags: ['!autodocs'],
};

export default meta;

export const Welcome = {
  parameters: {
    layout: 'fullscreen',
    html: {
      disable: true,
    },
  },
};
