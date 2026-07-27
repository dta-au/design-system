/**
 * Data Platform portal compositions.
 *
 * A signed-in data collection portal: organisations sign in, see the returns
 * they owe, work through a multi-step submission, then check their answers and
 * submit. Three pages cover the whole loop - portal home, one form step, and
 * review and submit.
 *
 * The portal, the collections and the organisation are fictional. Shared header
 * and banner builders come from the sibling page-type stories so the chrome
 * matches the rest of the Page types group; the signed-in header comes from
 * PageAccountData.
 */

import Button from '../../01-atoms/button/button.twig';
import Link from '../../01-atoms/link/link.twig';
import Tag from '../../01-atoms/tag/tag.twig';
import Table from '../../01-atoms/table/table.twig';
import Checkbox from '../../01-atoms/checkbox/checkbox.twig';
import SummaryList from '../../01-atoms/summary-list/summary-list.twig';
import BasicContent from '../../02-molecules/basic-content/basic-content.twig';
import Attachment from '../../02-molecules/attachment/attachment.twig';
import Field from '../../02-molecules/field/field.twig';
import FastFactCard from '../../02-molecules/fast-fact-card/fast-fact-card.twig';
import ProgressNav from '../../02-molecules/progress-nav/progress-nav.twig';
import Message from '../../03-organisms/message/message.twig';
import Chart from '../../03-organisms/chart/chart.twig';
import List from '../../03-organisms/list/list.twig';
import Grid from '../../00-base/grid/grid.twig';
import { PageAccountData } from './page.stories.data';
import { pageHeader, cardGrid, sideNav } from './page-types.stories.data';

// -- Shared builders

const CRUMB_HOME = ['Home', '/'];
const CRUMB_PORTAL = ['Data Platform', '#'];
const CRUMB_RETURN = ['Community services quarterly return', '#'];

// Every portal page is signed in, so the chrome carries the account dropdown.
// The left sidebar holds the portal's own navigation, never the site's.
const base = (theme, {
  banner, content, sidebar = '', verticalSpacing = 'both',
}) => ({
  ...PageAccountData.args(theme, { signedIn: true }),
  vertical_spacing: verticalSpacing,
  banner,
  hide_sidebar_left: !sidebar,
  hide_sidebar_right: true,
  sidebar_top_left: sidebar,
  sidebar_bottom_left: '',
  content,
});

// Portal sections. Present on the home page; the submission flow replaces it
// with the progress nav so the step list is the only thing competing for the
// user's attention mid-form.
const portalNav = (theme, active) => sideNav(theme, 'Data Platform', [
  { title: 'Home', active: active === 'home' },
  { title: 'Returns', active: active === 'returns' },
  { title: 'Uploaded files' },
  { title: 'Organisation profile' },
  { title: 'Users and access' },
  { title: 'Help and guidance' },
]);

// Headline numbers for the reporting year, as fast fact cards. Title carries
// the figure, summary the label - the card's own type scale does the rest.
const statRow = (theme, stats) => List({
  theme,
  rows: Grid({
    theme,
    items: stats.map((stat) => FastFactCard({ theme, title: stat.figure, summary: stat.label })),
    template_column_count: stats.length,
    fill_width: false,
    with_background: false,
    row_class: 'row--equal-heights-content row--vertically-spaced',
  }),
  vertical_spacing: 'none',
  with_background: false,
  modifier_class: '',
});

// Status of a return, as a tag so the signal survives a scan down the column.
const statusTag = (theme, content) => Tag({ theme, content, type: 'secondary' });

// Buttons sit in a content region's paragraph so they inherit the content
// column's rhythm; they are inline-block, so a primary/secondary pair reads as
// one action row. The Paragraph atom is a single paragraph and cannot carry
// this, so the region owns the markup.
const actions = (theme, buttons) => BasicContent({
  theme,
  content: `<p>${buttons.map((button) => Button({ theme, ...button })).join(' ')}</p>`,
});

// A single form control. `type` maps to the control the Field molecule renders,
// so a select passes `options` and a radio group passes `control`.
const field = (theme, props) => Field({
  theme, title_display: 'visible', orientation: 'vertical', ...props,
});

// Chart with its config island. The renderer only reads the island, so build it
// from the same props rather than restating the data twice. Toolbar is always
// on - the table view is how a value stays reachable without reading the plot.
const chart = (theme, props) => Chart({
  theme,
  source_mode: 'json',
  toolbar: true,
  ...props,
  config_json: JSON.stringify({
    id: props.chart_id,
    type: props.chart_type,
    source: 'json',
    url: null,
    x_key: props.x_key,
    y_keys: props.y_keys,
    x_label: props.x_label || props.x_key,
    y_label: props.y_label || '',
    rows: props.rows,
    ...(props.median_value === undefined ? {} : { median_value: props.median_value }),
  }),
});

