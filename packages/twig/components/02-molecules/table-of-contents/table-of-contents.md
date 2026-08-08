---
title: 'Table of contents'
description: 'In-page navigation generated from the headings on a page.'
component-type: Navigation
---

Use a table of contents to help users scan the structure of a long page and jump directly to a section. It generates automatically from the headings on the page. H2 headings sit at the top level. H3 headings nest one step under their parent H2, and H4 headings hold that indent one size smaller. Authors enable it per page, not by building the list manually. It renders as an anchored list at the top of the content area, before the first H2.

## When to use

- the page is a long or medium-length guide with multiple sections
- the page has four or more headings (H2 to H4)
- users benefit from scanning the page structure before deciding which section to read

## When not to use

- the page has fewer than four headings – a short page does not need navigation
- the page is a step-by-step wizard flow where users must progress linearly
- the section already has page-level navigation provided by [Sub-nav](/components/sub-nav/)

## Accessibility

- The list renders as a navigation landmark, so assistive technology can jump to it or skip past it (WCAG 2.4.1 Bypass Blocks).
- Every entry points at a real heading on the page. The list mirrors the outline instead of restating it (WCAG 1.3.1 Info and Relationships).
- An entry moves focus to its section, so a keyboard user lands where a sighted user looks (WCAG 2.4.3 Focus Order).

## Related components

- [Sub-nav](/components/sub-nav/) – use for navigation between pages in a section, not within a single page.
- [Accordion](/components/accordion/) – use to collapse optional content rather than link to it.

## Related patterns

- [In-page navigation](/patterns/in-page-navigation/) – guidance on when and how to use in-page navigation across different page types.
