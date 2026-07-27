/**
 * CivicTheme Filterable Table component stories.
 *
 * The component targets an existing on-page table by ID. Each story renders
 * a demo table followed by the filter component so the JS can connect them.
 *
 * In the twig package, CSS is bundled globally via civictheme.storybook.css,
 * so no per-component CSS imports are needed – only the behaviour JS that the
 * sortable-columns story relies on.
 *
 * @sync-ignore
 * This file intentionally drifts from the SDC source: the SDC version imports
 * per-component .css files so sdc-plugin can discover them; the twig Storybook
 * build has no such files and resolves them globally.
 */

import Component from './filterable-table.twig';
import FilterableTableData from './filterable-table.stories.data';
import '../../01-atoms/table-sort/table-sort.js';

const meta = {
  title: 'Content/Tables/Filterable table',
  component: Component,
  tags: ['digitalgovau'],
  argTypes: {
    theme: {
      control: { type: 'radio' },
      options: ['light', 'dark'],
    },
    table_id: {
      control: { type: 'text' },
    },
    target_type: {
      control: { type: 'radio' },
      options: ['table', 'list'],
    },
    title: {
      control: { type: 'text' },
    },
    columns: {
      control: { type: 'object' },
    },
    vertical_spacing: {
      control: { type: 'radio' },
      options: ['none', 'top', 'bottom', 'both'],
    },
    with_background: {
      control: { type: 'boolean' },
    },
    modifier_class: {
      control: { type: 'text' },
    },
  },
};

export default meta;

function teardownFilterableTable(canvasElement) {
  canvasElement.querySelectorAll('[data-dga-filterable-table]').forEach((el) => {
    if (!el.dataset.filterableTableInit) return;
    // HMR: strip dynamically-added options so re-init won't duplicate them.
    el.querySelectorAll('[data-filter-type="select"]').forEach((sel) => {
      while (sel.options.length > 1) sel.remove(1);
    });
    delete el.dataset.filterableTableInit;
  });
}

function teardownTableSort(canvasElement) {
  canvasElement.querySelectorAll('.ct-table--sortable').forEach((el) => {
    if (!el.dataset.tableSortInit) return;
    // Same DOM (HMR): remove the aria-live status div inserted after the table.
    const next = el.nextElementSibling;
    if (next?.getAttribute('role') === 'status') next.remove();
    delete el.dataset.tableSortInit;
  });
}

export const FilterableTable = {
  parameters: {
    layout: 'padded',
  },
  render: (args) => Component(args) + FilterableTableData.demoTable,
  args: FilterableTableData.args('light'),
  play: async ({ canvasElement }) => {
    teardownFilterableTable(canvasElement);
    window.DgaFilterableTable.initAll(canvasElement);
  },
};

export const FilterableTableDark = {
  parameters: {
    layout: 'padded',
  },
  render: (args) => Component(args) + FilterableTableData.demoTable,
  args: FilterableTableData.args('dark'),
  globals: {
    backgrounds: {
      value: 'dark',
    },
  },
  play: async ({ canvasElement }) => {
    teardownFilterableTable(canvasElement);
    window.DgaFilterableTable.initAll(canvasElement);
  },
};

export const FilterableTableWithBackground = {
  parameters: {
    layout: 'padded',
  },
  render: (args) => Component(args) + FilterableTableData.demoTable,
  args: FilterableTableData.args('light', { with_background: true, vertical_spacing: 'both' }),
  play: async ({ canvasElement }) => {
    teardownFilterableTable(canvasElement);
    window.DgaFilterableTable.initAll(canvasElement);
  },
};

export const FilterableTableSortable = {
  name: 'With sortable columns',
  parameters: {
    layout: 'padded',
  },
  render: (args) => Component(args) + FilterableTableData.demoSortableTable,
  args: FilterableTableData.args('light'),
  play: async ({ canvasElement }) => {
    teardownFilterableTable(canvasElement);
    teardownTableSort(canvasElement);
    window.DgaFilterableTable.initAll(canvasElement);
    window.DgaTableSort.initAll(canvasElement);
  },
};

// Same controls + behaviour driving a <dl> summary-list (target_type: list).
// The <dl> is server-rendered and fully usable with JS off (progressive
// enhancement); the controls only enhance it. Each row matches on its
// data-filter-col-N attributes, not the displayed text.
export const FilterableList = {
  name: 'Filterable definition list',
  parameters: {
    layout: 'padded',
  },
  render: (args) => Component(args) + FilterableTableData.demoList,
  args: FilterableTableData.listArgs('light'),
  play: async ({ canvasElement }) => {
    teardownFilterableTable(canvasElement);
    window.DgaFilterableTable.initAll(canvasElement);
  },
};