// -- Reporting history
//
// Column shape follows the Major Digital Projects Report 2026 project dataset
// on data.gov.au (resource e33c772c): an entity, an ordinal assessment, a
// measure, and the same measure in prior years. The values here are invented
// for Northmere - a portal shows an organisation its own figures, so real MDPR
// rows would not belong on this page.

const QUARTERLY_CLIENTS = [
  { quarter: 'Sep 2024', 'Your council': 2980, 'Sector average': 2870 },
  { quarter: 'Dec 2024', 'Your council': 3050, 'Sector average': 2910 },
  { quarter: 'Mar 2025', 'Your council': 3120, 'Sector average': 2940 },
  { quarter: 'Jun 2025', 'Your council': 3210, 'Sector average': 2980 },
  { quarter: 'Sep 2025', 'Your council': 3290, 'Sector average': 3010 },
  { quarter: 'Dec 2025', 'Your council': 3380, 'Sector average': 3040 },
  { quarter: 'Mar 2026', 'Your council': 3520, 'Sector average': 3080 },
  { quarter: 'Jun 2026', 'Your council': 3610, 'Sector average': 3110 },
];

// Normalised per 1,000 residents so councils of different size compare fairly.
// The reader's own council is named as such: the renderer draws every dot in
// one colour, so the label is what makes their row findable. An odd number of
// councils keeps the median on a real data value rather than a midpoint.
const SECTOR_RATES = [
  { council: 'Eastvale City', rate: 54.2 },
  { council: 'Westhaven City', rate: 48.6 },
  { council: 'Northmere Shire (your council)', rate: 42.8 },
  { council: 'Calder Downs', rate: 39.1 },
  { council: 'Marnley Shire', rate: 37.9 },
  { council: 'Ardenne Shire', rate: 36.4 },
  { council: 'Lindenmoor Shire', rate: 33.7 },
  { council: 'Coralee Bay', rate: 29.5 },
  { council: 'Barrowfield Shire', rate: 24.9 },
];

const SECTOR_MEDIAN = (() => {
  const sorted = SECTOR_RATES.map((row) => row.rate).sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
})();

// The draft quarter alongside the four before it. Placed against the field it
// checks, so an out-of-family figure is visible while it is still being typed.
const DRAFT_COMPARISON = [
  { quarter: 'Sep 2025', clients: 3290 },
  { quarter: 'Dec 2025', clients: 3380 },
  { quarter: 'Mar 2026', clients: 3520 },
  { quarter: 'Jun 2026', clients: 3610 },
  { quarter: 'Jul–Sep 2026 (draft)', clients: 5640 },
];

// -- Portal home
// What do I owe, when is it due, what is broken. The return table is the page;
// everything else routes into it.

