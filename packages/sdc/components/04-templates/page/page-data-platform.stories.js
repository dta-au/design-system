/**
 * Data Platform portal stories.
 *
 * A signed-in data collection portal, composed on the Page template: portal
 * home, one step of a multi-step submission, and the review screen that closes
 * it. The portal, the collections and the organisation are fictional.
 */

import Component from './page.twig';
import { DataPlatformHomeData, DataPlatformSubmissionData, DataPlatformReviewData } from './page-data-platform.stories.data';

const meta = {
  title: 'Page types/Data platform',
  component: Component,
  tags: ['digitalgovau'],
  argTypes: {
    theme: {
      control: { type: 'radio' },
      options: ['light', 'dark'],
    },
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

export const PortalHome = {
  name: 'Portal home',
  args: DataPlatformHomeData.args('light'),
};

export const SubmissionStep = {
  name: 'Submission – form step',
  args: DataPlatformSubmissionData.args('light'),
};

export const ReviewAndSubmit = {
  name: 'Submission – review and submit',
  args: DataPlatformReviewData.args('light'),
};
