---
title: 'Chapter nav'
description: 'Previous and next links that move the reader through pages in a fixed reading order.'
component-type: Navigation
---

Use chapter nav at the foot of a page that belongs to an ordered sequence. It renders two links: the page before and the page after. Each link carries the title of its destination, so the reader knows what comes next before they commit.

## When to use

- report chapters that a reader takes in order, including front matter
- numbered rules, criteria or standards that run as a sequence
- framework or methodology steps where each step builds on the one before
- dated communiques that a reader works through by date

## When not to use

- listings, search results and any paged dataset – use [pagination](/patterns/pagination/)
- a single cross-surface action at the end of a page – use [next step](/components/next-step/)
- pages that a reader takes in any order – use [section navigation](/patterns/section-navigation/)
- multi-step forms – use a [progress indicator](/components/progress-indicator/) inside focus mode

## Do

- give every page in the sequence the same chapter nav, so traversal never dead-ends
- name the destination in the link text, using the chapter title
- relabel the landmark to match the sequence, such as Criterion or Step
- drop the previous link on the first page and the next link on the last page

## Don't

- do not add page numbers, an items-per-page control or an ellipsis
- do not point the next link at an unrelated surface, because the sequence then misleads
- do not render chapter nav on a page that sits outside the sequence
- do not use the word 'next' alone as link text, because it names no destination

## Accessibility

- The component renders a `nav` landmark named by the `title` prop. A screen reader lists it among the page's landmarks (WCAG 1.3.1 Info and Relationships).
- Each link names its destination chapter, so the link purpose survives out of context (WCAG 2.4.4 Link purpose).
- The direction arrows carry `aria-hidden="true"` because the visible label already states the direction (WCAG 1.1.1 Non-text Content).
- The direction label states 'Previous' and 'Next' as text, so direction never depends on the arrow's position or colour (WCAG 1.4.1 Use of Colour).
- The links keep source order, so the tab order matches the reading order (WCAG 2.4.3 Focus Order).

## Related components

- [Next step](/components/next-step/) – use for one cross-surface action at the end of a page.
- [Table of contents](/components/table-of-contents/) – use for jumping between sections of one page.
- [Progress indicator](/components/progress-indicator/) – use for a reader's position in a multi-step form.

## Related patterns

- [Chapter navigation](/patterns/chapter-navigation/) – the pattern that decides when a sequence warrants this component.
- [Pagination](/patterns/pagination/) – the pattern for listings and result sets.
