/**
 * digital.gov.au Search Results Page Template component stories.
 */

import Component from './search-results.twig';
import SearchResultsData from './search-results.stories.data';

const meta = {
  title: 'Page types/Search results',
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
    filter_layout: {
      control: { type: 'radio' },
      options: ['left', 'horizontal'],
    },
    filter_label: { control: { type: 'text' } },
    filter_toggle_label: { control: { type: 'text' } },
    search: { control: { type: 'text' } },
    filters: { control: { type: 'object' } },
    sort_filters: { control: { type: 'object' } },
    results_summary: { control: { type: 'text' } },
    results: { control: { type: 'object' } },
    pagination: { control: { type: 'text' } },
    apply_label: { control: { type: 'text' } },
    clear_label: { control: { type: 'text' } },
    header_theme: { control: { type: 'radio' }, options: ['light', 'dark'] },
    footer_theme: { control: { type: 'radio' }, options: ['light', 'dark'] },
    modifier_class: { control: { type: 'text' } },
  },
};

export default meta;

export const SearchResultsLeft = {
  parameters: { layout: 'fullscreen' },
  args: SearchResultsData.args('light'),
};

export const SearchResultsLeftDark = {
  parameters: { layout: 'fullscreen' },
  args: SearchResultsData.args('dark'),
  globals: { backgrounds: { value: 'dark' } },
};

export const SearchResultsHorizontal = {
  parameters: { layout: 'fullscreen' },
  args: SearchResultsData.args('light', { filter_layout: 'horizontal' }),
};

export const SearchResultsHorizontalDark = {
  parameters: { layout: 'fullscreen' },
  args: SearchResultsData.args('dark', { filter_layout: 'horizontal' }),
  globals: { backgrounds: { value: 'dark' } },
};

export const SearchResultsNoFilters = {
  parameters: { layout: 'fullscreen' },
  args: SearchResultsData.args('light', { no_filters: true }),
};
