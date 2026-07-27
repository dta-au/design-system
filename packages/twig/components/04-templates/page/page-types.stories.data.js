/**
 * digital.gov.au page-type compositions.
 *
 * One args builder per digital.gov.au content type, following the template
 * specs in the DTA design library (dga-dl src/content/templates): section
 * landing page, program, rule (standard parent and numbered rule), guide,
 * report, communique, reference and resource. Each composes the Page template
 * with the components its spec names; the demo copy is drawn from the specs'
 * own examples.
 */

import Banner from '../../03-organisms/banner/banner.twig';
import Paragraph from '../../01-atoms/paragraph/paragraph.twig';
import Button from '../../01-atoms/button/button.twig';
import BasicContent from '../../02-molecules/basic-content/basic-content.twig';
import Accordion from '../../02-molecules/accordion/accordion.twig';
import Callout from '../../02-molecules/callout/callout.twig';
import Attachment from '../../02-molecules/attachment/attachment.twig';
import NavigationCard from '../../02-molecules/navigation-card/navigation-card.twig';
import Pagination from '../../02-molecules/pagination/pagination.twig';
import TableOfContents from '../../02-molecules/table-of-contents/table-of-contents.twig';
import TagList from '../../02-molecules/tag-list/tag-list.twig';
import SummaryList from '../../01-atoms/summary-list/summary-list.twig';
import SideNavigation from '../../03-organisms/side-navigation/side-navigation.twig';
import List from '../../03-organisms/list/list.twig';
import Grid from '../../00-base/grid/grid.twig';
import PageData from './page.stories.data';

// -- Shared builders

// Trails stop at the parent page – the current page is never a crumb. A trail
// that reduces to Home alone is suppressed rather than padded.
const breadcrumb = (links) => (links.length < 2 ? null : {
  links: links.map(([text, url]) => ({ text, url: url || '#' })),
});

// Simple title-and-description page header: no image, no decoration.
export const pageHeader = (theme, {
  section = '', title, intro, crumbs = [['Home', '/']], below = '',
}) => Banner({
  theme,
  breadcrumb: breadcrumb(crumbs),
  site_section: section,
  title,
  is_decorative: false,
  featured_image: null,
  background_image: null,
  content: intro ? Paragraph({ theme, content: intro }) : '',
  content_below: below,
});

// Card grid built from navigation cards - the workhorse for rule indexes,
// related content and landing-page routing per the template specs.
export const cardGrid = (theme, cards, columns = 3) => List({
  theme,
  rows: Grid({
    theme,
    items: cards.map((card) => NavigationCard({
      theme,
      title: card.title,
      summary: card.summary,
      link: { text: card.title, url: card.url || '#' },
    })),
    template_column_count: columns,
    fill_width: false,
    with_background: false,
    row_class: 'row--equal-heights-content row--vertically-spaced',
  }),
  vertical_spacing: 'none',
  with_background: false,
  modifier_class: '',
});

const relatedCards = (theme, cards) => [
  BasicContent({ theme, content: '<h2>Related content</h2>', vertical_spacing: 'top' }),
  cardGrid(theme, cards, Math.min(cards.length, 3)),
].join('');

// Status tags shown in the page header of rule pages, so the audience signal
// travels with screenshots and search results.
const statusTags = (theme, tags) => TagList({
  theme,
  tags: tags.map((content) => ({ content, type: 'secondary' })),
  vertical_spacing: 'none',
  modifier_class: '',
});

const prevNext = (theme, current, total) => Pagination({
  theme,
  heading_id: 'page-type-pagination',
  items: {
    previous: { href: '#' },
    pages: Object.fromEntries(Array.from({ length: total }, (_, i) => [i + 1, { href: '#' }])),
    next: { href: '#' },
  },
  current,
  total_pages: total,
});

export const sideNav = (theme, title, items) => SideNavigation({
  theme,
  title,
  items: items.map((item) => ({
    title: item.title,
    url: item.url || '#',
    in_active_trail: !!item.active,
    is_expanded: false,
    below: false,
  })),
});

