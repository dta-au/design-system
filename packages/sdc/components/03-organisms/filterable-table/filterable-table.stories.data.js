/**
 * CivicTheme Filterable Table component story data.
 */

const tableRows = `
      <tr>
        <td>Finance</td>
        <td>Australian Electoral Commission</td>
        <td>Mandatory</td>
      </tr>
      <tr>
        <td>Finance</td>
        <td>Department of Finance</td>
        <td>Mandatory</td>
      </tr>
      <tr>
        <td>Finance</td>
        <td>Services Australia</td>
        <td>Mandatory</td>
      </tr>
      <tr>
        <td>Treasury</td>
        <td>Australian Taxation Office</td>
        <td>Mandatory</td>
      </tr>
      <tr>
        <td>Treasury</td>
        <td>Australian Bureau of Statistics</td>
        <td>Mandatory</td>
      </tr>
      <tr>
        <td>Defence</td>
        <td>Defence Housing Australia</td>
        <td>Voluntary</td>
      </tr>
      <tr>
        <td>Defence</td>
        <td>Department of Veterans' Affairs</td>
        <td>Voluntary</td>
      </tr>
      <tr>
        <td>Health, Disability and Ageing</td>
        <td>Australian Digital Health Agency</td>
        <td>Voluntary</td>
      </tr>`;

const tableHead = `
      <tr>
        <th>Portfolio</th>
        <th>Entity</th>
        <th>Type</th>
      </tr>`;

const demoTable = `
<div class="container"><div class="row"><div class="col-xxs-12">
  <table id="demo-filterable-table" class="ct-table">
    <thead>${tableHead}
    </thead>
    <tbody>${tableRows}
    </tbody>
  </table>
</div> </div> </div>
`;

// Same table with ct-table--sortable added — enables column sort buttons
// alongside the filter controls. Used by the FilterableTableSortable story.
const demoSortableTable = `
<div class="container"><div class="row"><div class="col-xxs-12">
    <table id="demo-filterable-table" class="ct-table ct-table--sortable">
    <thead>${tableHead}
    </thead>
    <tbody>${tableRows}
    </tbody>
  </table>
</div> </div> </div>
`;

// Definition-list target — a glossary of terms, the canonical <dl> use case
// (term -> definition). Each row carries data-filter-row + data-filter-col-N so
// the same controls filter on clean values independent of the displayed text.
// Column order: 0 Term (text, shown as the <dt>), 1 Category (select). Category
// is a filter dimension that is NOT shown in the row, which demonstrates the
// decoupling the data-filter-col-N contract provides. Rendered as raw HTML
// (matching demoTable) rather than via summary-list.twig, so summary-list.css
// is imported explicitly in the SDC stories file.
const listItems = [
  ['Accessibility', 'Inclusion', 'Designing services so everyone, including people with disability, can use them.'],
  ['API', 'Architecture', 'Application Programming Interface — a defined way for systems to exchange data.'],
  ['Design system', 'Design', 'A library of reusable components and standards for building consistent services.'],
  ['Discovery', 'Delivery', 'The first phase of a project, used to understand user needs and constraints.'],
  ['Open data', 'Data', 'Data published in a reusable, openly licensed, machine-readable format.'],
  ['Pattern', 'Design', 'A reusable, documented solution to a common design problem.'],
  ['Service standard', 'Delivery', 'The criteria a government service is designed and assessed against.'],
  ['User research', 'Inclusion', 'Talking to and observing users to understand their needs and behaviours.'],
];

const listRows = listItems.map(([term, category, definition]) => `
      <div
        class="ct-summary-list__row"
        data-filter-row
        data-filter-col-0="${term}"
        data-filter-col-1="${category}"
      >
        <dt class="ct-summary-list__key">${term}</dt>
        <dd class="ct-summary-list__value">${definition}</dd>
      </div>`).join('');

const demoList = `
<div class="container"><div class="row"><div class="col-xxs-12">
  <dl id="demo-filterable-list" class="ct-summary-list ct-theme-light">${listRows}
  </dl>
</div> </div> </div>
`;

export default {
  args(theme = 'light', overrides = {}) {
    return {
      theme,
      table_id: 'demo-filterable-table',
      target_type: 'table',
      title: 'Filter the table',
      columns: [
        { label: 'Portfolio', filter_type: 'select' },
        { label: 'Entity', filter_type: 'text' },
        { label: 'Type', filter_type: 'select' },
      ],
      vertical_spacing: 'none',
      with_background: false,
      attributes: null,
      modifier_class: '',
      ...overrides,
    };
  },
  listArgs(theme = 'light', overrides = {}) {
    return {
      theme,
      table_id: 'demo-filterable-list',
      target_type: 'list',
      title: 'Filter the glossary',
      columns: [
        { label: 'Term', filter_type: 'text' },
        { label: 'Category', filter_type: 'select' },
      ],
      vertical_spacing: 'none',
      with_background: false,
      attributes: null,
      modifier_class: '',
      ...overrides,
    };
  },
  demoTable,
  demoSortableTable,
  demoList,
};
