---
title: 'Map'
description: 'An embedded interactive map that shows a location or area.'
component-type: Content
requires-cms-config: true
---

Use a Map to embed an interactive map showing a physical location – an office, a service centre, a venue. The component pairs the embedded map with a plain-text address and a link to the location on the map provider's site. The map is never the only way to find the place. Editors set the embed URL, the address text, and the external link in the CMS.

## When to use

- users need to find or travel to a physical location
- seeing the surroundings or getting directions matters, not just the address

## When not to use

- the location is incidental to the page – a text address alone is faster and works everywhere
- users need to search, filter, or compare many locations – that calls for an application rather than an embed
- the address text or external link would be left empty – keyboard and screen reader users rely on them, not the embedded frame

## Accessibility

- The plain-text address and the external link carry the location for anyone who cannot use the embedded map (WCAG 1.1.1 Non-text Content).
- The embedded frame needs a title that names the location it shows (WCAG 4.1.2 Name, Role, Value).
- A keyboard user must be able to pass the map without becoming stuck inside it (WCAG 2.1.2 No Keyboard Trap).

## Related components

- [iFrame](/components-advanced/iframe/) – general embedding for content that is not a map.