// Every page-type story shares the digital.gov.au chrome; only the banner,
// sidebars and content change. verticalSpacing 'bottom' drops the layout's
// top margin so the first content element sits contiguous with the banner.
const base = (theme, {
  banner, content, sidebar = '', hideSidebars = !sidebar, verticalSpacing = 'both',
}) => ({
  ...PageData.args(theme),
  vertical_spacing: verticalSpacing,
  banner,
  hide_sidebar_left: hideSidebars,
  hide_sidebar_right: true,
  sidebar_top_left: sidebar,
  sidebar_bottom_left: '',
  content,
});

// -- Section landing page (Navigation)
// Overview, primary navigation cards, featured content. No detailed content.

export const SectionLandingPageData = {
  args: (theme = 'light') => base(theme, {
    // No section label: a landing page is the section, so the label would
    // duplicate the title.
    banner: pageHeader(theme, {
      title: 'Investment',
      intro: 'How the Australian Government plans, assesses and oversees its digital and ICT investments, from strategic planning through contestability to assurance.',
      crumbs: [['Home', '/']],
    }),
    content: [
      cardGrid(theme, [
        { title: 'Strategic planning', summary: 'Prepare and submit your agency’s Digital Investment Plan.' },
        { title: 'Contestability', summary: 'Have your digital investment proposal assessed before budget consideration.' },
        { title: 'Assurance', summary: 'Understand the assurance tiers and reporting your investment attracts.' },
      ]),
      BasicContent({
        theme,
        vertical_spacing: 'top',
        content: '<h2>Featured</h2>',
      }),
      cardGrid(theme, [
        { title: 'Major Digital Projects Report 2026', summary: 'The annual report on the government’s major digital projects.' },
        { title: 'Digital Investment Plan policy', summary: 'Mandatory for non-corporate Commonwealth entities from 1 July 2025.' },
      ], 2),
    ].join(''),
  }),
};

// -- Program (Overview)
// Gateway page: overview, audience, outcomes, delivery, one clear CTA, FAQ.

export const ProgramData = {
  args: (theme = 'light') => base(theme, {
    banner: pageHeader(theme, {
      section: 'Programs',
      title: 'Digital Governance Program',
      intro: 'Capability uplift for board members and senior executives governing digital transformation.',
      crumbs: [['Home', '/'], ['Programs', '#']],
    }),
    content: [
      BasicContent({
        theme,
        content: [
          '<h2>About the program</h2>',
          '<p>The Digital Governance Program builds the capability of those who steer digital projects. It supports the government’s commitment to improving the delivery confidence of major digital investments.</p>',
          '<h2>Who this program is for</h2>',
          '<p>Board members, Senior Responsible Officials and SES officers with governance responsibility for a digital project or program.</p>',
          '<h2>What participants will gain</h2>',
          '<ul><li>a working model of good digital project governance</li><li>the questions to ask at each delivery stage</li><li>practice applying assurance findings to board decisions</li></ul>',
          '<h2>How the program is delivered</h2>',
          '<p>Cohort-based, online, four sessions over two months. Intakes open each quarter.</p>',
          '<h2>How to get involved</h2>',
          '<p>Nominate through your agency’s learning and development area before the next intake closes.</p>',
          // The CTA belongs in the flow of the content, not in a Paragraph
          // wrapper of its own. Rendered through the Button component so the
          // classes come from the component, not hand-pasted markup.
          `<p>${Button({ theme, kind: 'link', type: 'primary', text: 'Register your interest', url: '#' })}</p>`,
        ].join(''),
      }),
      Accordion({
        theme,
        vertical_spacing: 'both',
        panels: [
          { title: 'Is there a cost to participate?', content: 'No. The program is funded by the DTA for Australian Government participants.', expanded: false },
          { title: 'Can my agency nominate more than one participant?', content: 'Yes, up to two participants per agency per cohort.', expanded: false },
          { title: 'What preparation is required?', content: 'A short pre-reading pack is sent two weeks before the first session.', expanded: false },
        ],
      }),
      relatedCards(theme, [
        { title: 'Assessing delivery confidence of digital projects', summary: 'Guidance for agencies and independent assurers.' },
        { title: 'Digital Project Governance Boards', summary: 'Guidance for Senior Responsible Officials.' },
      ]),
    ].join(''),
  }),
};

// -- Rule: standard parent
// Scope, audience and effective date, then route into the rule set. One
// callout: the purpose statement. Rule index as a card grid, never accordions.

