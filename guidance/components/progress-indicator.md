---
title: 'Progress indicator'
description: 'Displays a user''s position within a multi-step form.'
component-type: Forms
rendered-by: [02-molecules/progress-nav, 02-molecules/progress-tracker]
---

Use a progress indicator in multi-step forms to show how many steps exist, which step the user is on, and which steps they finished. It shows how much effort the form takes, and it reduces abandonment.

## When to use

- the form has three or more distinct steps
- each step is a separate page in a focus-mode layout
- users complete steps sequentially and in order

## When not to use

- for forms with fewer than three steps – the overhead of a progress indicator outweighs its benefit
- on single-page forms
- when the user can take the steps in any order – a progress indicator implies a linear sequence

## Accessibility

- The indicator marks the current step for assistive technology, not by colour or position alone (WCAG 1.4.1 Use of Colour).
- The step count and the current position appear as text, so a screen reader reports progress (WCAG 1.3.1 Info and Relationships).
- The indicator reports progress; it does not move focus. Focus belongs on the first field of the step (WCAG 2.4.3 Focus Order).

## Related components

- [Timeline](/components/timeline/) – use to explain the stages of a process rather than to track a user through a form.
- [Table of contents](/components/table-of-contents/) – use for navigating a long page, not for form progress.
- [Message](/components-advanced/message/) – use to report the result of a step the user just submitted.

## Related patterns

- Focus mode – use a progress indicator within a focus mode layout that removes site navigation and keeps users on task.