export const DataPlatformHomeData = {
  args: (theme = 'light') => base(theme, {
    banner: pageHeader(theme, {
      section: 'Northmere Shire Council',
      title: 'Your data returns',
      intro: 'Submit, track and correct the data your organisation reports to the Data Platform.',
      crumbs: [CRUMB_HOME],
    }),
    sidebar: portalNav(theme, 'home'),
    content: [
      Message({
        theme,
        type: 'warning',
        title: 'The community services quarterly return closes in 12 days',
        content: `Submit by 31 October 2026. ${Link({ theme, text: 'Continue your return', url: '#' })}`,
        with_background: true,
        vertical_spacing: 'bottom',
        has_aria: true,
      }),
      statRow(theme, [
        { figure: '1 of 4', label: 'returns submitted for 2026–27' },
        { figure: '12 days', label: 'until the next return closes' },
        { figure: '38', label: 'validation errors to fix' },
      ]),
      BasicContent({ theme, content: '<h2>Returns for 2026–27</h2>', vertical_spacing: 'top' }),
      Table({
        theme,
        caption: 'Data returns for the 2026–27 reporting year',
        caption_position: 'before',
        header: ['Return', 'Reporting period', 'Due', 'Status', 'Action'],
        header_sanitized: ['Return', 'Reporting period', 'Due', 'Status', 'Action'],
        rows: [
          [
            'Community services quarterly return',
            'July to September 2026',
            '31 October 2026',
            statusTag(theme, 'In progress'),
            Link({ theme, text: 'Continue', url: '#' }),
          ],
          [
            'Waste and recycling volumes',
            'April to June 2026',
            '31 July 2026',
            statusTag(theme, 'Needs attention'),
            Link({ theme, text: 'Fix errors', url: '#' }),
          ],
          [
            'Infrastructure asset register',
            '2025–26',
            '30 September 2026',
            statusTag(theme, 'Submitted'),
            Link({ theme, text: 'View receipt', url: '#' }),
          ],
          [
            'Workforce profile',
            '2025–26',
            '28 February 2027',
            statusTag(theme, 'Not started'),
            Link({ theme, text: 'Start', url: '#' }),
          ],
        ],
        is_striped: false,
        is_data_table: true,
      }),
      actions(theme, [
        { kind: 'link', type: 'primary', text: 'Start a new return', url: '#' },
        { kind: 'link', type: 'secondary', text: 'Download your submitted data', url: '#' },
      ]),
      BasicContent({ theme, content: '<h2>How your reporting is tracking</h2>', vertical_spacing: 'top' }),
      // Two series, so the legend is on: the reader has to tell the council's
      // own line from the benchmark, and that cannot rest on colour alone.
      chart(theme, {
        chart_id: 'data-platform-history',
        chart_type: 'line',
        title: 'Unique clients served each quarter, against the sector average',
        description: 'Clients your council reported each quarter since September 2024, with the average across all reporting councils for the same quarter. Submitted returns only - the current quarter is still in progress.',
        x_key: 'quarter',
        y_keys: ['Your council', 'Sector average'],
        x_label: 'Quarter',
        y_label: 'Unique clients served',
        rows: QUARTERLY_CLIENTS,
        legend: true,
      }),
      // One measure across councils, ordered: a lollipop keeps the labels
      // readable at this length and the median line does the benchmarking.
      chart(theme, {
        chart_id: 'data-platform-sector',
        chart_type: 'lollipop',
        title: 'Clients served per 1,000 residents, by council',
        description: 'Your council against the others reporting this collection for July to September 2026, normalised per 1,000 residents so councils of different size compare fairly. The line marks the sector median.',
        x_key: 'council',
        y_keys: ['rate'],
        x_label: 'Council',
        y_label: 'Clients per 1,000 residents',
        rows: SECTOR_RATES,
        median_value: SECTOR_MEDIAN,
      }),
      Attachment({
        theme,
        title: 'Data specification',
        content: 'Field definitions, formats and validation rules for every return in this portal.',
        with_background: true,
        vertical_spacing: 'top',
        files: [
          {
            name: 'Data Platform specification 2026–27', ext: 'xlsx', url: '#', size: '640 KB', icon: 'download-file',
          },
        ],
      }),
      BasicContent({ theme, content: '<h2>Help with your return</h2>', vertical_spacing: 'top' }),
      cardGrid(theme, [
        { title: 'How to prepare your data', summary: 'Get your source systems ready before you start a return.' },
        { title: 'Understanding validation errors', summary: 'What each error means and how to correct it.' },
        { title: 'Contact the data team', summary: 'Ask a question about a return or request an extension.' },
      ]),
    ].join(''),
  }),
};

// -- Submission form step
// Mid-flow. The progress nav carries the whole shape of the submission, so the
// content column only has to hold this step's questions.

const FORM_STEPS = [
  { title: 'Organisation details', url: '#organisation', status: 'completed' },
  { title: 'Contact for this return', url: '#contact', status: 'completed' },
  {
    title: 'Service delivery volumes',
    url: '#volumes',
    status: 'in-progress',
    is_active: true,
    progress_text: 'Step 3 of 6',
  },
  { title: 'Client demographics', status: 'todo' },
  { title: 'Supporting files', status: 'todo' },
  { title: 'Review and submit', status: 'cannot-start-yet', hint: 'Complete all sections first' },
];

