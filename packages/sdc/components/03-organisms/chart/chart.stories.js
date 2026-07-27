/**
 * digital.gov.au Chart component stories.
 */

// BDGA Chart - Storybook stories.

import Component from './chart.twig';
// The filter controls build raw ct-checkbox markup in JS (values come from the
// data at runtime), not via a civictheme:checkbox include, so sdc-plugin can't
// auto-discover the atom CSS. Import it so the SDC Storybook bundles it. The
// twig package's story carries @sync-ignore and resolves this globally.
import '../../01-atoms/checkbox/checkbox.css';

export default {
  title: 'Content/Charts/Chart',
  tags: ['digitalgovau'],
  component: Component,
  argTypes: {
    chart_id: { control: 'text' },
    heading_level: { control: { type: 'number', min: 2, max: 6 } },
    chart_type: {
      control: 'select',
      options: ['bar', 'grouped_bar', 'stacked_bar', 'line', 'pie', 'sankey', 'lollipop', 'cleveland', 'flow'],
    },
    title: { control: 'text' },
    description: { control: 'text' },
    theme: { control: 'select', options: ['light', 'dark'] },
    source_mode: { control: 'select', options: ['csv', 'json', 'url'] },
    source_url: { control: 'text' },
    x_key: { control: 'text' },
    y_keys: { control: 'object' },
    rows: { control: 'object' },
    toolbar: { control: 'boolean' },
    downloads: { control: 'object' },
    legend: { control: 'boolean' },
    texture: { control: 'boolean' },
    filters: { control: 'object' },
  },
};

const SAMPLE_ROWS = [
  { year: '2020', renewable: 24, fossil: 76, storage: 2 },
  { year: '2021', renewable: 29, fossil: 71, storage: 3 },
  { year: '2022', renewable: 32, fossil: 68, storage: 5 },
  { year: '2023', renewable: 36, fossil: 64, storage: 7 },
  { year: '2024', renewable: 40, fossil: 60, storage: 10 },
  { year: '2025', renewable: 44, fossil: 56, storage: 14 },
];

export const Bar = {
  args: {
    chart_id: 'bdga-chart-bar',
    chart_type: 'bar',
    title: 'Renewable share of electricity generation',
    description: 'Percentage share of total grid generation from renewable sources, 2020 to 2025.',
    theme: 'light',
    source_mode: 'json',
    x_key: 'year',
    y_keys: ['renewable'],
    rows: SAMPLE_ROWS,
  },
};

export const StackedBar = {
  args: {
    ...Bar.args,
    chart_id: 'bdga-chart-stacked',
    chart_type: 'stacked_bar',
    title: 'Generation mix',
    description: 'Renewable vs fossil-fuel share of grid generation by year.',
    y_keys: ['renewable', 'fossil'],
  },
};

export const GroupedBar = {
  args: {
    ...Bar.args,
    chart_id: 'bdga-chart-grouped',
    chart_type: 'grouped_bar',
    title: 'Generation mix - side-by-side',
    description: 'Renewable, fossil-fuel and storage shares rendered as adjacent bars per year.',
    y_keys: ['renewable', 'fossil', 'storage'],
  },
};

export const Line = {
  args: {
    ...Bar.args,
    chart_id: 'bdga-chart-line',
    chart_type: 'line',
    title: 'Renewable trend',
  },
};

// Multi-series line: two y_keys, so each series gets its own colour, a distinct
// marker shape, and a direct end-of-line label; the legend toggles them.
export const MultiLine = {
  args: {
    ...Bar.args,
    chart_id: 'bdga-chart-multiline',
    chart_type: 'line',
    title: 'Generation mix trend',
    description: 'Renewable, fossil-fuel and storage share of generation by year - three lines, each labelled at its end and distinguished by marker shape as well as colour.',
    y_keys: ['renewable', 'fossil', 'storage'],
  },
};

export const Pie = {
  args: {
    chart_id: 'bdga-chart-pie',
    chart_type: 'pie',
    title: 'Generation mix - 2025',
    description: 'Share of total generation in 2025 by source.',
    theme: 'light',
    source_mode: 'json',
    x_key: 'source',
    y_keys: ['share'],
    rows: [
      { source: 'Renewable', share: 44 },
      { source: 'Fossil', share: 56 },
    ],
  },
};

