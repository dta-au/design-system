---
title: 'Filter sidebar'
description: 'A persistent sidebar filter panel for search result and catalogue pages.'
component-type: Navigation
rendered-by: [02-molecules/group-filter, 02-molecules/single-filter]
---

Use a filter sidebar on search result and catalogue pages where users need to narrow a large set of results by multiple criteria. Filters are always visible in the sidebar, so the component needs no trigger button. Applied filter tags are not required alongside them either.

The correct HTML order on a page is: hero banner → filter sidebar (left) → card listing or table (right).

## When to use

- the page presents a large collection of items that users need to narrow by multiple attributes
- filters are relevant to most users and benefit from being always visible
- the layout supports a two-column arrangement with the sidebar on the left

## When not to use

- when there are only one or two filters – inline filters above the listing are sufficient
- on pages where a persistent sidebar would dominate the layout on small viewports – consider the search filters pattern with a trigger button instead
- for in-page or section navigation – use [Sub-nav](/components/sub-nav/) instead

## Related components

- [Table](/components/table/) – use alongside a filter sidebar when results are best presented in tabular form.
- [Sub-nav](/components/sub-nav/) – use for within-section navigation, not filtering.

## Accessibility

- The sidebar is a labelled region, so assistive technology can find the filters and skip past them (WCAG 1.3.1 Info and Relationships).
- Every filter control keeps a visible label. A group of filters carries a group label as well (WCAG 3.3.2 Labels or Instructions).
- The component announces the new result count after each filter change, so a screen reader user knows the listing moved (WCAG 4.1.3 Status Messages).
- Focus stays on the control the user just changed. Never move focus into the results (WCAG 2.4.3 Focus Order).

## Related patterns

- [Search filters](/patterns/search-filters/) – use this pattern when a trigger button reveals the filters instead of a permanent sidebar.
