/**
 * digital.gov.au Link Card component stories.
 */

// phpcs:ignoreFile
import Component from './link-card.twig';
import LinkCardData from './link-card.stories.data';

const meta = {
  title: 'Molecules/List/Link Card',
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
      options: ['default', 'download'],
    },
    title: {
      control: { type: 'text' },
    },
    url: {
      control: { type: 'text' },
    },
    file_extension: {
      control: { type: 'text' },
    },
    file_size: {
      control: { type: 'text' },
    },
    is_secured: {
      control: { type: 'boolean' },
    },
    is_external: {
      control: { type: 'boolean' },
    },
    is_new_window: {
      control: { type: 'boolean' },
    },
    is_deactivated: {
      control: { type: 'boolean' },
    },
    modifier_class: {
      control: { type: 'text' },
    },
  },
};

export default meta;

export const LinkCard = {
  parameters: {
    layout: 'padded',
  },
  args: LinkCardData.args(),
};

export const External = {
  parameters: {
    layout: 'padded',
  },
  args: {
    ...LinkCardData.args(),
    title: 'Visit the national portal',
    url: 'https://national.example.gov',
    is_external: true,
    is_new_window: true,
  },
};

export const Secured = {
  parameters: {
    layout: 'padded',
  },
  args: {
    ...LinkCardData.args(),
    title: 'Annual report 2025 (secure)',
    url: 'https://example.com/secure/annual-report',
    is_secured: true,
  },
};

export const SecuredDownload = {
  parameters: {
    layout: 'padded',
  },
  args: {
    ...LinkCardData.args(),
    variant: 'download',
    title: 'Audited statements 2025',
    url: 'https://example.com/secure/audited-statements.pdf',
    file_extension: 'PDF',
    file_size: '3.4 MB',
    is_secured: true,
  },
};

export const SecuredDeactivated = {
  parameters: {
    layout: 'padded',
  },
  args: {
    ...LinkCardData.args(),
    title: 'Annual report 2025 (sign in to access)',
    url: '',
    is_secured: true,
    is_deactivated: true,
  },
};

export const Download = {
  parameters: {
    layout: 'padded',
  },
  args: {
    ...LinkCardData.args(),
    variant: 'download',
    title: 'Annual report 2025',
    url: 'https://example.com/annual-report.pdf',
    file_extension: 'PDF',
    file_size: '1.2 MB',
  },
};

export const Dark = {
  parameters: {
    layout: 'padded',
  },
  globals: {
    backgrounds: { value: 'dark' },
  },
  args: LinkCardData.args('dark'),
};
