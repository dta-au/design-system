---
title: 'Elevation'
description: 'A set of predefined tokens that establish a sense of depth and layering – through shadows, glow, and z-index – to communicate hierarchy and interaction state.'
foundation-type: Visual
---

## Shadow vs glow

The system distinguishes between two types of visual elevation:

**Shadow** communicates **physical depth** – that an element floats above the surface it sits on. Shadows are directional, darker at the base, and simulate a light source above. Use them for structural elements: cards, dropdowns, modals, popovers.

**Glow** communicates **attention state** – that an element is interactive or live right now. Glows are non-directional, use the accent colour at low opacity, and signal UI feedback rather than layout hierarchy.

A glowing card implies it is interactive or active. A shadowed card implies it sits above the page. These are different messages, but they can coexist. Shadow establishes the physical presence of an element at rest. Glow layers on top when the user hovers that element, or when it goes live.

## Shadow tokens

Three levels correspond to increasing stacking depth:

| Token | Purpose | Typical use |
|---|---|---|
| `--shadow-sm` | Minimal lift – slightly elevates interactive elements | Inline cards, compact components, table action rows |
| `--shadow-md` | Standard elevation – further elevates interactive elements on hover | Cards, sidebars, sticky elements |
| `--shadow-lg` | Maximum depth – elements that float above the page | Modals, dialogs, dropdowns, drawers |

All shadow values use two layers: a large soft spread for ambient shadow and a small tight spread for the contact edge. This two-layer technique avoids flat or plastic-looking results.

In dark mode, shadow opacity increases to compensate for the reduced contrast between the raised surface and the dark background. At very deep dark backgrounds, shadows approach invisibility – this is where glow takes over as the primary depth signal.

## Glow token

| Token | Purpose |
|---|---|
| `--glow` | Exception-state signal for interactive raised surfaces; primary depth signal in dark mode |

The glow uses the accent colour at low opacity. It has two layers: a tight 1px halo (acts like a coloured border) and a diffuse 16px spread.

Glow works as a signal precisely because most elements do not have it. Applied broadly it loses meaning entirely. The system's border, shadow, and lift tokens already handle interaction affordance – glow is not a replacement for any of those, it is additive and reserved.

**Light mode – hover only, highest-emphasis elements**

Glow at rest in light mode competes with the other signals already present on a component (accent border, subtle background, shadow lift). Three signals for one message is noise. Reserve glow for the single most important hover moment in a page region – typically the primary action button or a curated featured card. Do not apply it to ordinary cards, secondary buttons, or list items.

**Dark mode – rest state on raised surfaces**

Neutral shadows become near-invisible on dark backgrounds (dark-on-dark). Glow becomes the primary signal for a raised or interactive surface. This is where the token earns its place in the system. Apply at rest on `--bg-raised` surfaces in dark mode; on hover, increase shadow lift rather than intensifying the glow.

**Live or real-time elements**

Light mode has one legitimate rest-state exception: a component that actively broadcasts data. A live feed card, or a status indicator that is currently updating, can carry glow at rest. The glow tells the reader that the data is alive now. Borders and shadows cannot carry that message; glow can.

## Z-index tokens

A set of predefined values for handling the relative distance between surfaces along the z-axis.

| Token | Value | Description |
|---|---|---|
| `base` | `0` | The base z-index. |
| `elevated` | `1` | Elevates elements above adjacent elements that sit on the base z-index. |
| `overlay` | `100` | Overlays in modals and components that sit above the page – Modal, Drawer, mobile navigation. |
| `dialog` | `110` | The main dialog element in modals and other components – Modal, Drawer, mobile navigation. |
| `popover` | `200` | Popover elements – for example, calendar in a date picker. |
| `skipLink` | `999` | Focused skip links. |

## Do

- use `--shadow-sm` to slightly elevate interactive elements like cards at rest
- use `--shadow-md` to further elevate interactive elements on hover
- use `--shadow-lg` only for elements that float above the page – dropdowns, modals, drawers
- combine shadow at rest with glow on hover: `box-shadow: var(--shadow-md)` → `box-shadow: var(--shadow-md), var(--glow)`
- use `--glow` at rest in dark mode on raised surfaces where shadow is insufficient
- use z-index tokens rather than arbitrary values to maintain consistent layering

## Don't

- apply `--glow` to elements that are not interactive or live – it creates false affordance
- apply `--glow` to every card or surface – it loses signal value when overused
- apply `--shadow-lg` to small UI components – scale shadow to the physical size of the element
- use `--glow` for selected state – `--selected` and `--selected-muted` carry that
- use `--glow` in place of the focus ring – glow signals pointer hover, and the focus ring signals keyboard navigation
- use arbitrary z-index values outside the token scale – this breaks stacking order guarantees

## Related foundations

- [Colour](/foundations/colour/) – Surface tokens (`--bg-raised`) that carry shadow and glow
- [Focus](/foundations/focus/) – Keyboard focus indicator, distinct from glow
