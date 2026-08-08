/**
 * CivicTheme Chapter Nav component stories.
 */

import Component from './chapter-nav.twig';
import ChapterNavData from './chapter-nav.stories.data';

const meta = {
  title: 'Molecules/Chapter Nav',
  component: Component,
  argTypes: {
    theme: {
      control: { type: 'radio' },
      options: ['light', 'dark'],
    },
    title: {
      control: { type: 'text' },
    },
    previous: {
      control: { type: 'object' },
    },
    next: {
      control: { type: 'object' },
    },
    previous_label: {
      control: { type: 'text' },
    },
    next_label: {
      control: { type: 'text' },
    },
    vertical_spacing: {
      control: { type: 'radio' },
      options: ['top', 'bottom', 'both', 'none'],
    },
    modifier_class: {
      control: { type: 'text' },
    },
  },
};

export default meta;

export const ChapterNav = {
  parameters: {
    layout: 'padded',
  },
  args: ChapterNavData.args('light'),
};

// The dark theme pairs with the dark canvas; the backgrounds global does not
// follow the theme arg, so an unpaired dark story reads as failing contrast.
export const Dark = {
  parameters: {
    layout: 'padded',
  },
  args: ChapterNavData.args('dark'),
  globals: {
    backgrounds: { value: 'dark' },
  },
};

// The first page has nothing behind it, so only the next link renders.
export const FirstInSequence = {
  parameters: {
    layout: 'padded',
  },
  args: {
    ...ChapterNavData.args('light'),
    previous: null,
  },
};

// The last page has nothing ahead of it, so only the previous link renders.
export const LastInSequence = {
  parameters: {
    layout: 'padded',
  },
  args: {
    ...ChapterNavData.args('light'),
    next: null,
  },
};

// Numbered criteria and framework steps relabel the landmark and directions.
export const NumberedCriteria = {
  parameters: {
    layout: 'padded',
  },
  args: {
    ...ChapterNavData.args('light'),
    title: 'Criterion',
    previous: {
      text: 'Criterion 2: Understand user needs',
      url: 'http://example.com',
    },
    next: {
      text: 'Criterion 4: Keep improving',
      url: 'http://example.com',
    },
  },
};
