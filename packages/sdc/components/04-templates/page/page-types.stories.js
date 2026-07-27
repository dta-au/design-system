/**
 * digital.gov.au page-type stories.
 *
 * One story per digital.gov.au content type, composed on the Page template
 * per the DTA design library template specs (dga-dl src/content/templates).
 * Rule appears twice because its spec defines two distinct page shapes:
 * the standard parent and the numbered rule.
 */

import Component from './page.twig';
import { SectionLandingPageData, ProgramData, RuleStandardParentData, RuleNumberedData, GuideData, ReportData, CommuniqueData, ReferenceGlossaryData, ResourceData } from './page-types.stories.data';

const meta = {
  title: 'Page types/Content types',
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

export const SectionLandingPage = {
  name: 'Section landing page',
  args: SectionLandingPageData.args('light'),
};

export const Program = {
  args: ProgramData.args('light'),
};

export const RuleStandardParent = {
  name: 'Rule – standard parent',
  args: RuleStandardParentData.args('light'),
};

export const RuleNumbered = {
  name: 'Rule – numbered rule',
  args: RuleNumberedData.args('light'),
};

export const Guide = {
  args: GuideData.args('light'),
};

export const Report = {
  args: ReportData.args('light'),
};

export const Communique = {
  args: CommuniqueData.args('light'),
};

export const Reference = {
  name: 'Reference – glossary',
  args: ReferenceGlossaryData.args('light'),
};

export const Resource = {
  args: ResourceData.args('light'),
};
