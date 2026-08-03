/**
 * digital.gov.au Chart Collection component stories.
 */

// BDGA Chart Collection - Storybook stories.

import Component from './chart-collection.twig';

export default {
  title: 'Content/Charts/Chart collection',
  tags: ['digitalgovau'],
  component: Component,
  argTypes: {
    collection_id: { control: 'text' },
    title: { control: 'text' },
    description: { control: 'text' },
    theme: { control: 'select', options: ['light', 'dark'] },
    heading_level: { control: { type: 'number', min: 2, max: 6 } },
    columns: { control: 'select', options: [1, 2, 3] },
    toolbar: { control: 'boolean' },
    vertical_spacing: { control: 'select', options: ['none', 'top', 'bottom', 'both'] },
    panels: { control: 'object' },
    modifier_class: { control: 'text' },
  },
};

const GENERATION_ROWS = [
  { year: '2022', renewable: 32, fossil: 68 },
  { year: '2023', renewable: 36, fossil: 64 },
  { year: '2024', renewable: 40, fossil: 60 },
  { year: '2025', renewable: 44, fossil: 56 },
];

const BUDGET_ROWS = [
  { project: 'myGov modernisation', budget: 580 },
  { project: 'Digital ID', budget: 410 },
  { project: 'GovERP', budget: 350 },
  { project: 'Permissions Capability', budget: 195 },
  { project: 'Visa Modernisation', budget: 165 },
];

// Mimic the config_json island chart_postprocess.inc emits per chart, so the
// panels hydrate the same way they would in Drupal.
const panel = (p, colorBy) => ({
  ...p,
  config_json: JSON.stringify({
    id: p.chart_id,
    type: p.chart_type,
    source: 'json',
    url: null,
    x_key: p.x_key,
    y_keys: p.y_keys,
    x_label: p.x_label || p.x_key,
    y_label: p.y_label || '',
    rows: p.rows,
    color_by: colorBy || 'series',
    median_value: typeof p.median_value === 'number' ? p.median_value : null,
  }),
});

// Autodocs renders every story on one page, so panel ids must be unique per
// story - build each story's panel set with its own prefix.
const panelSet = (prefix) => [
  panel({
    chart_id: `${prefix}-renewables`,
    chart_type: 'bar',
    title: 'Renewable share by year',
    x_key: 'year',
    y_keys: ['renewable'],
    y_label: 'Share (%)',
    rows: GENERATION_ROWS,
  }, 'single'),
  panel({
    chart_id: `${prefix}-mix-trend`,
    chart_type: 'line',
    title: 'Generation mix trend',
    x_key: 'year',
    y_keys: ['renewable', 'fossil'],
    y_label: 'Share (%)',
    rows: GENERATION_ROWS,
  }),
  panel({
    chart_id: `${prefix}-mix-2025`,
    chart_type: 'donut',
    title: 'Generation mix - 2025',
    x_key: 'source',
    y_keys: ['share'],
    y_label: 'Share (%)',
    rows: [
      { source: 'Renewable', share: 44 },
      { source: 'Fossil', share: 52 },
      { source: 'Storage', share: 4 },
    ],
  }),
  panel({
    chart_id: `${prefix}-budgets`,
    chart_type: 'lollipop',
    title: 'Budget by project',
    x_key: 'project',
    y_keys: ['budget'],
    y_label: 'Total budget ($m)',
    rows: BUDGET_ROWS,
    median_value: 350,
  }, 'single'),
];

export const ChartCollection = {
  args: {
    collection_id: 'bdga-chart-collection-demo',
    title: 'Electricity generation overview',
    description: 'Four related views of the generation and project data, each with its own underlying data table.',
    theme: 'light',
    heading_level: 2,
    columns: 2,
    toolbar: true,
    panels: panelSet('cc-demo'),
  },
};

export const ThreeColumns = {
  args: {
    ...ChartCollection.args,
    collection_id: 'bdga-chart-collection-three',
    columns: 3,
    panels: panelSet('cc-three').slice(0, 3),
  },
};

export const NoToolbar = {
  args: {
    ...ChartCollection.args,
    collection_id: 'bdga-chart-collection-plain',
    toolbar: false,
    columns: 2,
    panels: panelSet('cc-plain').slice(0, 2),
  },
};

export const Dark = {
  globals: { backgrounds: { value: 'dark' } },
  args: {
    ...ChartCollection.args,
    collection_id: 'bdga-chart-collection-dark',
    theme: 'dark',
    panels: panelSet('cc-dark'),
  },
};

// Panels using the chart's swap-table variant: each corner icon swaps that
// panel in place, and the collection control still switches every panel.
export const SwapPanels = {
  args: {
    ...ChartCollection.args,
    collection_id: 'bdga-chart-collection-swap',
    title: 'Overview with swap-table panels',
    description: 'Each panel swaps in place between its chart and its data table; the collection control switches all of them at once.',
    panels: panelSet('cc-swap').map((p) => ({ ...p, table_toggle: 'swap' })),
  },
};
