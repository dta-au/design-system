/**
 * CivicTheme Tabs component stories.
 */

import DrupalAttribute from 'drupal-attribute';
import Component from './tabs.twig';

const meta = {
  title: 'Molecules/Tabs',
  component: Component,
  argTypes: {
    theme: {
      control: { type: 'radio' },
      options: ['light', 'dark'],
    },
    variant: {
      control: { type: 'radio' },
      options: ['default', 'underline'],
    },
    panels: {
      control: { type: 'array' },
    },
    links: {
      control: { type: 'array' },
    },
    vertical_spacing: {
      control: { type: 'radio' },
      options: ['none', 'top', 'bottom', 'both'],
    },
    collapse_mobile: {
      control: { type: 'boolean' },
    },
    collapse_label: {
      control: { type: 'text' },
    },
    modifier_class: {
      control: { type: 'text' },
    },
  },
};

export default meta;

export const Tabs = {
  parameters: {
    layout: 'centered',
  },
  args: {
    theme: 'light',
    panels: [
      {
        title: 'Panel title',
        content: 'Panel content',
        id: 'panel-1',
        is_selected: true,
      },
      {
        title: 'Panel title 2',
        content: 'Panel content 2',
        id: 'panel-2',
        is_selected: false,
      },
    ],
    links: [
      {
        text: 'Link text',
        url: 'https://example.com',
        is_new_window: false,
        is_external: false,
        modifier_class: '',
        attributes: new DrupalAttribute([
          ['id', 'panel-1-tab'],
        ]),
      },
      {
        text: 'Link text 2',
        url: 'https://example.com',
        is_new_window: false,
        is_external: false,
        modifier_class: '',
        attributes: new DrupalAttribute([
          ['id', 'panel-2-tab'],
        ]),
      },
    ],
    vertical_spacing: 'none',
    attributes: null,
    modifier_class: '',
  },
};

export const TabsUnderline = {
  parameters: {
    layout: 'padded',
  },
  args: {
    theme: 'light',
    variant: 'underline',
    links: [
      {
        text: 'All',
        url: 'https://example.com/all',
        is_active: true,
      },
      {
        text: 'Capability',
        url: 'https://example.com/capability',
      },
      {
        text: 'Platform',
        url: 'https://example.com/platform',
      },
      {
        text: 'Pattern',
        url: 'https://example.com/pattern',
      },
      {
        text: 'Community',
        url: 'https://example.com/community',
      },
      {
        text: 'Example',
        url: 'https://example.com/example',
      },
    ],
    vertical_spacing: 'none',
    attributes: null,
    modifier_class: '',
  },
};

export const TabsUnderlineWithCounts = {
  parameters: {
    layout: 'padded',
  },
  args: {
    theme: 'light',
    variant: 'underline',
    links: [
      {
        text: 'All',
        url: 'https://example.com/all',
        is_active: true,
        count: 128,
      },
      {
        text: 'Capability',
        url: 'https://example.com/capability',
        count: 42,
      },
      {
        text: 'Platform',
        url: 'https://example.com/platform',
        count: 17,
      },
      {
        text: 'Pattern',
        url: 'https://example.com/pattern',
        count: 0,
      },
      {
        text: 'Community',
        url: 'https://example.com/community',
      },
    ],
    vertical_spacing: 'none',
    attributes: null,
    modifier_class: '',
  },
};

export const TabsCollapseMobile = {
  parameters: {
    layout: 'padded',
  },
  // The disclosure only exists below the m breakpoint; pin the canvas there
  // so the story shows it (mirrors mobile-navigation).
  globals: {
    viewport: {
      value: 'xs',
      isRotated: false,
    },
  },
  args: {
    theme: 'light',
    collapse_mobile: true,
    collapse_label: 'Filters',
    links: [
      {
        text: 'All',
        url: 'https://example.com/all',
        is_active: true,
      },
      {
        text: 'Platform',
        url: 'https://example.com/platform',
      },
      {
        text: 'Pattern',
        url: 'https://example.com/pattern',
      },
      {
        text: 'Community',
        url: 'https://example.com/community',
      },
    ],
    vertical_spacing: 'none',
    attributes: null,
    modifier_class: '',
  },
};
