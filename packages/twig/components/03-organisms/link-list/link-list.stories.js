/**
 * digital.gov.au Link List component stories.
 */

// phpcs:ignoreFile
import Component from './link-list.twig';
import LinkListData from './link-list.stories.data';

const meta = {
  title: 'Lists/Link list',
  component: Component,
  tags: ['digitalgovau'],
  argTypes: {
    theme: {
      control: { type: 'radio' },
      options: ['light', 'dark'],
    },
    heading_level: {
      control: { type: 'number', min: 2, max: 6 },
    },
    variant: {
      control: { type: 'radio' },
      options: ['default', 'connected'],
    },
    title: {
      control: { type: 'text' },
    },
    items: {
      control: { type: 'object' },
    },
    modifier_class: {
      control: { type: 'text' },
    },
  },
};

export default meta;

export const LinkList = {
  parameters: {
    layout: 'padded',
  },
  args: LinkListData.args(),
};

export const Connected = {
  parameters: {
    layout: 'padded',
  },
  args: {
    ...LinkListData.args(),
    variant: 'connected',
  },
};

export const Dark = {
  parameters: {
    layout: 'padded',
  },
  globals: {
    backgrounds: { value: 'dark' },
  },
  args: LinkListData.args('dark'),
};
