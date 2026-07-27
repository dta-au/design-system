---
title: 'Backgrounds and containment'
description: 'Two props, three states – plain, band, surface panel – so a background never renders as a squeezed box inside a column.'
---

A background band works because it runs edge to edge. Put the same band inside
a column and it stops being a band – it becomes a coloured box, indented in
less space than the content around it, and the nested `.container` re-applies
page-level widths where they no longer apply. This pattern gives a component
two honest ways to carry a background instead of one dishonest one.

Contained (`is_contained: true`, the default), the component owns its width:
it brings its own `.container`, aligns to the page grid, and its background is
a full-bleed band of section colour. Not contained, a parent column owns the
width: the component drops the grid scaffolding, emits a `--not-contained`
modifier, and its background becomes a surface panel – the shared surface
colour at the column's natural width, reading as a card among content.

| State | Props | Reads as |
|---|---|---|
| Plain | no background | Part of the page |
| Band | background, contained | A full-bleed strip of section colour, content on the page grid |
| Surface panel | background, not contained | A card among content, at the column's width |

The band colour is per component – accordion, list, map and webform band on
`background` (#e6e9eb); promo and slider on `background-light` (#fdfdfd). The
surface colour is a single token, because nested panels sit next to each other
and must match: `$dga-color-light-surface` (#f2f4f5) and dark (#073f53),
declared per component as `$ct-[component]-[theme]-surface-background-color`.
Attachment is the reference component – its wrapper was already the surface
colour, flush with its container, and the surface panel state generalises that
treatment.

## Where the fill lands

The fill goes where the component's anatomy says it should.

**Flat components are their own card – paint the root.** Basic content, list,
slider, promo, map, webform, filterable table and step-by-step nav fill the
root with an all-round `ct-spacing(3)` inset. Step-by-step nav also takes a
1px separator-colour border box, drops the first step's top rule so it does
not double the panel border, and narrows to `col-l-9 col-xl-8` when contained.

**Components made of cards paint the cards.** Accordion leaves the root on the
page background with no inset; the panels and their header buttons carry the
surface, so each panel reads as a card rather than the set as a band.

**Components whose rows pad themselves drop the root inset.** Feature link
list fills the root but removes the root padding – the links' own padding
provides the inset, and the title takes matching padding so it aligns with the
link text. Doubling the padding is how bands sneak back in.

## Who decides containment

Placement decides containment, not authors. Full-width regions pass nothing –
the contained default is correct there. Banner components and constrained
layout columns pass `is_contained: false`, because the slot already provides
the grid. Components designed for pre-constrained slots (message, in the page
highlighted region) have no containment prop at all – the slot is the
contract.
