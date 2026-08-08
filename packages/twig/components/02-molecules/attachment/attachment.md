---
title: 'Attachment'
description: 'An attachment block draws attention to files which can be downloaded.'
component-type: Content
---

Use an attachment block to present files the reader downloads: forms, reports, datasets, and templates. The block lists each file with its name, format, size, and date.

## When to use

- the page offers one or more files for download
- the reader needs the format and the size before they choose a file
- the files support the page content and do not replace it
- several related files belong together under one heading

## When not to use

- for a single file link inside body copy – link the file in the sentence instead
- for the main content of a page – publish that content as a web page first
- for links to other pages – use a [feature link list](/components/feature-link-list/) instead
- for an image or a diagram – use a [figure](/components/figure/) instead

## Do

- name each file for what it contains, not for its file name
- give every file a format, a size, and a date
- group related files in one block rather than several
- keep the block near the content it supports

## Don't

- hide a required form behind a download when an online form exists
- publish a file the reader cannot open without paid software
- repeat the same file in more than one block on a page
- mix unrelated files into one block

## Accessibility

- Each file link names the file, its format, and its size. The reader knows what the link does before they follow it (WCAG 2.4.4 Link purpose).
- The block title takes the heading level that fits the surrounding outline. Set it with `heading_level` (WCAG 1.3.1 Info and Relationships).
- File type icons carry no meaning on their own. The format also appears as text (WCAG 1.1.1 Non-text Content).

## Related components

- [Figure](/components/figure/) – use for an image or diagram that needs a caption.
- [Feature link list](/components/feature-link-list/) – use for links to other pages rather than to files.
- [Callout](/components/callout/) – use to draw attention to a short piece of static information.

## Related patterns

- [Related resources](/patterns/related-resources/) – use to point readers to material beyond the current page.
