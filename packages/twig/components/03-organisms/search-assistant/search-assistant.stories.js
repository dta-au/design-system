/**
 * digital.gov.au Search assistant component stories.
 */

import Component from './search-assistant.twig';

// Wizard-of-Oz fixture ported from the spike-search-summaries prototype.
// Answers questions a public servant asks about the Australian Government
// Architecture, using real content and real architecture.digital.gov.au URLs.
// The structural finding under test: the AGA does not own the whole answer to
// most real questions, so every entry carries an owner - full (the AGA answers
// it), partial (answer plus a scope boundary), external (refer out, never
// answer), none (suppress the answer, show results only).
const DEMO_ENTRIES = [
  {
    // full: the AGA owns this outright. Happy path, with continuation.
    query: 'what standard applies to apis',
    owner: 'full',
    confidence: 0.86,
    continuation_worthy: true,
    results: [
      {
        title: 'Application programming interfaces (APIs) standard',
        snippet: 'API solutions interconnect Commonwealth entity, supplier and partner functionality. External APIs that expose government data should be governed under a fair use policy.',
        url: 'https://architecture.digital.gov.au/standard/application-programming-interfaces-apis-standard',
        type: 'Standard',
        audience: 'Mandatory for most government agencies',
      },
      {
        title: 'api.gov.au',
        snippet: 'Whole-of-government access to APIs from across government, including the Australian Government API Design Standards for new API development.',
        url: 'https://architecture.digital.gov.au/design/apigovau',
        type: 'Design',
        audience: 'Agencies can follow this guidance',
      },
      {
        title: 'Application programming interfaces (APIs) policy',
        snippet: 'The policy a digital investment proposal is assessed against for APIs during the DTA contestability process.',
        url: 'https://architecture.digital.gov.au/policy/application-programming-interfaces-policy',
        type: 'Policy',
        audience: 'Mandatory for most government agencies',
      },
    ],
    teaser: [
      'The APIs standard covers how Commonwealth entities design, publish and govern APIs.',
      'It supports interoperability between agencies, suppliers and partners.',
      'External APIs that expose government data should be governed under a fair use policy.',
      'api.gov.au is the whole-of-government reference point, including the API Design Standards.',
    ],
    continuation: 'The standard treats APIs as the connective layer between Commonwealth entities, suppliers and partners. Internal APIs are expected to improve productivity, accuracy and reporting visibility, while external APIs that expose government data should be published under a fair use policy and aligned to the relevant capability guidance. api.gov.au is the whole-of-government reference point: it hosts published APIs and the Australian Government API Design Standards that new API work is expected to follow. The standard sits alongside the APIs policy, which is what a digital investment proposal is actually assessed against during contestability.',
    citations: [0, 1, 2],
    explore: [
      { title: 'What is api.gov.au?' },
      { title: 'Can we host this in a public cloud?' },
    ],
  },
  {
    // full: reference lookup, teaser only. Honest about consultation status.
    query: 'what is api.gov.au',
    owner: 'full',
    confidence: 0.78,
    continuation_worthy: false,
    results: [
      {
        title: 'api.gov.au',
        snippet: 'Gives developers access to a range of whole-of-government APIs and the Australian Government API Design Standards.',
        url: 'https://architecture.digital.gov.au/design/apigovau',
        type: 'Design',
        audience: 'Agencies can follow this guidance',
      },
      {
        title: 'Application programming interfaces (APIs) standard',
        snippet: 'The standard for designing, publishing and governing APIs across Commonwealth entities.',
        url: 'https://architecture.digital.gov.au/standard/application-programming-interfaces-apis-standard',
        type: 'Standard',
        audience: 'Mandatory for most government agencies',
      },
    ],
    teaser: [
      'api.gov.au gives developers access to a range of whole-of-government APIs.',
      'It lets systems integrate with functions from across government.',
      'It includes the Australian Government API Design Standards for new API work.',
      'This entry is in consultation, so treat it as guidance rather than settled policy.',
    ],
    continuation: '',
    citations: [0],
  },
  {
    // partial: the AGA sets the hosting position, but not the security bar.
    query: 'can we host this in a public cloud',
    owner: 'partial',
    confidence: 0.74,
    continuation_worthy: true,
    results: [
      {
        title: 'Hosting',
        snippet: 'Facilities that host systems and data for government, including cloud computing.',
        url: 'https://architecture.digital.gov.au/capability/hosting',
        type: 'Capability',
        audience: 'Agencies can follow this guidance',
      },
      {
        title: 'Hosting policy',
        snippet: 'Requirements for entities planning digital investments involving hosting, on premises or in external cloud.',
        url: 'https://architecture.digital.gov.au/policy/hosting-policy',
        type: 'Policy',
        audience: 'Mandatory for most government agencies',
      },
    ],
    teaser: [
      'The AGA sets the architecture position for where government systems and data are hosted.',
      'The hosting policy applies to any digital investment that involves hosting.',
      'It covers hosting on premises, in agency facilities, or in external cloud.',
      'Whether a specific cloud region is allowed is decided by certification and security rules, not the AGA alone.',
    ],
    continuation: 'The hosting capability describes the facilities and providers that host systems and data for government, including cloud computing. The hosting policy requires entities planning a digital investment involving hosting to consider where data and systems will sit, whether on premises, in agency facilities, or in external cloud. What the AGA does not decide on its own is whether a particular provider or region meets the government security and certification bar. That is governed by the Hosting Certification Framework and by cloud security requirements set by the Australian Signals Directorate, which is why a full answer to whether you can use a given public cloud needs both the AGA position and those external rules.',
    citations: [0, 1],
    scope: {
      note: 'The AGA sets the hosting position. Whether a specific provider or region can be used is governed by the Hosting Certification Framework and ASD cloud security requirements, which sit outside the AGA.',
      refs: [
        { label: 'Hosting Certification Framework - Digital Transformation Agency', url: 'https://www.digital.gov.au' },
        { label: 'Cloud security guidance - Australian Signals Directorate', url: 'https://www.cyber.gov.au' },
      ],
    },
    explore: [
      { title: 'Can we get an exemption from the digital investment plan?' },
      { title: 'What standard applies to APIs?' },
    ],
  },
  {
    // partial: the AGA holds the DIP policy; the DTA grants exemptions.
    query: 'can we get an exemption from the digital investment plan',
    owner: 'partial',
    confidence: 0.7,
    continuation_worthy: true,
    results: [
      {
        title: 'Digital investment plan policy',
        snippet: 'Establishes a consistent, long-term approach to digital investment planning across government. Mandatory for non-corporate Commonwealth entities from 1 July 2025.',
        url: 'https://architecture.digital.gov.au/policy/digital-investment-plan-policy',
        type: 'Policy',
        audience: 'Mandatory for most government agencies',
      },
    ],
    teaser: [
      'The Digital investment plan policy sits in the AGA and applies to non-corporate Commonwealth entities.',
      'It sets a consistent, long-term approach to planning digital investment across government.',
      'Your agency plan is expected each year, covering short, medium and long-term goals.',
      'Exemptions are not decided in the AGA; the DTA grants them case by case.',
    ],
    continuation: 'The DIP policy in the AGA establishes what a Digital Investment Plan is and who it binds: non-corporate Commonwealth entities, from 1 July 2025. It sets the expectation of an annual plan covering short, medium and long-term digital goals against a set of minimum standards. What the AGA page does not do is grant relief from it. An exemption is a decision for the DTA, made case by case, and the process for requesting one sits with the DTA rather than in the architecture itself.',
    citations: [0],
    scope: {
      note: 'The AGA holds the DIP policy. Exemptions and the plan submission process are administered by the DTA under the Investment Oversight Framework, not in the AGA.',
      refs: [
        { label: 'Digital and ICT Investment Oversight Framework - Digital Transformation Agency', url: 'https://www.digital.gov.au/investment' },
      ],
    },
  },
  {
    // external: the AGA does not own assurance reporting. Refer, do not answer.
    // Measured in the spike: this query retrieves Quantum computing policy at
    // 0.21 - a confident-looking wrong match. Answering from it would be the
    // failure the whole prototype exists to avoid.
    query: 'what do i have to report each quarter',
    owner: 'external',
    confidence: 0.2,
    continuation_worthy: false,
    results: [],
    teaser: [],
    continuation: '',
    citations: [],
    scope: {
      note: 'Assurance reporting is not covered by the AGA. How often you report, and what a Delivery Confidence Assessment requires, is set by the assurance tier your investment is given under the Investment Oversight Framework.',
      refs: [
        { label: 'Assurance framework for digital and ICT investments - Digital Transformation Agency', url: 'https://www.digital.gov.au/investment/assurance-framework-digital-ict-investments/background-and-overview' },
      ],
    },
  },
  {
    // none: plausible thing to type here, but genuinely out of scope. The top
    // match ("Permissions policy") is a false friend; suppression is correct.
    // Results still show, honestly labelled.
    query: 'what is the parking policy',
    owner: 'none',
    confidence: 0.3,
    continuation_worthy: false,
    results: [
      {
        title: 'Permissions policy',
        snippet: 'Requirements for evaluating and recording who can access government information, systems or resources.',
        url: 'https://architecture.digital.gov.au/policy/permissions-policy',
        type: 'Policy',
        audience: 'Agencies can follow this guidance',
      },
      {
        title: 'Hosting policy',
        snippet: 'Requirements for entities planning digital investments involving hosting.',
        url: 'https://architecture.digital.gov.au/policy/hosting-policy',
        type: 'Policy',
        audience: 'Mandatory for most government agencies',
      },
    ],
    teaser: [],
    continuation: '',
    citations: [],
  },
];

