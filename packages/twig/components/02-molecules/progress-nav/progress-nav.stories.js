/**
 * digital.gov.au Progress nav component stories.
 */

import Component from './progress-nav.twig';

// Generic multi-step form, exercising every status plus a level-2 sub-step.
const DEMO_ITEMS = [
  { title: 'Agency details', url: '#agency', status: 'completed' },
  { title: 'Contact information', url: '#contact', status: 'completed' },
  { title: 'Eligibility', url: '#eligibility', status: 'saved' },
  {
    title: 'Digital capabilities',
    url: '#capabilities',
    status: 'in-progress',
    is_active: true,
    progress_text: 'Step 4 of 7',
    sub_step: { title: 'Cloud and infrastructure', url: '#cloud', status: 'in-progress' },
  },
  { title: 'Digital maturity', status: 'todo' },
  { title: 'Supporting documents', url: '#documents', status: 'error' },
  { title: 'Review and submit', status: 'cannot-start-yet', hint: 'Complete all sections first' },
];

export default {
  title: 'Forms/Progress nav',
  component: Component,
  tags: ['digitalgovau'],
  argTypes: {
    theme: {
      control: { type: 'radio' },
      options: ['light', 'dark'],
    },
    heading: { control: 'text' },
    id_prefix: { control: 'text' },
    current_step: { control: 'number' },
    total_steps: { control: 'number' },
    progress_summary: { control: 'text' },
    steps: { control: 'object' },
    modifier_class: { control: 'text' },
  },
};

export const Default = {
  args: {
    theme: 'light',
    heading: 'Progress',
    id_prefix: 'progress-nav',
    current_step: 4,
    total_steps: 7,
    steps: DEMO_ITEMS,
  },
};

export const Dark = {
  args: {
    ...Default.args,
    theme: 'dark',
  },
  globals: {
    backgrounds: { value: 'dark' },
  },
};
