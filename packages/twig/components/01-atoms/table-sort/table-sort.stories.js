/**
 * CivicTheme Table Sort atom stories.
 *
 * Table Sort is a pure CSS/JS enhancement — there is no Twig template.
 * Apply the class `ct-table--sortable` to any <table> element to enable
 * MOJ-style sortable column header buttons.
 *
 * Pre-sorted columns: add aria-sort="ascending|descending" to a <th>.
 * Custom sort values: add data-sort-value="..." to a <td>.
 *
 * In the twig package, CSS is bundled globally via civictheme.storybook.css,
 * so no per-component CSS imports are needed — only the behaviour JS.
 *
 * @sync-ignore
 * This file intentionally drifts from the SDC source: the SDC version imports
 * per-component .css files so sdc-plugin can discover them; the twig Storybook
 * build has no such files and resolves them globally.
 */

import './table-sort.js';

const meta = {
  title: 'Content/Tables/Table sort',
  tags: ['digitalgovau'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

function teardownTableSort(canvasElement) {
  canvasElement.querySelectorAll('.ct-table--sortable').forEach((el) => {
    if (!el.dataset.tableSortInit) return;
    const next = el.nextElementSibling;
    if (next?.getAttribute('role') === 'status') next.remove();
    delete el.dataset.tableSortInit;
  });
}

export const TableSort = {
  play: async ({ canvasElement }) => {
    teardownTableSort(canvasElement);
    window.DgaTableSort.initAll(canvasElement);
  },
  render: () => `
    <div class="container">
      <div class="row">
        <div class="col-xxs-12">

    <table class="ct-table ct-table--sortable ct-theme-light">
      <thead>
        <tr>
          <th>Entity</th>
          <th>Portfolio</th>
          <th aria-sort="ascending">Year</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Australian Taxation Office</td>
          <td>Treasury</td>
          <td data-sort-value="2024">2024</td>
        </tr>
        <tr>
          <td>Department of Finance</td>
          <td>Finance</td>
          <td data-sort-value="2023">2023</td>
        </tr>
        <tr>
          <td>Services Australia</td>
          <td>Finance</td>
          <td data-sort-value="2025">2025</td>
        </tr>
        <tr>
          <td>Australian Federal Police</td>
          <td>Attorney General's</td>
          <td data-sort-value="2022">2022</td>
        </tr>
        <tr>
          <td>Digital Transformation Agency</td>
          <td>Finance</td>
          <td data-sort-value="2024">2024</td>
        </tr>
      </tbody>
    </table>
    </div></div></div>
  `,
};

export const TableSortWithPreSortedColumn = {
  name: 'Pre-sorted Column (descending)',
  play: async ({ canvasElement }) => {
    teardownTableSort(canvasElement);
    window.DgaTableSort.initAll(canvasElement);
  },
  render: () => `
    <div class="container">
      <div class="row">
        <div class="col-xxs-12">
    <table class="ct-table ct-table--sortable ct-theme-light">
      <thead>
        <tr>
          <th aria-sort="descending">Entity</th>
          <th>Portfolio</th>
          <th>Year</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Australian Taxation Office</td>
          <td>Treasury</td>
          <td data-sort-value="2024">2024</td>
        </tr>
        <tr>
          <td>Department of Finance</td>
          <td>Finance</td>
          <td data-sort-value="2023">2023</td>
        </tr>
        <tr>
          <td>Services Australia</td>
          <td>Finance</td>
          <td data-sort-value="2025">2025</td>
        </tr>
        <tr>
          <td>Australian Federal Police</td>
          <td>Attorney General's</td>
          <td data-sort-value="2022">2022</td>
        </tr>
        <tr>
          <td>Digital Transformation Agency</td>
          <td>Finance</td>
          <td data-sort-value="2024">2024</td>
        </tr>
      </tbody>
    </table>
  </div></div></div>
  `,
};
