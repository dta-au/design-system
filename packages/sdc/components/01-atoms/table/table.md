---
title: 'Table'
description: 'A structured display of data in rows and columns.'
component-type: Data
---

Use tables to present data that users need to scan, compare, or look up. Tables work well when information has a clear row-and-column structure and relationships between cells matter.

## When to use

- data has a meaningful row-and-column structure
- users need to compare values across rows or columns
- the data cannot be adequately expressed as a list or prose

## When not to use

- for layout purposes – tables are for data, not for arranging page elements
- when the data has only one column – a list is more appropriate
- when all rows contain the same value in most columns – reconsider the data structure

## Variants

The component ships five variants. Pick the one that matches how readers use the data.

### Standard

A basic table with column headers, an optional caption, and optional zebra striping for readability.

### Sortable

Column headers become interactive sort controls. A click sorts that column ascending; a second click sorts descending. Only one column sorts at a time. An icon shows the sort direction.

### Filterable

Connects to the search-filters pattern. Three filter configurations apply depending on the number of filters:

- **Small (1–2 filters):** filters appear inline above the table, with no applied filter tags.
- **Medium (3–6 filters):** primary filters appear inline; the rest sit in an accordion behind 'Show filters'. Applied filters appear as dismissible tags.
- **Large (6+ filters):** primary filters appear inline; the rest sit in a drawer behind 'Show filters'. The drawer carries Apply, Clear, Close, and Cancel actions. Applied filters appear as dismissible tags.

### Wide tables

When table content overflows its container, a custom horizontal scrollbar renders at the bottom of the table. The scrollbar sticks to the bottom of the viewport when the bottom of the table is off-screen, so users can scroll horizontally from any row.

### Spanning cells

Cells can span multiple columns (`colSpan`) or rows (`rowSpan`) to represent data with genuinely hierarchical relationships. Use spanning cells only when the data relationship is inherently multi-dimensional. Do not use them to create visual layout effects.

## Accessibility

- Every table needs a caption that says what the data covers, so a reader knows the subject before the values (WCAG 1.3.1 Info and Relationships).
- Header cells must use `<th>` with a scope. Assistive technology then reads each value with its row and column header (WCAG 1.3.1 Info and Relationships).
- A sort control reports its current direction, so the reader hears the order as well as seeing the icon (WCAG 4.1.2 Name, Role, Value).
- A wide table scrolls horizontally from the keyboard as well as the pointer (WCAG 2.1.1 Keyboard).

## Related components

- [Filter sidebar](/components/filter-sidebar/) – use when filters should be persistently visible in a sidebar alongside the table.
- [Summary list](/components/summary-list/) – use for structured name–value pairs rather than rows-and-columns data.

## Related patterns

- Search filters – use to connect filter controls to a filterable table.
- Pagination – use to limit the number of rows displayed at once in large datasets.