export const RuleStandardParentData = {
  args: (theme = 'light') => base(theme, {
    banner: pageHeader(theme, {
      section: 'Policy',
      title: 'Digital Service Standard',
      intro: 'The criteria Australian Government services must meet to be simple, secure and connected.',
      crumbs: [['Home', '/'], ['Policy', '#']],
      below: statusTags(theme, ['Mandatory', 'Version 2.0', 'Effective 1 July 2025']),
    }),
    sidebar: sideNav(theme, 'Digital Service Standard', [
      { title: 'About the standard', active: true },
      { title: 'Criteria 1 to 5' },
      { title: 'Criteria 6 to 10' },
      { title: 'How to meet the standard' },
      { title: 'How to report' },
    ]),
    content: [
      BasicContent({
        theme,
        content: '<p>The standard applies to all public-facing services delivered by non-corporate Commonwealth entities. Each criterion is published as its own page and is assessed independently.</p>',
      }),
      Callout({
        theme,
        title: 'Purpose',
        content: 'Government services should be simple to use, secure by design, and connected across agencies so people tell government once.',
        vertical_spacing: 'both',
      }),
      BasicContent({ theme, content: '<h2>The criteria</h2>' }),
      cardGrid(theme, [
        { title: '1. Have a clear intent', summary: 'Know your users, the problem, and the outcome you are accountable for.' },
        { title: '2. Know your user', summary: 'Research with the people who will use the service, including people with disability.' },
        { title: '3. Leave no one behind', summary: 'Meet accessibility and inclusion obligations from the first release.' },
        { title: '4. Connect services', summary: 'Reuse whole-of-government platforms and share data lawfully.' },
      ], 2),
      Attachment({
        theme,
        title: 'Download the standard',
        content: '',
        vertical_spacing: 'top',
        with_background: true,
        files: [{ name: 'Digital Service Standard v2.0', ext: 'pdf', url: '#', size: '1.2 MB', icon: 'download-file' }],
      }),
    ].join(''),
  }),
};

// -- Rule: numbered rule
// The verbatim normative sentence is the only callout and the most prominent
// element. Siblings in the side nav, sequential traversal via pagination.

export const RuleNumberedData = {
  args: (theme = 'light') => base(theme, {
    banner: pageHeader(theme, {
      section: 'Digital Service Standard',
      title: 'Criterion 3 – Leave no one behind',
      intro: '',
      crumbs: [['Home', '/'], ['Policy', '#'], ['Digital Service Standard', '#']],
      below: statusTags(theme, ['Mandatory', 'Accessibility and inclusion']),
    }),
    sidebar: sideNav(theme, 'Criteria', [
      { title: '1. Have a clear intent' },
      { title: '2. Know your user' },
      { title: '3. Leave no one behind', active: true },
      { title: '4. Connect services' },
      { title: '5. Build trust in design' },
    ]),
    content: [
      Callout({
        theme,
        title: 'Criterion 3',
        content: 'Services must be accessible to all people, regardless of their ability and environment, and meet WCAG 2.2 AA as a minimum.',
        vertical_spacing: 'bottom',
      }),
      BasicContent({
        theme,
        content: [
          '<h2>Why this criterion exists</h2>',
          '<p>One in five Australians lives with disability, and many more face situational or temporary barriers. Services that exclude them shift cost onto crisis channels and erode trust. Agencies typically meet this criterion by testing with assistive technology throughout delivery, not at the end.</p>',
        ].join(''),
      }),
      BasicContent({ theme, content: '<h2>Meeting this criterion</h2>', vertical_spacing: 'none' }),
      cardGrid(theme, [
        { title: 'How to meet Criterion 3', summary: 'Practices and evidence assessors look for.' },
        { title: 'How to measure success', summary: 'Signals that your service is genuinely inclusive.' },
      ], 2),
      prevNext(theme, 3, 5),
    ].join(''),
  }),
};

// -- Guide (Guidance)
// Long guide: in-page navigation from the H2s, structured body, related
// content at the end. Side navigation carries the surrounding section.