// Toolbar with client-side downloads. Local (json) data, so the overflow menu
// offers "Download data (CSV)" and "Download data (JSON)" alongside the
// "View as table" control. Exercises Phase 1 of the accessibility spec.
export const Toolbar = {
  args: {
    ...Bar.args,
    chart_id: 'bdga-chart-toolbar',
    chart_type: 'grouped_bar',
    title: 'Generation mix with toolbar',
    description: 'Renewable and fossil-fuel share by year, with a toolbar offering a data table view and CSV / JSON downloads.',
    y_keys: ['renewable', 'fossil'],
    toolbar: true,
    downloads: ['csv', 'json'],
  },
};

// Zoom controls. A longer time series so the toolbar Zoom in / out / reset (and
// +/-/0 when a point is focused) narrow the x-axis window to the data.
export const Zoom = {
  args: {
    chart_id: 'bdga-chart-zoom',
    chart_type: 'line',
    title: 'Monthly renewable share',
    description: 'Renewable share of generation by month. The toolbar Zoom in / out / reset controls window the x-axis; +/-/0 do the same from the keyboard. Both centre on the focused data point when there is one.',
    theme: 'light',
    source_mode: 'json',
    x_key: 'month',
    y_keys: ['renewable'],
    y_label: 'Renewable share (%)',
    toolbar: true,
    zoom: true,
    rows: [
      { month: '2024-01', renewable: 31 }, { month: '2024-02', renewable: 33 },
      { month: '2024-03', renewable: 35 }, { month: '2024-04', renewable: 38 },
      { month: '2024-05', renewable: 41 }, { month: '2024-06', renewable: 39 },
      { month: '2024-07', renewable: 37 }, { month: '2024-08', renewable: 42 },
      { month: '2024-09', renewable: 45 }, { month: '2024-10', renewable: 47 },
      { month: '2024-11', renewable: 44 }, { month: '2024-12', renewable: 48 },
    ],
  },
};

// Texture fills for colour-blind support. Stacked bar with SVG pattern fills
// layered on the palette; the legend swatches mirror the same motifs.
export const Texture = {
  args: {
    ...Bar.args,
    chart_id: 'bdga-chart-texture',
    chart_type: 'stacked_bar',
    title: 'Generation mix with texture fills',
    description: 'Renewable vs fossil share by year, with pattern fills in addition to colour so adjacent series stay distinguishable without relying on colour.',
    y_keys: ['renewable', 'fossil'],
    texture: true,
  },
};

// Live data.gov.au example. CKAN datastore_search_sql endpoint, MDPR 2026
// resource id 37c7bae2-990d-47e8-bf15-4159a5adc264. The SQL sums the
// 'Total budget (millions)' column (cast to numeric, NFP rows excluded)
// grouped by portfolio, ordered descending. Browser-side: the renderer's
// host allowlist accepts data.gov.au, CORS is open (Access-Control-Allow-
// Origin: *), and the response shape is the standard CKAN
// { result: { records: [...] } } that extractCkanRows() already handles.
//
// config_json mirrors what chart_postprocess.inc emits in Drupal: the JSON
// island is the renderer's single source of truth, so URL-mode charts still
// pick up the author-supplied axis labels without falling back to the raw
// y_key.
const URL_SOURCE_URL = 'https://data.gov.au/data/api/action/datastore_search_sql?sql=SELECT%20%22Portfolio%22%2C%20SUM(%22Total%20budget%20(millions)%22%3A%3Anumeric)%20AS%20total_budget_m%20FROM%20%2237c7bae2-990d-47e8-bf15-4159a5adc264%22%20WHERE%20%22Total%20budget%20(millions)%22%20!%3D%20%27NFP%27%20GROUP%20BY%20%22Portfolio%22%20ORDER%20BY%20total_budget_m%20DESC';

