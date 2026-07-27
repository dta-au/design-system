/**
 * digital.gov.au Decision tool component stories.
 */

import Component from './decision-tool.twig';

// Surface the completion contract in the Storybook console so downstream
// consumers can see the exact event payload:
//   detail = { questionSetId, outcomeId, flags, referenceCode }
if (typeof document !== 'undefined') {
  document.addEventListener('civictheme:decision-tool:complete', (event) => {
    if (window.console) {
      window.console.log('civictheme:decision-tool:complete', event.detail);
    }
  });
}

// Generic, clearly-fictional demo set. Exercises single + multiple steps,
// per-option branching (a "no" answer jumps straight to a result), flag
// accumulation, all three primary severities, an optional CTA, and a
// when-less catch-all outcome.
const DEMO_QUESTION_SET = {
  id: 'workshop-eligibility',
  title: 'Community workshop eligibility check',
  intro: 'Answer a few quick questions to see whether you can register for an upcoming workshop. Your answers stay in your browser - nothing is sent anywhere.',
  steps: [
    {
      id: 'member',
      question: 'Are you a registered community member?',
      type: 'single',
      options: [
        { id: 'yes', label: 'Yes, I am a member', value: 'member', next: 'format' },
        { id: 'no', label: 'No, not yet', value: 'guest', next: 'result', flags: ['not-member'] },
      ],
    },
    {
      id: 'format',
      question: 'Which workshop formats would suit you?',
      help: 'Select all that apply.',
      type: 'multiple',
      next: 'availability',
      options: [
        { id: 'in-person', label: 'In person', description: 'Attend at a community venue near you.', value: 'in-person', flags: ['wants-in-person'] },
        { id: 'online', label: 'Online', description: 'Join live from anywhere over video.', value: 'online', flags: ['wants-online'] },
      ],
    },
    {
      id: 'availability',
      question: 'Can you attend on a weekday?',
      type: 'single',
      options: [
        { id: 'weekday', label: 'Yes, weekdays work for me', value: 'weekday', next: 'result', flags: ['weekday-ok'] },
        { id: 'weekend', label: 'No, I can only do weekends', value: 'weekend', next: 'result', flags: ['weekend-only'] },
      ],
    },
  ],
  outcomes: [
    {
      id: 'not-member',
      when: { any: ['not-member'] },
      severity: 'info',
      heading: 'Become a member first',
      body: 'Our workshops are open to registered community members. Membership is free and takes a couple of minutes to set up.',
      cta: { label: 'Register as a member', href: '#register' },
    },
    {
      id: 'weekday',
      when: { all: ['weekday-ok'] },
      severity: 'success',
      heading: 'You can register now',
      body: 'You meet the criteria for our weekday workshops. Quote the reference code below when you complete your registration.',
      cta: { label: 'Go to registration', href: '#register-workshop' },
    },
    {
      id: 'weekend',
      when: { all: ['weekend-only'] },
      severity: 'warning',
      heading: 'Weekend places are limited',
      body: 'Weekday places are available immediately. Weekend sessions run a waitlist - quote your reference code to join it.',
      cta: { label: 'Join the weekend waitlist', href: '#waitlist' },
    },
    {
      id: 'thanks',
      severity: 'info',
      heading: 'Thanks for completing the check',
      body: 'Quote your reference code when you contact us and we will help you find a session that suits you.',
    },
  ],
};

// Link-card routing demo: the first step is a grid of cards that advance on
// click (no Next button). Also exercises an outcome "find out more" link.
const DEMO_LINKCARD_SET = {
  id: 'support-check',
  title: 'What do you need help with?',
  intro: 'Choose a category to start. Your answers stay in your browser.',
  steps: [
    {
      id: 'category',
      question: 'What do you need help with?',
      type: 'single',
      option_style: 'link-card',
      options: [
        { id: 'grants', label: 'Grants and funding', description: 'Apply for or manage a grant.', next: 'grant-stage', flags: ['grants'] },
        { id: 'registration', label: 'Registration', description: 'Register a business or activity.', next: 'result', flags: ['registration'] },
        { id: 'complaint', label: 'Make a complaint', description: 'Report an issue or a dispute.', next: 'result', flags: ['complaint'] },
      ],
    },
    {
      id: 'grant-stage',
      question: 'Where are you up to with your grant?',
      type: 'single',
      options: [
        { id: 'new', label: 'I want to apply', value: 'new', next: 'result', flags: ['grant-new'] },
        { id: 'existing', label: 'I have an existing grant', value: 'existing', next: 'result', flags: ['grant-existing'] },
      ],
    },
  ],
  outcomes: [
    { id: 'grant-new', when: { all: ['grant-new'] }, severity: 'success', heading: 'You can apply now', body: 'Grant applications are open. Quote your reference code in the application.', cta: { label: 'Start an application', href: '#apply' } },
    { id: 'grant-existing', when: { all: ['grant-existing'] }, severity: 'info', heading: 'Manage your grant', body: 'Sign in to manage an existing grant.', cta: { label: 'Sign in', href: '#signin' } },
    { id: 'registration', when: { any: ['registration'] }, severity: 'info', heading: 'Register online', body: 'Most registrations can be completed online in about 15 minutes.', cta: { label: 'Go to registration', href: '#register' } },
    { id: 'complaint', when: { any: ['complaint'] }, severity: 'warning', heading: 'Try to resolve it first', body: 'Most disputes are resolved fastest by contacting the other party directly.', more_link: { text: 'Find out more about complaints', href: '#complaints' } },
    { id: 'fallback', severity: 'info', heading: 'Thanks for completing the check', body: 'Contact us and quote your reference code.' },
  ],
};

export default {
  title: 'Forms/Decision tool',
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
    vertical_spacing: {
      control: { type: 'select' },
      options: ['none', 'top', 'bottom', 'both'],
    },
    option_style: {
      control: { type: 'radio' },
      options: ['list', 'card', 'link-card'],
    },
    progress_style: {
      control: { type: 'radio' },
      options: ['tracker', 'bar'],
    },
    show_progress: { control: { type: 'boolean' } },
    show_summary: { control: { type: 'boolean' } },
    summary_label: { control: 'text' },
    change_label: { control: 'text' },
    question_set: { control: 'object' },
    storage_key: { control: 'text' },
    back_label: { control: 'text' },
    next_label: { control: 'text' },
    submit_label: { control: 'text' },
    restart_label: { control: 'text' },
    reference_label: { control: 'text' },
    copy_label: { control: 'text' },
    progress_label: { control: 'text' },
  },
};

export const Default = {
  args: {
    theme: 'light',
    vertical_spacing: 'none',
    option_style: 'list',
    question_set: DEMO_QUESTION_SET,
  },
};

// Card-style answer options: the whole card is the selectable target. Best when
// options carry a supporting description.
export const Cards = {
  args: {
    ...Default.args,
    option_style: 'card',
  },
};

// Auto-advancing link-card routing step (no Next button), plus an outcome that
// carries a "find out more" link.
export const LinkCards = {
  args: {
    theme: 'light',
    vertical_spacing: 'none',
    question_set: DEMO_LINKCARD_SET,
  },
};

// NSW-style filled progress bar ("Step N of T" / "Complete") in place of the
// step markers.
export const ProgressBar = {
  args: {
    ...Default.args,
    progress_style: 'bar',
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

// Opt-in persistence: writes the completion detail to
// sessionStorage['civictheme-decision-tool-demo'] in addition to dispatching
// the event. Off by default everywhere else.
export const WithSessionStorage = {
  args: {
    ...Default.args,
    storage_key: 'civictheme-decision-tool-demo',
  },
};