export const GuideData = {
  args: (theme = 'light') => base(theme, {
    banner: pageHeader(theme, {
      section: 'Investment',
      title: 'Digital Investment Plan guidebook',
      intro: 'How to prepare, submit and maintain your agency’s Digital Investment Plan.',
      crumbs: [['Home', '/'], ['Investment', '#']],
    }),
    sidebar: sideNav(theme, 'Strategic planning', [
      { title: 'Digital Investment Plan policy' },
      { title: 'DIP guidebook', active: true },
      { title: 'DIP template' },
      { title: 'Glossary' },
    ]),
    content: [
      TableOfContents({
        theme,
        title: 'On this page',
        position: 'before',
        links: [
          { title: 'Who this guide is for', url: '#who-this-guide-is-for' },
          { title: 'Before you start', url: '#before-you-start' },
          { title: 'Preparing your plan', url: '#preparing-your-plan' },
          { title: 'Submitting your plan', url: '#submitting-your-plan' },
        ],
      }),
      BasicContent({
        theme,
        content: [
          '<h2 id="who-this-guide-is-for">Who this guide is for</h2>',
          '<p>This guide is for the officers who prepare their agency’s Digital Investment Plan and the executives who approve it. After reading it you will be able to assemble, validate and submit a compliant plan.</p>',
          '<h2 id="before-you-start">Before you start</h2>',
          '<p>Confirm your agency is in scope of the policy and identify your planning contact. Agencies must submit their DIP by 31 March each year.</p>',
          '<h2 id="preparing-your-plan">Preparing your plan</h2>',
          '<p>Organise your plan around your agency’s short, medium and long-term digital goals. Use numbered lists for steps that must happen in order.</p>',
          '<h2 id="submitting-your-plan">Submitting your plan</h2>',
          '<p>Submit through the investment portal. You will receive an acknowledgement within five business days.</p>',
        ].join(''),
      }),
      relatedCards(theme, [
        { title: 'Digital Investment Plan policy', summary: 'The policy this guide supports.' },
        { title: 'DIP template', summary: 'The downloadable template for your plan.' },
        { title: 'Contact the investment team', summary: 'Where to send questions about your plan.' },
      ]),
    ].join(''),
  }),
};

// -- Report (Evidence, long form)
// Landing page: title, date and download up top; in-page navigation; findings
// with one headline callout; related content at the end.

export const ReportData = {
  args: (theme = 'light') => base(theme, {
    verticalSpacing: 'bottom',
    banner: pageHeader(theme, {
      section: 'Initiatives',
      title: 'Major Digital Projects Report 2026',
      intro: 'Published 30 June 2026. The annual report on the cost, schedule and delivery confidence of the government’s major digital projects.',
      crumbs: [['Home', '/'], ['Initiatives', '#']],
    }),
    content: [
      Attachment({
        theme,
        title: 'Download the report',
        content: '',
        with_background: true,
        vertical_spacing: 'bottom',
        files: [{ name: 'Major Digital Projects Report 2026', ext: 'pdf', url: '#', size: '4.8 MB', icon: 'download-file' }],
      }),
      TableOfContents({
        theme,
        title: 'In this report',
        position: 'before',
        links: [
          { title: 'Foreword', url: '#foreword' },
          { title: 'At a glance', url: '#at-a-glance' },
          { title: 'Findings', url: '#findings' },
        ],
      }),
      BasicContent({
        theme,
        content: [
          '<h2 id="foreword">Foreword</h2>',
          '<p>This is the third annual report on the government’s major digital projects portfolio.</p>',
          '<h2 id="at-a-glance">At a glance</h2>',
          '<p>The evaluation found 45 major projects under way, with a combined approved budget of $19.4 billion. Agencies reported improved delivery confidence across the portfolio.</p>',
        ].join(''),
      }),
      Callout({
        theme,
        title: 'Headline finding',
        content: 'Projects with an active governance board at first assurance review were twice as likely to hold a high delivery-confidence rating a year later.',
        vertical_spacing: 'both',
      }),
      BasicContent({
        theme,
        content: '<h2 id="findings">Findings</h2><p>The data showed sustained growth in whole-of-government platform reuse. Recommendations are presented in the active voice throughout: agencies should adopt shared assurance evidence by default.</p>',
      }),
      relatedCards(theme, [
        { title: 'Major Digital Projects Report 2025', summary: 'The previous report in this series.' },
        { title: 'Assurance framework', summary: 'The framework the report’s reviews are conducted under.' },
      ]),
    ].join(''),
  }),
};

// -- Communique (Evidence, short form)
// Dated committee record: fixed H2 structure, numbered decisions, previous
// communiques as related cards. No in-page navigation.