export const DataPlatformSubmissionData = {
  args: (theme = 'light') => base(theme, {
    banner: pageHeader(theme, {
      section: 'Community services quarterly return',
      title: 'Service delivery volumes',
      intro: 'July to September 2026. Report the volumes your organisation delivered in the quarter.',
      crumbs: [CRUMB_HOME, CRUMB_PORTAL, CRUMB_RETURN],
    }),
    sidebar: ProgressNav({
      theme,
      heading: 'Your return',
      id_prefix: 'data-platform-return',
      current_step: 3,
      total_steps: 6,
      steps: FORM_STEPS,
    }),
    content: [
      // Error summary first, linked to the field it names - the field's own
      // message repeats it in place.
      Message({
        theme,
        type: 'error',
        title: 'There is a problem',
        content: `<ul><li>${Link({ theme, text: 'Unique clients served cannot be higher than total service events', url: '#unique-clients' })}</li></ul>`,
        with_background: true,
        vertical_spacing: 'bottom',
        has_aria: true,
      }),
      field(theme, {
        type: 'textfield',
        title: 'Total service events delivered',
        description: 'Whole numbers only. Exclude events cancelled before delivery.',
        name: 'total_service_events',
        id: 'total-service-events',
        value: '4,182',
        is_required: true,
      }),
      field(theme, {
        type: 'textfield',
        title: 'Unique clients served',
        description: 'Count each client once, even if they attended more than one event.',
        name: 'unique_clients',
        id: 'unique-clients',
        value: '5,640',
        is_required: true,
        is_invalid: true,
        message: {
          content: 'Unique clients served cannot be higher than total service events. Check both figures and enter them again.',
          attributes: 'id="unique-clients--error-message"',
        },
      }),
      // Single series, so no legend - the title names it. Sits under the field
      // it checks so the outlier draft is visible while the figure is entered.
      chart(theme, {
        chart_id: 'data-platform-draft-check',
        chart_type: 'bar',
        title: 'Unique clients served: this quarter against your last four',
        description: 'The figure entered above compared with the four quarters your council has already submitted. A draft well outside this range usually means a counting error.',
        x_key: 'quarter',
        y_keys: ['clients'],
        x_label: 'Quarter',
        y_label: 'Unique clients served',
        rows: DRAFT_COMPARISON,
      }),
      field(theme, {
        type: 'select',
        title: 'Primary delivery mode',
        description: 'The mode used for most service events this quarter.',
        name: 'delivery_mode',
        id: 'delivery-mode',
        is_required: true,
        options: [
          { type: 'option', label: 'In person', value: 'in_person' },
          { type: 'option', label: 'Online', value: 'online', is_selected: true },
          { type: 'option', label: 'Blended', value: 'blended' },
        ],
      }),
      field(theme, {
        type: 'radio',
        title: 'Did your service model change this quarter?',
        description: 'Tell us if you opened, closed or relocated a service point.',
        name: 'model_changed',
        id: 'model-changed',
        is_required: true,
        control: [
          { label: 'Yes', value: 'yes', id: 'model-changed-yes' },
          { label: 'No', value: 'no', id: 'model-changed-no' },
        ],
      }),
      field(theme, {
        type: 'textarea',
        title: 'Describe the change',
        description: 'Optional. The data team reads this alongside your figures.',
        name: 'model_change_detail',
        id: 'model-change-detail',
        value: '',
      }),
      actions(theme, [
        { kind: 'submit', type: 'primary', text: 'Save and continue' },
        { kind: 'link', type: 'secondary', text: 'Save and come back later', url: '#' },
      ]),
    ].join(''),
  }),
};

// -- Review and submit
// Check your answers: every value, every route back, then one declaration and
// one submit button.

export const DataPlatformReviewData = {
  args: (theme = 'light') => base(theme, {
    banner: pageHeader(theme, {
      section: 'Community services quarterly return',
      title: 'Check your answers before you submit',
      intro: 'July to September 2026. Once submitted, you can only change this return by asking the data team to reopen it.',
      crumbs: [CRUMB_HOME, CRUMB_PORTAL, CRUMB_RETURN],
    }),
    sidebar: ProgressNav({
      theme,
      heading: 'Your return',
      id_prefix: 'data-platform-review',
      current_step: 6,
      total_steps: 6,
      steps: [
        ...FORM_STEPS.slice(0, 5).map((step) => ({
          ...step, status: 'completed', is_active: false, progress_text: '',
        })),
        {
          title: 'Review and submit', url: '#review', status: 'in-progress', is_active: true, progress_text: 'Step 6 of 6',
        },
      ],
    }),
    content: [
      SummaryList({
        theme,
        items: [
          {
            key: 'Organisation', value: 'Northmere Shire Council', action_url: '#', action_text: 'Change',
          },
          {
            key: 'Contact for this return', value: 'Jordan Citizen, jordan.citizen@northmere.example.gov.au', action_url: '#', action_text: 'Change',
          },
          {
            key: 'Total service events delivered', value: '4,182', action_url: '#', action_text: 'Change',
          },
          {
            key: 'Unique clients served', value: '3,640', action_url: '#', action_text: 'Change',
          },
          {
            key: 'Primary delivery mode', value: 'Online', action_url: '#', action_text: 'Change',
          },
          {
            key: 'Service model changed', value: 'Yes – the Westfold service point moved to the community hub in August 2026', action_url: '#', action_text: 'Change',
          },
          {
            key: 'Supporting files', value: 'northmere-q1-service-events.csv', action_url: '#', action_text: 'Change',
          },
        ],
      }),
      BasicContent({
        theme,
        vertical_spacing: 'top',
        content: [
          '<h2>Declaration</h2>',
          '<p>By submitting this return you confirm the figures are complete and accurate to the best of your knowledge, and that you are authorised to report on behalf of your organisation.</p>',
        ].join(''),
      }),
      // A form control is not prose - render the atom directly rather than
      // wrapping it in a Paragraph.
      Checkbox({
        theme,
        name: 'declaration',
        id: 'declaration',
        value: 'confirmed',
        label: 'I confirm this return is complete and accurate',
        is_required: true,
      }),
      actions(theme, [
        { kind: 'submit', type: 'primary', text: 'Submit return' },
        { kind: 'link', type: 'secondary', text: 'Save and come back later', url: '#' },
      ]),
    ].join(''),
  }),
};
