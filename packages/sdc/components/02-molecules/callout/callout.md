---
title: 'Callout'
description: 'A callout draws attention to important or interesting information.'
component-type: Content
---

Use a callout to draw the reader's attention to a short piece of static information.

## When to use

- the page runs long and one fact must stand out from the body copy
- the callout repeats a point the reader cannot afford to miss
- the content sits outside the main narrative: contact details, a checklist, or a definition
- the page type still has callout budget – see [callout discipline](/patterns/callout-discipline/)

## When not to use

- for primary content, because readers skip boxed-out material
- for a quote in long-form content – use a [quote](/components/quote/) instead
- for errors and alerts – use a message or a global alert instead
- for form inputs, or inside conditionally revealed checkbox and radio groups

## Do

- use callouts sparingly, because they interrupt the reader
- use a callout to help readers scan a long page for essential information
- keep the callout to a few sentences
- match the callout theme to the palette of the section around it

## Don't

- make a callout the focus of the page; it supports the body copy
- place two callouts where one carries the point
- mix colour palettes within one page section

## How many callouts per page

A callout works because it is the visually-strongest element on the page. Two callouts compete with each other and both lose impact. The right count depends on the page type.

- **Rule pages (criteria, statements, standard parents):** one callout, carrying the verbatim normative sentence. Never two.
- **Guidance:** at most two – one 'do this', one 'avoid this'.
- **Reference pages (glossaries, checklists, communiques):** zero. Readers look reference content up, and a callout pulls the eye away from the lookup target.
- **Reference FAQ:** zero or one – use one above the accordion only when 80%+ of readers need the same answer.
- **Section landing pages:** zero. A routing page does not need a callout.

See [callout discipline](/patterns/callout-discipline/) for the full per-page-type budget.

## Accessibility

- A callout carries no landmark role. Give it a heading when it holds more than one paragraph, so the outline stays complete (WCAG 1.3.1 Info and Relationships).
- Colour does not mark the callout as important on its own. State the point in the words (WCAG 1.4.1 Use of Colour).
- The callout must meet contrast in both palettes. Do not place a light callout inside a dark section (WCAG 1.4.3 Contrast (Minimum)).

## Related components

- Global alert – a global alert displays a prominent service-wide or system-wide message at the top of the screen.
- Message – a message gives colour-coded success, error, warning or information feedback within a page. Do not confuse a message with a callout.

## Related patterns

- [Callout discipline](/patterns/callout-discipline/) – per-page-type budget for how many callouts to use.
- [Messaging](/patterns/messaging/) – tell the reader about a service or interaction, and respond to what they just did.
