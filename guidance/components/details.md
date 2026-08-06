---
title: 'Details'
description: 'A disclosure element that reveals supplementary content when a user opens it.'
component-type: Content
rendered-by: []
---

Use Details to offer a single piece of supplementary content that not all users will need: a definition, short clarification, or contextual help. When the user opens the element, the content appears in place. When closed, it takes up minimal space on the page.

Details renders the native HTML `<details>` and `<summary>` elements with styling applied. An `iconBefore` variant displays an information icon before the label.

## When to use

- you have one piece of supplementary content that some users will find helpful but most will not need to read
- the content supports a task – for example, a short clarification positioned before a form
- you want to offer a definition or contextual help without interrupting the page flow

## When not to use

- for content all users need to see – leave it visible
- when multiple sections need to expand and collapse – use [Accordion](/components/accordion/) instead
- between form controls – position Details before the form, not inline with individual fields
- to hide critical instructions, warnings, or error guidance
- to nest other components inside it

## Accessibility

- The component uses native `<details>` and `<summary>`, so the browser reports the open state without extra code (WCAG 4.1.2 Name, Role, Value).
- A closed element hides its content from assistive technology as well as from sight. Never hide a warning or an instruction inside one (WCAG 1.3.1 Info and Relationships).
- The summary text says what the element holds, so a reader can decide whether to open it (WCAG 2.4.6 Headings and Labels).

## Related components

- [Accordion](/components/accordion/) – use when multiple sections need to expand and collapse independently.
- Tabs – use when the content splits into distinct categories that users switch between.
