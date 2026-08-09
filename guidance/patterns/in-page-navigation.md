---
title: 'In-page navigation'
description: 'Helping users orient within a page or section without returning to the top-level navigation.'
---

In-page navigation helps users understand the structure of a page or section and move directly to the content they need. It differs from site navigation (the primary menu) and section navigation (Sub-nav). Those help users move between pages. In-page navigation helps users move within a single page.

One component implements in-page navigation on digital.gov.au:

- **[Table of contents](/components/table-of-contents/)** – an anchor-linked list generated from the current page's H2s, nesting down to H4 where a page opts deeper

## Choosing the right approach

Use this table to decide which approach is appropriate.

| Situation | Use |
|---|---|
| Long page with four or more listed headings, single-page content | Table of contents |
| Page belongs to a multi-page section users navigate between | Sub-nav |
| Long page in a Sub-nav section with four or more listed headings | Sub-nav and Table of contents |
| Short page with fewer than four listed headings | Neither |
| Page is part of a step-by-step form or focus-mode flow | Neither |

Sub-nav and the Table of contents answer different questions. Sub-nav shows where the page sits in its section. The Table of contents shows what sits on the page. A long chapter page carries both – report body chapters are the main case. Do not repeat the section's page list inside a Table of contents – two lists with the same links compete.

## Table of contents

Use a Table of contents when:

- the page has four or more listed headings
- the page is a long or medium guide, report body section, or policy document
- users benefit from scanning the structure before deciding where to read

Count the headings the list will show, not every heading on the page. By default that means H2s, so a page with three H2s and a dozen H3s does not clear the threshold.

Do not use a Table of contents when:

- the page has fewer than four listed headings – a short page does not need navigation
- the entries would be section pages rather than headings on the page – between-page navigation belongs to Sub-nav
- the page is a section landing page – landing pages use card grids for navigation, not anchor links
- the page is a step-by-step wizard or focus-mode form – sequential flows should not offer navigation shortcuts

Position the Table of contents directly below the page introduction, before the first H2. Authors enable it per page in the CMS; it generates automatically from the page's headings and does not require manual maintenance. It lists H2s at the top level. A page that opts deeper nests H3 one step under its parent H2, and H4 one size smaller.

### The On this page treatment

Long full-width pages render the Table of contents with the title 'On this page', below the introduction.

- Any page can carry the treatment: set `toc: true` in frontmatter. Foundations pages carry it by default; a short foundations page opts out with `toc: false`.
- Keep the title 'On this page' – the mechanism fixes it, and no page overrides it.
- The list covers H2s. Where sub-headings are genuine navigation targets rather than reference detail, opt deeper with `toc-max-level` in frontmatter – an integer from 2 to 4, default 2. A page whose H3s name distinct tasks earns 3; choose 4 only where H4s are destinations in their own right. Repeated sub-headings are the signal to stay at 2 – a list of near-identical entries navigates nothing.
- A page carrying the treatment renders full width.

## Sub-nav

Use Sub-nav when:

- the current page belongs to a clearly bounded section with multiple sibling pages
- users are likely to move between pages in the section while reading
- the section has a consistent, stable set of pages you can list without confusion

Do not use Sub-nav when:

- the section contains only one or two pages – the overhead outweighs the benefit
- the section changes frequently – an unstable list of links erodes trust
- the page is standalone and does not belong to a defined section

Sub-nav appears as a persistent sidebar alongside the main content. It shows all pages in the section, with the current page indicated. Editors configure it at the section level, not per page.

## Anchor links in body text

For short pages or pages where only one or two sections benefit from direct linking, inline anchor links within body text are sufficient. This is not a component – it is standard HTML linking practice. Use it when:

- a related page or resource needs to point to a specific section of a long guide
- a single section is frequently referenced externally and benefits from a stable URL

Do not substitute inline anchor links for a Table of contents on pages that warrant structured navigation. Scattered anchor links in body text do not give users an overview of the page structure.

## Related components

- [Table of contents](/components/table-of-contents/) – in-page anchor navigation generated from the page's headings
- [Sub-nav](/components/sub-nav/) – section-level navigation between sibling pages
- [Filter sidebar](/components/filter-sidebar/) – filtering for search and catalogue pages; not a navigation component
