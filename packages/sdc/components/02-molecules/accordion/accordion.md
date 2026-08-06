---
title: 'Accordion'
description: 'An accordion lets users show and hide sections of related content.'
component-type: Layout
---

An accordion collapses related sections behind headings the user opens one at a time.

## When to use

Only use an accordion when research shows it helps the user to:

- see an overview of multiple, related sections of content
- choose to show and hide the sections that are relevant to them
- look across information that might otherwise sit on different pages

For example, an accordion can work well when the user must reveal and compare information relevant to them.

Accordions can also work well for people who use a service regularly. For example, users of caseworking systems who need to do familiar tasks quickly.

Test with users to decide whether an accordion outweighs the problems of hiding content.

## When not to use

An accordion hides content from the user. Not all users notice an accordion or understand how it works. Only use one in specific situations, and only when user research supports it.

Do not use an accordion for content that all users need to see.

Test your content without an accordion first. Well-written, well-structured content often removes the need for one. See the Content design guidance on writing for the web.

It is usually better to:

- simplify and reduce the amount of content
- split the content across multiple pages
- keep the content on a single page, separated by headings
- use a list of links at the start of the page (known as 'anchor links') to take the user to particular sections of a page

Accordions work best for simple content and links. Do not use an accordion to split up a series of questions. Use separate pages instead.

Do not put an accordion inside another accordion, because it makes content difficult to find.

Do not use the accordion component when the amount of content inside will make the page slow to load.

## Canonical anti-patterns

These are the recurring misuses of the accordion on digital.gov.au. Each one destroys something the page was trying to do.

**Standards or criteria collapsed into accordion panels.** Each criterion has its own URL and its own deep-link target. Compliance reviews, search results, and JSON-LD `hasPart` relationships all point at that target. An accordion panel destroys those references. Use a card grid of [navigation cards](/patterns/card-selection/) instead, and give each criterion its own [rule page](/templates/rule/).

**Glossary terms collapsed into accordion panels.** Readers skim a glossary; they do not browse it. An accordion forces a click for every lookup. The [DefinedTermSet](https://schema.org/DefinedTermSet) JSON-LD shape also breaks when the term and its definition sit apart in the rendered page. Use semantic `<dl>`, `<dt>` and `<dd>` markup instead. See the [reference template](/templates/reference/).

**Checklist items collapsed into accordion panels.** Checklists must be readable end-to-end and printable. An accordion breaks both. Use a real ordered or unordered list.

**Inputs and outputs of a framework step collapsed into accordion panels.** A reader on step 7 of a framework often needs to cross-check step 4's outputs. An accordion over that structure makes the framework harder to use.

**'FAQ-style' accordion on an explainer page.** Write real questions and useful answers as `<h3>` body sections. They then appear in search results and in an in-page table of contents. An accordion on an explainer page hides those answers from readers who skim.

## Canonical right uses

The right place for an accordion is a [reference FAQ](/templates/reference/). Each question works as a lookup key, the page runs long, and the user usually wants one answer.

Even there, apply [callout discipline](/patterns/callout-discipline/): when a single question accounts for the bulk of reader traffic, lift its answer into a callout above the accordion. The accordion handles the long tail.

## Accessibility

- Each panel heading is a button that reports whether the panel is open. A screen reader announces that state before the user acts (WCAG 4.1.2 Name, Role, Value).
- A closed panel hides its content from assistive technology as well as from sight. Never put content a user must read inside one (WCAG 1.3.1 Info and Relationships).
- The user reaches and opens every panel from the keyboard alone (WCAG 2.1.1 Keyboard).

## Related components

- [Table of contents](/components/table-of-contents/) – use to link to sections that stay visible on the page.
- [Details](/components/details/) – use for one short piece of supplementary content rather than a set.
- [Summary list](/components/summary-list/) – use for term and value pairs the reader scans.

## Related patterns

- [Callout discipline](/patterns/callout-discipline/) – decide what to lift out of an accordion and into a callout.