export const UrlSource = {
  args: {
    chart_id: 'bdga-chart-url',
    chart_type: 'bar',
    title: 'Total digital-project budget by portfolio (MDPR 2026)',
    description: 'Live from data.gov.au. Sums the Major Digital Projects Report 2026 budget column by portfolio, ordered highest to lowest, with NFP (not for publication) projects excluded.',
    theme: 'light',
    source_mode: 'url',
    source_url: URL_SOURCE_URL,
    x_key: 'Portfolio',
    y_keys: ['total_budget_m'],
    x_label: 'Portfolio',
    y_label: 'Total budget (AUD millions)',
    rows: [],
    // url mode: the toolbar menu offers a "View source" link to data.gov.au
    // rather than a client-side download.
    toolbar: true,
    config_json: JSON.stringify({
      id: 'bdga-chart-url',
      type: 'bar',
      source: 'url',
      url: URL_SOURCE_URL,
      x_key: 'Portfolio',
      y_keys: ['total_budget_m'],
      x_label: 'Portfolio',
      y_label: 'Total budget (AUD millions)',
    }),
  },
};

// MDPR 2026 Figure 18 - Delivery Confidence Assessment flow, 2025 -> 2026.
// Values are project counts at each tier; budget is the AUD billions on
// the source side (see chart_postprocess.inc parse_sankey_json for the
// passthrough rules).
const MDPR_FIG18_LINKS = [
  { source: '2025: High', target: '2026: High', value: 2 },
  { source: '2025: High', target: '2026: Medium-High', value: 3 },
  { source: '2025: High', target: '2026: Medium', value: 1 },
  { source: '2025: High', target: '2026: Not reported', value: 2 },
  { source: '2025: Medium-High', target: '2026: High', value: 5 },
  { source: '2025: Medium-High', target: '2026: Medium-High', value: 12 },
  { source: '2025: Medium-High', target: '2026: Medium', value: 8 },
  { source: '2025: Medium-High', target: '2026: Medium-Low', value: 1 },
  { source: '2025: Medium-High', target: '2026: Not reported', value: 1 },
  { source: '2025: Medium', target: '2026: High', value: 1 },
  { source: '2025: Medium', target: '2026: Medium-High', value: 4 },
  { source: '2025: Medium', target: '2026: Medium', value: 5 },
  { source: '2025: Medium', target: '2026: Medium-Low', value: 2 },
  { source: '2025: Medium-Low', target: '2026: High', value: 1 },
  { source: '2025: Medium-Low', target: '2026: Medium-High', value: 3 },
  { source: '2025: Medium-Low', target: '2026: Medium', value: 2 },
  { source: '2025: Low', target: '2026: Medium-High', value: 1 },
  { source: '2025: Low', target: '2026: Medium-Low', value: 1 },
  { source: '2025: Not reported', target: '2026: Not reported', value: 1 },
];

// Server-side, parse_sankey_json derives nodes from the link union when
// they aren't supplied. We mimic that here so the Storybook preview matches
// what the Drupal preprocess hook would emit.
const MDPR_FIG18_NODES = (() => {
  const seen = new Set();
  const out = [];
  MDPR_FIG18_LINKS.forEach((l) => {
    [l.source, l.target].forEach((id) => {
      if (!seen.has(id)) {
        seen.add(id);
        out.push({ id });
      }
    });
  });
  return out;
})();

// The Storybook twig render only emits a config_json prop when one is
// passed; we pre-serialise the same payload bdga_preprocess emits so the
// renderer can hydrate without a Drupal round-trip.
const sankeyConfig = (id, type, nodes, links) => JSON.stringify({
  id,
  type,
  source: 'json',
  url: null,
  x_key: 'source',
  y_keys: ['value'],
  x_label: 'Source',
  y_label: 'Projects',
  rows: links.map((l) => ({ source: l.source, target: l.target, value: l.value })),
  color_by: 'series',
  nodes,
  links,
});

export const Sankey = {
  args: {
    chart_id: 'bdga-chart-sankey',
    chart_type: 'sankey',
    title: 'Delivery confidence flow, 2025 to 2026 (MDPR 2026 Fig 18)',
    description: 'Project counts at each Delivery Confidence Assessment tier in 2025 (left) and 2026 (right). Bands show how each 2025 cohort redistributed across 2026 tiers.',
    theme: 'light',
    source_mode: 'json',
    flow_table: true,
    x_key: 'source',
    y_keys: ['value'],
    y_label: 'Projects',
    rows: MDPR_FIG18_LINKS,
    config_json: sankeyConfig('bdga-chart-sankey', 'sankey', MDPR_FIG18_NODES, MDPR_FIG18_LINKS),
  },
};

