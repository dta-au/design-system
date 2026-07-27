/**
 * digital.gov.au Search Bar component stories.
 */

import Component from './search-bar.twig';
import SearchBarData from './search-bar.stories.data';

const meta = {
  title: 'Search/Search bar',
  component: Component,
  tags: ['digitalgovau'],
  argTypes: {
    theme: {
      control: { type: 'radio' },
      options: ['light', 'dark'],
    },
    label: {
      control: { type: 'text' },
    },
    placeholder: {
      control: { type: 'text' },
    },
    button_text: {
      control: { type: 'text' },
    },
    action: {
      control: { type: 'text' },
    },
    method: {
      control: { type: 'radio' },
      options: ['get', 'post'],
    },
    input_name: {
      control: { type: 'text' },
    },
    input_value: {
      control: { type: 'text' },
    },
    modifier_class: {
      control: { type: 'text' },
    },
  },
};

export default meta;

export const SearchBar = {
  parameters: {
    layout: 'padded',
  },
  args: SearchBarData.args('light'),
};

export const SearchBarDark = {
  parameters: {
    layout: 'padded',
  },
  args: SearchBarData.args('dark'),
  globals: {
    backgrounds: {
      value: 'dark',
    },
  },
};

export const SearchBarPrefilled = {
  parameters: {
    layout: 'padded',
  },
  args: {
    ...SearchBarData.args('light'),
    input_value: 'planning permits',
  },
};

export const SearchBarPrefilledDark = {
  parameters: {
    layout: 'padded',
  },
  args: {
    ...SearchBarData.args('dark'),
    input_value: 'planning permits',
  },
  globals: {
    backgrounds: {
      value: 'dark',
    },
  },
};