// Shown for any query that does not match a scripted entry. Never make up an
// answer for an unmatched query.
const DEMO_FALLBACK_RESULTS = [
  {
    title: 'Explore the Australian Government Architecture',
    snippet: 'Browse the domains and capabilities, or search for a policy, standard or design.',
    url: 'https://architecture.digital.gov.au',
    type: 'Guidance',
  },
  {
    title: 'Domain and capability model',
    snippet: 'Find the domain your problem sits in, then the capabilities and recommended resources under it.',
    url: 'https://architecture.digital.gov.au/domains',
    type: 'Domain',
  },
  {
    title: 'Digital and ICT Investment Oversight Framework',
    snippet: 'The end-to-end process for planning, contestability, assurance and sourcing of digital investments.',
    url: 'https://www.digital.gov.au/investment',
    type: 'Process',
  },
];

const DEMO_HINT = 'Try a scripted query such as "what standard applies to apis", "can we host this in a public cloud" or "can we get an exemption from the digital investment plan".';

export default {
  title: 'Search/Search assistant',
  // '!autodocs' opts out of the generated docs page; the attached mdx is the
  // docs entry, and it deliberately carries no props table while the prop
  // contract is still part of the solution design under development.
  tags: ['digitalgovau', 'dga-experiment', '!autodocs'],
  component: Component,
  argTypes: {
    theme: {
      control: { type: 'radio' },
      options: ['light', 'dark'],
    },
    vertical_spacing: {
      control: { type: 'select' },
      options: ['top', 'bottom', 'both', 'none'],
    },
    force_state: {
      control: { type: 'select' },
      options: ['idle', 'generating', 'teaser', 'streaming', 'expanded', 'referral', 'suppressed', 'fallback'],
    },
    force_query: { control: 'text' },
    confidence_threshold: { control: { type: 'number', min: 0, max: 1, step: 0.05 } },
    hint: { control: 'text' },
    entries: { control: 'object' },
    fallback_results: { control: 'object' },
    search_label: { control: 'text' },
    placeholder: { control: 'text' },
    button_text: { control: 'text' },
    badge_label: { control: 'text' },
    referral_badge_label: { control: 'text' },
    generating_label: { control: 'text' },
    show_more_label: { control: 'text' },
    show_less_label: { control: 'text' },
    sources_label: { control: 'text' },
    explore_title: { control: 'text' },
    grounded_text: { control: 'text' },
    suppressed_text: { control: 'text' },
    referral_text: { control: 'text' },
    fallback_text: { control: 'text' },
    results_summary_text: { control: 'text' },
    component_id: { control: 'text' },
    modifier_class: { control: 'text' },
  },
};

