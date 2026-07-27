/**
 * CivicTheme Breadcrumb component stories.
 */

import Components from './breadcrumb.twig';

const meta = {
  title: 'Molecules/Breadcrumb',
  component: Components,
  argTypes: {
    theme: {
      control: { type: 'radio' },
      options: ['light', 'dark'],
    },
    links: {
      control: { type: 'object' },
      description: 'Trail ending at the parent page. Do not include the current page.',
    },
    modifier_class: {
      control: { type: 'text' },
    },
  },
};

export default meta;

export const Breadcrumb = {
  parameters: {
    layout: 'centered',
  },
  args: {
    theme: 'light',
    links: [
      {
        text: 'Home',
        url: 'https://example.com',
      },
      {
        text: 'Grants and programs',
        url: 'https://example.com/grants-and-programs',
      },
      {
        text: 'Research and development',
        url: 'https://example.com/grants-and-programs/research-and-development',
      },
    ],
    modifier_class: '',
    attributes: null,
  },
};
