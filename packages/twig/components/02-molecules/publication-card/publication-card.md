---
title: Publication card
description: A card that presents one published document inline – cover, full title, date and download in one unit.
component-type: Content
rendered-by:
  - packages/sdc/components/02-molecules/publication-card
---

Use a publication card to give a document its identity on the page. Put the card at the top of a report's front-matter chapters. It re-establishes the parent report before the chapter prose starts.

## When to use

- a front-matter chapter of a long-form report must re-establish the parent publication
- a report landing page presents the cover, the full title, the date and the file as one block
- readers arrive mid-document from search and need to know which report they are in

## When not to use

- a page advertises a single file outside a report – use an [attachment](/components/attachment/) instead
- the link should open a web page rather than a file – use a [promo](/components/promo/) instead
- the page lists several files together – one [attachment](/components/attachment/) block presents the whole set

## How it works

The cover renders from `image`, above the content on small screens and beside it on wide screens. The title links to the file, and the whole card acts as the click target while a title is present. Set `is_title_click` to keep the click on the title alone. A download icon sits beside the title.

The file's name, format and size render as a details line below the summary. Without a title, the card renders the file details as the link itself. Without a `file`, the card does not render at all.

The date and other metadata arrive through slots. `content_middle` renders between the title and the summary – the natural place for the publication date. `content_top` and `content_bottom` frame the content area, and `image_over` overlays the cover.

## Do

- use the report's full title, including the edition year
- give the file a name, a format and a size – the details line then reads complete
- put the publication date in `content_middle`, above the summary
- write alt text for the cover that names the publication

## Don't

- point the title link at a web page – the card promises a file
- leave the title empty on a report page – the card then collapses to a bare file link
- use the card outside the report context – it claims the weight of a formal publication

## Accessibility

- The title link announces the file name, format and size, so the reader expects a download (WCAG 2.4.4 Link purpose).
- The whole-card click adds no second link – keyboard and screen reader users meet one link with one name (WCAG 2.4.4 Link purpose).
- A visually hidden `File details:` label precedes the file name in the details line (WCAG 1.3.1 Info and Relationships).
- The download icon is decorative – the format and size appear as text, never as the icon alone (WCAG 1.1.1 Non-text Content).
- Set `heading_level` so the title takes the level that fits the page outline (WCAG 1.3.1 Info and Relationships).

## Related components

- [Attachment](/components/attachment/) – use for file downloads outside the report context.
- [Promo](/components/promo/) – use to promote a page rather than deliver a file.

## Related patterns

- [Card selection](/patterns/card-selection/) – the decision rules for every card type on the site.
