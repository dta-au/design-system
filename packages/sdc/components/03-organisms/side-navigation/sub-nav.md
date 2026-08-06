---
title: 'Sub-nav'
description: 'Secondary navigation for moving between pages within a section.'
component-type: Navigation
---

Use a sub-nav to help users move between the pages within a section without returning to the top-level navigation. It appears as a persistent list of links alongside the page content.

## When to use

- the current section contains multiple pages that users are likely to navigate between
- the section has a clearly bounded scope – for example, a program, a service area, or a policy topic
- users need to understand what else is available in the section while reading a page

## When not to use

- for in-page navigation (links to sections within the same page) – use [Table of contents](/components/table-of-contents/) instead
- as the primary site navigation
- on standalone pages that do not belong to a defined section
- when the section contains only one or two pages – a sub-nav adds navigation overhead without benefit

## Accessibility

- The component renders a navigation landmark, so assistive technology can jump to it or skip past it (WCAG 2.4.1 Bypass Blocks).
- The component marks the current page in text as well as by styling (WCAG 1.4.1 Use of Colour).
- Link text matches the title of the page it points at, so readers can predict the destination (WCAG 2.4.4 Link purpose).

## Related components

- [Table of contents](/components/table-of-contents/) – use for in-page navigation generated from H2 headings on the current page.
- [Filter sidebar](/components/filter-sidebar/) – use to filter search results or catalogue listings, not for page navigation.

## Related patterns

- [Section navigation](/patterns/section-navigation/) – guidance on when to use a sub-nav strip versus side navigation based on section depth and size.