const baseArgs = {
  theme: 'light',
  component_id: 'search-assistant-demo',
  hint: DEMO_HINT,
  confidence_threshold: 0.6,
  referral_badge_label: 'Not in the AGA',
  referral_text: 'The AGA did not have a strong match for this, so no answer is shown.',
  suppressed_text: 'No confident answer for this search. Showing results only.',
  entries: DEMO_ENTRIES,
  fallback_results: DEMO_FALLBACK_RESULTS,
};

// Idle interactive state: type a scripted query and submit to walk the full
// generate - teaser - expand flow.
export const Interactive = {
  args: { ...baseArgs },
};

export const Generating = {
  args: { ...baseArgs, force_state: 'generating', force_query: 'what standard applies to apis' },
};

// Starts on the folded teaser; activating "Show more" streams the
// continuation and ends expanded, so one story walks all three phases.
export const TeaserAndContinuation = {
  name: 'Teaser and continuation',
  args: { ...baseArgs, force_state: 'teaser', force_query: 'what standard applies to apis' },
};

// A partial-owner answer expanded: the answer carries a scope disclosure that
// names what this corpus does not cover, and who owns the rest.
export const ScopeBoundary = {
  name: 'Scope boundary',
  args: { ...baseArgs, force_state: 'expanded', force_query: 'can we host this in a public cloud' },
};

export const Referral = {
  args: { ...baseArgs, force_state: 'referral', force_query: 'what do i have to report each quarter' },
};

// Starts on the suppressed state; searching any unscripted query from here
// shows the no-match fallback, so one story covers both no-answer states.
export const SuppressedAndFallback = {
  name: 'Suppressed and fallback',
  args: { ...baseArgs, force_state: 'suppressed', force_query: 'what is the parking policy' },
};

export const Dark = {
  args: { ...baseArgs, theme: 'dark' },
  globals: {
    backgrounds: { value: 'dark' },
  },
};
