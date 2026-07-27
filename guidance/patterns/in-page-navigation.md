---
title: 'In-page navigation'
description: 'Helping users orient within a page or section without returning to the top-level navigation.'
---

In-page navigation helps users understand the structure of a page or section and move directly to the content they need. It is distinct from site navigation (the primary menu) and section navigation (Sub-nav): those help users move between pages; in-page navigation helps users move within a single page.

One component implements in-page navigation on digital.gov.au:

- **[Table of contents](/components/table-of-contents/)** – an anchor-linked list generated from the headings on the current page, H2 to H4, nested

## Choosing the right approach

Use this table to decide which approach is appropriate.

| Situation | Use |
|---|---|
| Long page with four or more headings (H2 to H4), single-page content | Table of contents |
| Page belongs to a multi-page section users navigate between | Sub-nav |
| Short page with fewer than four headings | Neither |
| Page is part of a step-by-step form or focus-mode flow | Neither |
| Section has a persistent sidebar already in use | Sub-nav only |

If a page is part of a section *and* has four or more headings, Sub-nav takes priority. Adding a Table of contents inside a Sub-nav layout creates two competing navigation signals on the same page.

## Table of contents

Use a Table of contents when:

- the page has four or more headings (H2 to H4)
- the page is a long or medium guide, report body section, or policy document
- users benefit from scanning the structure before deciding where to read

Do not use a Table of contents when:

- the page has fewer than four headings – a short page does not need navigation
- the page already uses Sub-nav – do not show both
- the page is a section landing page – landing pages use card grids for navigation, not anchor links
- the page is a step-by-step wizard or focus-mode form – sequential flows should not offer navigation shortcuts

Position the Table of contents directly below the page introduction, before the first H2. Authors enable it per page in the CMS; it generates automatically from the page's headings – H2 at the top level, H3 nested one step under its parent H2, H4 holding that indent one size smaller – and does not require manual maintenance.

### The On this page treatment

Long full-width pages – pages with no Sub-nav or persistent sidebar – render the Table of contents with the title 'On this page', below the introduction. On digital.gov.au this treatment applies to the foundations pages.

- Keep the title 'On this page' – do not vary it per page.
- The treatment pairs with the full-width layout only. Pages with a section sidebar keep Sub-nav and do not add a Table of contents.

## Sub-nav

Use Sub-nav when:

- the current page belongs to a clearly bounded section with multiple sibling pages
- users are likely to move between pages in the section while reading
- the section has a consistent, stable set of pages that can be listed without confusion

Do not use Sub-nav when:

- the section contains only one or two pages – the overhead outweighs the benefit
- the section changes frequently – an unstable list of links erodes trust
- the page is standalone and does not belong to a defined section

Sub-nav appears as a persistent sidebar alongside the main content. It shows all pages in the section, with the current page indicated. It is configured at the section level, not per page.

## Anchor links in body text

For short pages or pages where only one or two sections benefit from direct linking, inline anchor links within body text are sufficient. This is not a component – it is standard HTML linking practice. Use it when:

- a related page or resource needs to point to a specific section of a long guide
- a single section is frequently referenced externally and benefits from a stable URL

Do not substitute inline anchor links for a Table of contents on pages that warrant structured navigation. Scattered anchor links in body text do not give users an overview of the page structure.

## Related components

- [Table of contents](/components/table-of-contents/) – in-page anchor navigation generated from the page's headings
- [Sub-nav](/components/sub-nav/) – section-level navigation between sibling pages
- [Filter sidebar](/components/filter-sidebar/) – filtering for search and catalogue pages; not a navigation component
