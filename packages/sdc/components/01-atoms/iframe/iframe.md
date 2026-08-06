---
title: 'iFrame'
description: 'An embedded frame for displaying external content such as a form, dashboard, or video.'
component-type: Content
requires-cms-config: true
---

Use an iFrame to embed external content – a dashboard, an interactive tool, a video – when no native component can present it. Editors set the source URL and the frame's width and height in the CMS.

iFrame is an advanced component because it hands part of the page to another site. Content inside the frame does not inherit the design system's styling, accessibility, or responsive behaviour. It also changes whenever the external source changes.

## When to use

- the content lives in an external service and cannot be re-created natively – a dashboard, an interactive visualisation, a video player
- you trust the external source, someone maintains it, and it works at the size the page gives it
- the page still makes sense if the frame fails to load

## When not to use

- a native component exists for the job – use [Webform](/components-advanced/webform/) for forms and [Map](/components-advanced/map/) for embedded maps
- the frame would be the only place essential information lives – put the information in page content or link to the source instead
- the external page is not accessible – embedding it makes its failures this page's failures

## Accessibility

- Every frame needs a title that names what it holds. A screen reader user then decides whether to enter it (WCAG 4.1.2 Name, Role, Value).
- A keyboard user must be able to move into the frame and back out again (WCAG 2.1.2 No Keyboard Trap).
- The embedded page keeps its own accessibility failures, and they become failures of this page. Test the external page before you embed it.

## Related components

- [Webform](/components-advanced/webform/) – collects structured information with a form built in the CMS.
- [Map](/components-advanced/map/) – embeds a map with a text address and external link built in.
