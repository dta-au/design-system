/**
 * digital.gov.au Filterable Table component stories.
 */

import Component from './filterable-table.twig';
import FilterableTableData from './filterable-table.stories.data';
// Sort behaviour ships with the table-sort atom — required for the
// FilterableTableSortable story to inject sort buttons.
import '../../01-atoms/table-sort/table-sort.css';
import '../../01-atoms/table-sort/table-sort.js';
// Demo tables are raw HTML (not rendered via table.twig), so table.js — which
// adds data-title attrs that drive the mobile column-label pseudo-elements —
// won't be auto-discovered. Import the CSS that defines the pseudo-element rule
// alongside it, since the same Twig-import auto-discovery is bypassed.
import '../../01-atoms/table/table.js';
import '../../01-atoms/table/table.css';
// filterable-table.twig emits raw <input class="ct-input"> and
// <select class="ct-select"> rather than including the atom Twig partials, so
// sdc-plugin doesn't auto-discover those atoms' CSS. Without these the form
// controls fall back to browser-default Arial/no-padding/native-border styling.
import '../../01-atoms/input/input.css';
import '../../01-atoms/select/select.css';
// The FilterableList story renders a summary-list <dl> as raw HTML (not via
// summary-list.twig), so its CSS isn't auto-discovered either.
import '../../01-atoms/summary-list/summary-list.css';

const meta = {
  title: 'Content/Tables/Filterable table',
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
    is_contained: {
      control: { type: 'boolean' },
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
