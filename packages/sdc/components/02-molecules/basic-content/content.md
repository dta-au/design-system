---
title: 'Content'
description: 'The rich text body component for free-form page content.'
component-type: Content
---

Content is the primary paragraph type for body text on a page. It supports all standard rich text formatting: headings, paragraphs, lists, links, images, and tables. Most page types include at least one Content paragraph.

## When to use

- as the default paragraph type for body text on any page
- for content that does not fit a more specific component – explanatory text, instructions, summaries
- when editors need flexibility to use multiple formatting elements on a single page

## When not to use

- when a more specific component is available – use [Callout](/components/callout/) for highlighted snippets, [Timeline](/components/timeline/) for ordered processes, or [Table](/components/table/) for structured data
- to produce layout structure – use layout components rather than formatting a Content paragraph for positioning

## Accessibility

- Headings inside the body must step down one level at a time. The page title is the H1, so body headings start at H2 (WCAG 1.3.1 Info and Relationships).
- Link text must name its destination on its own. Never publish 'read more' or 'click here' (WCAG 2.4.4 Link purpose).
- Every image an editor adds needs alt text, or empty alt text when the image only decorates (WCAG 1.1.1 Non-text Content).

## Related components

- [Callout](/components/callout/) – use to draw attention to a short important message within or alongside body text.
- [Table](/components/table/) – use when the content has rows and columns.
- [Summary list](/components/summary-list/) – use for structured name–value pairs.
