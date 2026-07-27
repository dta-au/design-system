/**
 * CivicTheme Navigation Card component stories.
 */

import Component from './navigation-card.twig';
import NavigationCardData from './navigation-card.stories.data';
import Constants from '../../../dist/constants.json';

const meta = {
  title: 'Molecules/List/Navigation Card',
  component: Component,
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
      options: ['default', 'index'],
    },
    title: {
      control: { type: 'text' },
    },
    summary: {
      control: { type: 'text' },
    },
    link: {
      control: { type: 'object' },
    },
    image: {
      control: { type: 'object' },
    },
    image_as_icon: {
      control: { type: 'boolean' },
    },
    icon: {
      control: { type: 'select' },
      options: Constants.ICONS, // replace with actual icon options
    },
    is_title_click: {
      control: { type: 'boolean' },
    },
    image_over: {
      control: { type: 'text' },
    },
    content_top: {
      control: { type: 'text' },
    },
    content_middle: {
      control: { type: 'text' },
    },
    content_bottom: {
      control: { type: 'text' },
    },
    modifier_class: {
      control: { type: 'text' },
    },
  },
};

export default meta;

export const NavigationCard = {
  parameters: {
    layout: 'centered',
  },
  args: NavigationCardData.args('light'),
};

export const NavigationCardIndex = {
  parameters: {
    layout: 'centered',
  },
  args: {
    ...NavigationCardData.args('light'),
    variant: 'index',
    title: 'Prepare your digital proposal',
    summary: 'Understand the requirements of the investment process, meet your policy obligations and find information to support your proposal and business case.',
    // The index variant is a text-only card - no image, no icon.
    image: { url: '', alt: '' },
  },
};
