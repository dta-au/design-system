/**
 * digital.gov.au Search Form component stories.
 */

// phpcs:ignoreFile
import Component from './search-form.twig';

const meta = {
  title: 'Search/Search bar/Search form',
  component: Component,
  tags: ['digitalgovau'],
  argTypes: {
    theme: {
      control: { type: 'radio' },
      options: ['light', 'dark'],
    },
    action: { control: { type: 'text' } },
    input_name: { control: { type: 'text' } },
    input_id: { control: { type: 'text' } },
    label: { control: { type: 'text' } },
    placeholder: { control: { type: 'text' } },
    value: { control: { type: 'text' } },
    button_text: { control: { type: 'text' } },
    modifier_class: { control: { type: 'text' } },
  },
};

export default meta;

export const SearchForm = {
  args: {
    theme: 'light',
    action: '/search',
    input_name: 'keywords',
    input_id: 'ct-search-form-input',
    label: 'Search',
    placeholder: null,
    value: null,
    button_text: 'Search',
    modifier_class: '',
  },
};

// Pre-filled keyword: input covers the inside-field label (has-value state).
export const SearchFormPrefilled = {
  args: {
    ...SearchForm.args,
    value: 'climate change',
  },
};
