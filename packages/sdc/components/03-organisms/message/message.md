---
title: 'Message'
description: 'A Message displays important notifications and alerts to users, clearly communicating the status, importance, and context of the information through distinct visual styling.'
component-type: Content
requires-cms-config: true
---

Place a Message near the top of the page, under the title and the introductory paragraph. A Message reports the result of an action the user just took.

## When to use

- the system must confirm that an action succeeded or failed
- the user needs to know why a step did not complete
- the page carries time-sensitive information about the current task
- the feedback belongs to one page rather than to the whole site

## When not to use

- for static information that never changes – use a [callout](/components/callout/) instead
- for service-wide or system-wide notices – use a global alert instead
- for common reversible actions, such as deleting an email
- for a form with a single input error – move focus to that input instead

## Do

- keep Message content brief and to the point
- apply the message type that matches the context and the urgency
- place the Message under the title and the introductory paragraph
- use constructive, no-blame language and avoid vague descriptions
- tell the user what to do next, or link to further help
- keep it short – the reader must take it in at a glance
- use the colour tone that matches the message type

## Don't

- insert a Message into a banner; position it after the page title
- repeat the title in the description
- add a description when the title carries the whole message
- use a Message for an action the user can undo
- use a Message for information that can wait
- include a close button on an error message

## Variants

The component ships four message types. Each type sets the colour tone and the icon.

### Message types

- Error: indicates a critical problem that stops an action from completing
- Warning: alerts the user to an issue that needs attention but does not stop the action
- Success: confirms that an action or process completed
- Information: gives a non-critical update or general information

## Accessibility

- The component exposes an error message as a live region, so a screen reader announces it without the user moving focus (WCAG 4.1.3 Status Messages).
- Non-error types render as a labelled region that assistive technology can find and skip (WCAG 1.3.1 Info and Relationships).
- The type icon repeats the tone that colour already carries. Name the outcome in the message text as well (WCAG 1.4.1 Use of Colour).

## Related components

- [Callout](/components/callout/) – use for static supporting information that does not respond to user action.
- [Attachment](/components/attachment/) – use to present files for download rather than status feedback.

## Related patterns

- [Messaging](/patterns/messaging/) – choose between a message, a callout, and a global alert.
