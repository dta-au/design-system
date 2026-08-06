---
title: 'Automated list'
description: 'A listing component that populates automatically from published content.'
component-type: Content
rendered-by: [03-organisms/list]
requires-cms-config: true
---

Use an automated list to display content items – news, events, resources, or other content types. The CMS draws the items automatically from criteria such as content type, tags, or date range. The list updates as editors publish new content, with no manual curation.

The automated list is an advanced component because it needs CMS view configuration. That configuration defines what content appears and in what order.

## When to use

- you need a listing that stays current as editors publish new content
- the items share a content type or tagging structure the CMS can query reliably
- the listing volume is too large to manage manually

## When not to use

- when you need to handpick and order specific items – use [Manual list](/components/manual-list/) instead
- when the content does not have consistent metadata – an automated list relies on structured tagging to display correctly
- for featured or promotional content – use [Promo](/components/promo/) or [Feature link list](/components/feature-link-list/) instead

## Accessibility

- The component renders a real list, so assistive technology announces how many items it holds (WCAG 1.3.1 Info and Relationships).
- Each item names its destination in the link text, because the reader meets these links without surrounding context (WCAG 2.4.4 Link purpose).
- An empty result needs a message that says so. Never leave the reader with a blank region (WCAG 3.3.1 Error Identification).

## Related components

- [Manual list](/components/manual-list/) – use when the editor picks and orders the items.
- [Feature link list](/components/feature-link-list/) – use when each link benefits from a description and hover icon.
