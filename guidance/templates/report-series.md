---
title: 'Report series'
description: 'A report series page is the front door to a recurring publication, and it routes readers to each edition or instalment.'
toc: true
---

Type
: [Navigation](/templates/) – front door to a recurring publication.

Related
: [Report landing page](/templates/report-landing-page/) for one edition of a series.

A report series page sits above a publication the DTA issues more than once. It states what the series is for, then routes readers to each member. It does not carry findings. The findings live on each member's own landing page and chapters.

Readers arrive at a series page for one of two jobs. Either they want the current member and need to know which one that is, or they want to compare members across time. Both jobs fail on a page that lists members without dates.

## When to use

Use a report series page when:

- the DTA publishes the same title more than once, or issues numbered instalments under one banner
- each member is substantial enough to need its own landing page and chapters
- readers must be able to tell the current member from superseded ones

Do not use a report series page for a single report with chapters. That is a [report landing page](/templates/report-landing-page/). Do not use it for a content domain such as Investment or Policy. That is a [section landing page](/templates/section-landing-page/).

## Two series shapes

Choose the variant before you build the page. The two differ in how members relate to each other, which changes the ordering, the currency rules, and what each card must carry.

**Edition series** – the same report, re-issued on a cycle. The Major Digital Projects Report is an edition series. Order members newest first. Exactly one edition is current. Every other edition is superseded but stays published.

**Instalment series** – distinct topics published under one banner and numbered in sequence. The Digital project research series is an instalment series. Order members by their series number. All instalments stay current. Each instalment carries its own version, so instalment 01 can reach version 2 while instalment 02 is still at version 1.

| | Edition series | Instalment series |
|---|---|---|
| Order | Newest first, by publication date | By series number |
| Currency | One current, rest superseded | All current |
| Version | Belongs to the edition | Belongs to the instalment |
| Card carries | Year, publication date, abstract | Series number, version and date, abstract |

Members of a series are not always Evidence. The research series instalments publish as long guides, because their job is to teach a method. The series page stays Navigation in both cases. Classify each member on its own reader job, not on the series it belongs to.

## Structure

A report series page follows this pattern:

1. **Series purpose** – two to three sentences on what the series covers and who publishes it; name any research or academic partners here rather than on every member card
2. **Current or featured member** – for an edition series, the current edition as a single featured card; omit for an instalment series
3. **Member index** – one card per member, in the order set by the variant
4. **Previous editions** – for an edition series, superseded members under their own heading; omit for an instalment series
5. **Related surfaces** – links to the policy or framework the series informs

Each member card needs four things: the member's identity (year or series number), its publication date, a two to three sentence abstract, and a link to the digital version. Add a PDF link where one exists. A card without a date forces the reader onto the member page to work out which one they want.

## Currency and archiving

These rules apply to edition series only.

**Never let two editions present as current.** When a new edition publishes, move the previous one under the 'previous editions' heading in the same edit. A reader who cites last year's figures because both editions looked current is a failure of this page, not of theirs.

**Keep superseded editions at their original URLs.** Other agencies, audit reports, and parliamentary submissions cite editions by URL. Redirecting or retiring an old edition breaks those citations.

**Do not disambiguate editions with a URL suffix.** The site already carries `digital-project-research-series-0` and `digital-project-research-series-old` as separate live URLs for the same series. Neither suffix tells a reader which is current. Name the edition in the URL by year or number instead.

## Writing conventions

Follow the [Australian Government Style Manual](https://www.stylemanual.gov.au) throughout. Key conventions for report series pages:

- Frontload the edition or instalment identity in link text. Write `Major Digital Projects Report 2026`, not `read the 2026 edition of the report`
- State the publication date on every card, not only on the current member
- Write member abstracts in parallel structure. If one starts with the subject of the research, all of them must
- Do not restate a member's findings on the series page. The abstract says what the member covers, not what it concluded
- Use the series' own numbering in headings where one exists, so 'Assurance Research Series 02' rather than 'the second paper'

## Web UI components

Use the following UI components when building report series pages in the CMS.

**Page header (hero)** – Use the full-width hero with the series title and a two-to-three sentence description. Do not put the current edition's title in the series hero. See the [page header pattern](/patterns/page-header/).

**Featured card (hero card)** – Use for the current edition of an edition series. One per page. Omit on an instalment series, where promoting one instalment misrepresents the rest as secondary.

**Card grid** – The primary navigation component for the member index. Use a three-column layout. Group superseded editions under their own H2 rather than mixing them into the current grid. See [card selection](/patterns/card-selection/).

**Automated list** – Use for an edition series that gains a member every cycle. Key the list to the publication date so a new edition appears without a manual edit. See the [automated list component](/components-advanced/automated-list/).

**Attachment** – Use for the PDF of each member. Display the file name, format, and file size. Do not use a plain hyperlink.

**Related content cards** – Link to the policy or framework the series informs, and to the assurance or program surfaces that cite it. Two to four cards.

**Tags** – Apply tags from the approved taxonomy. Series pages carry the policy domain tag. Do not tag them by year; the members carry the year.

## Examples

- [Digital project research series](https://www.digital.gov.au/digital-project-research-series-0) – instalment series

No edition series page is published. The Major Digital Projects Report has three editions and no front door above them, so readers reach each edition through search or a direct link.

## Sub-page variants

Report series pages do not usually need sub-pages. Members carry their own glossaries and appendices.

**Series glossary** – warranted only when terms stay stable across every member and the members would otherwise repeat the same definitions. Publish it under the series page and link to it from each member. Where definitions shift between editions, keep the glossary on each member instead.