export const CommuniqueData = {
  args: (theme = 'light') => base(theme, {
    banner: pageHeader(theme, {
      section: 'Secretaries Digital and Data Committee',
      title: 'Secretaries Digital and Data Committee – 13 March 2026',
      intro: 'Record of the committee’s discussion and decisions.',
      crumbs: [['Home', '/'], ['SDDC', '#']],
    }),
    content: [
      BasicContent({
        theme,
        content: [
          '<h2>Attendees</h2>',
          '<p>The committee met with all member secretaries or their delegates present, chaired by the Secretary of Finance.</p>',
          '<h2>Items discussed</h2>',
          '<p>The committee discussed the mid-cycle review of the digital investment portfolio and the readiness of shared platforms for the next budget cycle.</p>',
          '<h2>Decisions</h2>',
          '<ol><li>The committee agreed to publish the updated assurance framework by July.</li><li>The committee endorsed the pilot of shared assurance evidence across three agencies.</li></ol>',
          '<h2>Next steps</h2>',
          '<p>Members agreed the DTA will report on pilot outcomes at the June meeting.</p>',
        ].join(''),
      }),
      relatedCards(theme, [
        { title: 'SDDC communique – 5 December 2025', summary: 'The previous meeting’s record.' },
        { title: 'SDDC communique – 11 September 2025', summary: 'Earlier decisions of the committee.' },
      ]),
    ].join(''),
  }),
};

// -- Reference (glossary sub-page)
// A glossary attaches to the guide that introduces its terms. Every term stays
// visible - a semantic definition list, never accordions.

export const ReferenceGlossaryData = {
  args: (theme = 'light') => base(theme, {
    banner: pageHeader(theme, {
      section: 'Investment',
      title: 'Glossary',
      intro: 'Terms used across the Digital Investment Plan guidebook.',
      crumbs: [['Home', '/'], ['Investment', '#'], ['DIP guidebook', '#']],
    }),
    sidebar: sideNav(theme, 'DIP guidebook', [
      { title: 'Digital Investment Plan policy' },
      { title: 'DIP guidebook' },
      { title: 'DIP template' },
      { title: 'Glossary', active: true },
    ]),
    content: [
      SummaryList({
        theme,
        items: [
          { key: 'Contestability', value: 'The assessment of a digital investment proposal before government considers funding it.' },
          { key: 'Delivery confidence', value: 'An independent judgement of how likely a project is to achieve its objectives.' },
          { key: 'Digital Investment Plan', value: 'An agency’s annual statement of its short, medium and long-term digital goals.' },
          { key: 'Investment Oversight Framework', value: 'The end-to-end process for planning, contestability, assurance and sourcing.' },
          { key: 'Non-corporate Commonwealth entity', value: 'An entity subject to the PGPA Act that legally forms part of the Commonwealth.' },
        ],
      }),
    ].join(''),
  }),
};

// -- Resource (standalone deliverable)
// Front-loaded: the download comes first, then brief instructions, then the
// pages the resource supports.

export const ResourceData = {
  args: (theme = 'light') => base(theme, {
    verticalSpacing: 'bottom',
    banner: pageHeader(theme, {
      section: 'Investment',
      title: 'Digital Investment Plan template',
      intro: 'A downloadable Word template for preparing your agency’s Digital Investment Plan.',
      crumbs: [['Home', '/'], ['Investment', '#']],
    }),
    content: [
      Attachment({
        theme,
        title: 'Download the template',
        content: 'Version 2.1, reviewed January 2026.',
        with_background: true,
        vertical_spacing: 'bottom',
        files: [{ name: 'Digital Investment Plan template', ext: 'docx', url: '#', size: '380 KB', icon: 'download-file' }],
      }),
      Callout({
        theme,
        content: 'This template is for non-corporate Commonwealth entities only. Corporate entities report through their portfolio department.',
        vertical_spacing: 'both',
      }),
      BasicContent({
        theme,
        content: [
          '<h2>How to use this template</h2>',
          '<ol><li>Download the template and complete each section.</li><li>Have your plan endorsed by your digital investment governance body.</li><li>Submit your plan through the investment portal by 31 March.</li></ol>',
        ].join(''),
      }),
      relatedCards(theme, [
        { title: 'Digital Investment Plan policy', summary: 'The policy this template supports.' },
        { title: 'DIP guidebook', summary: 'How to prepare, submit and maintain your plan.' },
      ]),
    ].join(''),
  }),
};