// Self-loop coverage: a flat-row sankey where source and target labels
// collide on the "no change" diagonal (12 projects that stayed at
// Medium-High between 2025 and 2026). d3-sankey can't render self-edges;
// the renderer's auto-prefix path turns these into "From: Medium-High"
// and "To: Medium-High" so the diagonal flow is preserved rather than
// silently dropped. Authors who prefer cleaner labels prefix in SQL
// (e.g. '2025: ' || "DCA 2025" AS source) - that bypasses the auto-prefix.
const SANKEY_FLAT_WITH_LOOPS = [
  { source: 'High', target: 'High', value: 2 },
  { source: 'High', target: 'Medium-High', value: 3 },
  { source: 'Medium-High', target: 'Medium-High', value: 12 },
  { source: 'Medium-High', target: 'Medium', value: 8 },
  { source: 'Medium', target: 'Medium', value: 5 },
  { source: 'Medium', target: 'Medium-High', value: 4 },
  { source: 'Medium-Low', target: 'Medium', value: 2 },
];
const SANKEY_FLAT_NODES = (() => {
  const seen = new Set();
  const out = [];
  SANKEY_FLAT_WITH_LOOPS.forEach((l) => {
    // Mirror the JS auto-prefix so the storybook preview matches the
    // browser. We can't share buildSankeyFromFlatRows here without
    // pulling the renderer module in - the duplication is small.
    [`From: ${  l.source}`, `To: ${  l.target}`].forEach((id) => {
      if (!seen.has(id)) { seen.add(id); out.push({ id }); }
    });
  });
  return out;
})();
const SANKEY_FLAT_PREFIXED = SANKEY_FLAT_WITH_LOOPS.map((l) => ({
  source: `From: ${  l.source}`,
  target: `To: ${  l.target}`,
  value: l.value,
}));

export const SankeyFlatWithSelfLoops = {
  args: {
    chart_id: 'bdga-chart-sankey-flat',
    chart_type: 'sankey',
    title: 'Sankey with self-loops (flat-row auto-prefix)',
    description: 'A 2-stage flat-row sankey where 12 projects stayed at Medium-High. The renderer detects the source/target label collision and auto-prefixes both sides so the diagonal flow is preserved.',
    theme: 'light',
    source_mode: 'json',
    flow_table: true,
    x_key: 'source',
    y_keys: ['value'],
    y_label: 'Projects',
    rows: SANKEY_FLAT_PREFIXED,
    config_json: sankeyConfig('bdga-chart-sankey-flat', 'sankey', SANKEY_FLAT_NODES, SANKEY_FLAT_PREFIXED),
  },
};

// MDPR 2026 Figure 8 - project status across three reporting years. Each
// link's value is the project count; nodes carry an explicit column hint
// so authors can read the layout from the data.
const MDPR_FIG8_LINKS = [
  { source: '2024: Continuing', target: '2025: Continuing', value: 28 },
  { source: '2024: Continuing', target: '2025: Paused', value: 2 },
  { source: '2024: Continuing', target: '2025: Left', value: 4 },
  { source: '2024: Joined', target: '2025: Continuing', value: 12 },
  { source: '2025: Continuing', target: '2026: Continuing', value: 32 },
  { source: '2025: Continuing', target: '2026: Paused', value: 3 },
  { source: '2025: Continuing', target: '2026: Left', value: 5 },
  { source: '2025: Paused', target: '2026: Continuing', value: 1 },
  { source: '2025: Paused', target: '2026: Paused', value: 1 },
  { source: 'New in 2025', target: '2025: Continuing', value: 10 },
  { source: 'New in 2026', target: '2026: Continuing', value: 8 },
];
const MDPR_FIG8_NODES = (() => {
  const seen = new Set();
  const out = [];
  MDPR_FIG8_LINKS.forEach((l) => {
    [l.source, l.target].forEach((id) => {
      if (!seen.has(id)) {
        seen.add(id);
        out.push({ id });
      }
    });
  });
  return out;
})();

