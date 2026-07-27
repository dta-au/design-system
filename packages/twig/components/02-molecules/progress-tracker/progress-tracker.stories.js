/**
 * digital.gov.au Progress tracker component stories.
 */

import Component from './progress-tracker.twig';

// A generic multi-step service flow: two steps done, the third current.
const DEMO_STEPS = [
  { title: 'Eligibility', status: 'complete' },
  { title: 'Your details', status: 'complete' },
  { title: 'Documents', status: 'active' },
  { title: 'Review', status: 'todo' },
  { title: 'Submit', status: 'todo' },
];

export default {
  title: 'Forms/Progress tracker',
  component: Component,
  tags: ['digitalgovau'],
  argTypes: {
    theme: {
      control: { type: 'radio' },
      options: ['light', 'dark'],
    },
    steps: { control: 'object' },
    modifier_class: { control: 'text' },
  },
};

export const Default = {
  args: {
    theme: 'light',
    steps: DEMO_STEPS,
  },
};

export const Dark = {
  args: {
    theme: 'dark',
    steps: DEMO_STEPS,
  },
  globals: {
    backgrounds: { value: 'dark' },
  },
};
