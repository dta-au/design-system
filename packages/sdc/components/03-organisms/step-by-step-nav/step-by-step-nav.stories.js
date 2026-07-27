/**
 * digital.gov.au Step by Step Nav component stories.
 */

import Component from './step-by-step-nav.twig';
import StepByStepNavData from './step-by-step-nav.stories.data';

const meta = {
  title: 'Navigation/Step by step nav',
  component: Component,
  tags: ['digitalgovau'],
  argTypes: {
    theme: {
      control: { type: 'radio' },
      options: ['light', 'dark'],
    },
    is_contained: {
      control: { type: 'boolean' },
    },
    size: {
      control: { type: 'radio' },
      options: ['default', 'small'],
    },
    heading_level: {
      control: { type: 'number', min: 2, max: 6 },
    },
    show_step: {
      control: { type: 'number' },
    },
    highlight_step: {
      control: { type: 'number' },
    },
    with_background: {
      control: { type: 'boolean' },
    },
    vertical_spacing: {
      control: { type: 'radio' },
      options: ['none', 'top', 'bottom', 'both'],
    },
    modifier_class: {
      control: { type: 'text' },
    },
    steps: {
      control: { type: 'object' },
    },
  },
};

export default meta;

export const StepByStepNav = {
  parameters: {
    layout: 'padded',
  },
  args: StepByStepNavData.args('light'),
};

export const WithLinks = {
  parameters: {
    layout: 'padded',
  },
  args: StepByStepNavData.argsWithLinks('light'),
};

export const WithOptionalSteps = {
  parameters: {
    layout: 'padded',
  },
  args: StepByStepNavData.argsWithOptionalSteps('light'),
};

export const Small = {
  parameters: {
    layout: 'padded',
  },
  args: StepByStepNavData.argsSmall('light'),
};

export const OpenStepByDefault = {
  parameters: {
    layout: 'padded',
  },
  args: StepByStepNavData.argsOpenStepByDefault('light'),
};

export const AllContentTypes = {
  parameters: {
    layout: 'padded',
  },
  args: StepByStepNavData.argsAllContentTypes('light'),
};