export const Flow = {
  args: {
    chart_id: 'bdga-chart-flow',
    chart_type: 'flow',
    title: 'Project lifecycle, 2024 to 2026 (MDPR 2026 Fig 8)',
    description: 'Project counts moving across joined / continuing / paused / left states between 2024, 2025, and 2026 reporting years.',
    theme: 'light',
    source_mode: 'json',
    flow_table: true,
    x_key: 'source',
    y_keys: ['value'],
    y_label: 'Projects',
    rows: MDPR_FIG8_LINKS,
    config_json: sankeyConfig('bdga-chart-flow', 'flow', MDPR_FIG8_NODES, MDPR_FIG8_LINKS),
  },
};

// Lollipop - sample of MDPR 2026 Figure 12 (every project by total budget,
// tier-coloured). Real story would pull all ~55 projects from data.gov.au;
// the sample here is short enough to read on the canvas.
const MDPR_FIG12_ROWS = [
  { project: 'myGov modernisation', tier: 'High', budget: 580.0 },
  { project: 'Digital ID', tier: 'High', budget: 410.0 },
  { project: 'GovERP', tier: 'Medium', budget: 350.0 },
  { project: 'ATO platform replacement', tier: 'Medium-High', budget: 720.0 },
  { project: 'Permissions Capability', tier: 'Medium', budget: 195.0 },
  { project: 'Medicare digital uplift', tier: 'High', budget: 240.0 },
  { project: 'Visa Modernisation', tier: 'Medium-Low', budget: 165.0 },
  { project: 'Court Case Management', tier: 'Medium', budget: 88.0 },
  { project: 'Defence Records System', tier: 'Low', budget: 62.0 },
  { project: 'Border Operations', tier: 'Medium-High', budget: 305.0 },
];
const MDPR_FIG12_MEDIAN = (() => {
  const sorted = MDPR_FIG12_ROWS.map((r) => r.budget).sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
})();

const lollipopConfig = JSON.stringify({
  id: 'bdga-chart-lollipop',
  type: 'lollipop',
  source: 'json',
  url: null,
  x_key: 'project',
  y_keys: ['budget'],
  x_label: 'Project',
  y_label: 'Total budget ($m)',
  rows: MDPR_FIG12_ROWS,
  color_by: 'category',
  median_value: MDPR_FIG12_MEDIAN,
});

export const Lollipop = {
  args: {
    chart_id: 'bdga-chart-lollipop',
    chart_type: 'lollipop',
    title: 'Total budget by project (MDPR 2026 Fig 12)',
    description: 'Total budget in millions for each Major Digital Project, ordered as the data was loaded. Dots are coloured by Delivery Confidence Assessment tier; the dashed line marks the median project budget.',
    theme: 'light',
    source_mode: 'json',
    x_key: 'project',
    y_keys: ['budget'],
    x_label: 'Project',
    y_label: 'Total budget ($m)',
    rows: MDPR_FIG12_ROWS,
    median_value: MDPR_FIG12_MEDIAN,
    config_json: lollipopConfig,
  },
};

