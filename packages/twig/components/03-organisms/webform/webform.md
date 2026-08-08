---
title: 'Webform'
description: 'A form built in the CMS that collects structured information from users.'
component-type: Content
requires-cms-config: true
---

Use a Webform to collect structured information from users – feedback, enquiries, registrations, simple applications. Editors build the form in the CMS, setting its fields, validation, and submission handling. The component then renders the form within the page.

## When to use

- the information needs structure – specific fields, validation, a record of each submission
- the form is short enough to complete in one visit on one page

## When not to use

- an email link would do – do not build a form to capture what a mailto handles
- the process is a long or multi-step transaction – use a dedicated form flow with a [Progress indicator](/components/progress-indicator/) instead of one long embedded form

## Accessibility

- Every field needs a visible label that stays visible while the user types (WCAG 3.3.2 Labels or Instructions).
- Never use placeholder text as the only label. It disappears on the first keystroke (WCAG 3.3.2 Labels or Instructions).
- An error message names the field and says how to fix it (WCAG 3.3.3 Error Suggestion).
- After a failed submission, focus moves to the error summary so a keyboard user finds the problem (WCAG 3.3.1 Error Identification).

## Related components

- [Progress indicator](/components/progress-indicator/) – shows position within a multi-step form.
- [Message](/components-advanced/message/) – displays confirmation or error feedback after submission.