// Cleveland dot plot - high-confidence project counts per portfolio, 2025 vs
// 2026. Live counts from data.gov.au (MDPR 2026 dataset resource
// e33c772c-e59f-43a0-a014-01d066d65e42), merging two single-column GROUP BY
// queries on the dataset's own "DCA 2025" / "DCA 2026" columns (High +
// Medium-High). Two single-resource queries sidestep the cross-resource JOIN
// that 502s; we bake the merged result here the same way chart_postprocess.inc
// would emit it. Rows are sorted by year-on-year change so the gainers read
// from the top.
const MDPR_DCA_HIGH_ROWS = [
  { portfolio: 'Health, Disability and Ageing', 2025: 0, 2026: 5 },
  { portfolio: 'Treasury', 2025: 6, 2026: 7 },
  { portfolio: 'Finance', 2025: 4, 2026: 5 },
  { portfolio: 'Agriculture, Fisheries and Forestry', 2025: 2, 2026: 3 },
  { portfolio: 'Industry, Science and Resources', 2025: 1, 2026: 2 },
  { portfolio: 'Education', 2025: 1, 2026: 2 },
  { portfolio: 'Climate Change, Energy, the Environment and Water', 2025: 4, 2026: 4 },
  { portfolio: 'Home Affairs', 2025: 4, 2026: 4 },
  { portfolio: "Veterans' Affairs (part of the Defence Portfolio)", 2025: 1, 2026: 1 },
  { portfolio: 'Social Services', 2025: 1, 2026: 1 },
  { portfolio: 'Prime Minister and Cabinet', 2025: 1, 2026: 1 },
  { portfolio: 'Foreign Affairs and Trade', 2025: 3, 2026: 2 },
  { portfolio: 'Infrastructure, Transport, Regional Development, Communications, Sport and the Arts', 2025: 2, 2026: 1 },
  { portfolio: "Attorney-General's", 2025: 1, 2026: 0 },
  { portfolio: 'Employment and Workplace Relations', 2025: 3, 2026: 1 },
];

export const ClevelandDotPlot = {
  args: {
    chart_id: 'bdga-chart-cleveland',
    chart_type: 'cleveland',
    title: 'High-confidence projects by portfolio, 2025 vs 2026',
    description: 'Number of Major Digital Projects rated High or Medium-High Delivery Confidence in each portfolio, comparing the 2025 and 2026 assessments. Sorted by year-on-year change.',
    theme: 'light',
    source_mode: 'json',
    x_key: 'portfolio',
    y_keys: ['2025', '2026'],
    x_label: 'Projects rated High or Medium-High',
    rows: MDPR_DCA_HIGH_ROWS,
    config_json: JSON.stringify({
      id: 'bdga-chart-cleveland',
      type: 'cleveland',
      source: 'json',
      url: null,
      x_key: 'portfolio',
      y_keys: ['2025', '2026'],
      x_label: 'Projects rated High or Medium-High',
      y_label: '',
      rows: MDPR_DCA_HIGH_ROWS,
      color_by: 'series',
    }),
  },
};

// Interactive filters: a bar chart of project budgets with a client-side
// filter on the non-axis "tier" dimension. Toggling tiers redraws the chart
// while the data table below stays complete. Filters travel via config_json
// (the renderer reads them there); the `filters` arg renders the bar.
const FILTER_ROWS = [
  { project: 'myGov modernisation', tier: 'High', budget: 580 },
  { project: 'Digital ID', tier: 'High', budget: 410 },
  { project: 'GovERP', tier: 'Medium', budget: 350 },
  { project: 'ATO platform replacement', tier: 'Medium-High', budget: 720 },
  { project: 'Permissions Capability', tier: 'Medium', budget: 195 },
  { project: 'Medicare digital uplift', tier: 'High', budget: 240 },
  { project: 'Visa Modernisation', tier: 'Medium-Low', budget: 165 },
  { project: 'Defence Records System', tier: 'Low', budget: 62 },
  { project: 'Border Operations', tier: 'Medium-High', budget: 305 },
];

export const Filters = {
  args: {
    chart_id: 'bdga-chart-filters',
    chart_type: 'bar',
    title: 'Project budgets, filterable by confidence tier',
    description: 'Total budget per Major Digital Project. Bars are a single colour - across this many projects colour carries no meaning, so the Confidence tier filter (not colour) slices the set and the data table below stays complete.',
    theme: 'light',
    source_mode: 'json',
    x_key: 'project',
    y_keys: ['budget'],
    x_label: 'Project',
    y_label: 'Total budget ($m)',
    rows: FILTER_ROWS,
    toolbar: true,
    filters: [{ key: 'tier', label: 'Confidence tier' }],
    config_json: JSON.stringify({
      id: 'bdga-chart-filters',
      type: 'bar',
      source: 'json',
      url: null,
      x_key: 'project',
      y_keys: ['budget'],
      x_label: 'Project',
      y_label: 'Total budget ($m)',
      rows: FILTER_ROWS,
      color_by: 'single',
      filters: [{ key: 'tier', label: 'Confidence tier' }],
    }),
  },
};
