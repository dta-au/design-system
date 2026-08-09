---
title: 'Report landing page'
description: 'A report landing page is the cover of one long-form report, and it routes readers to the chapters and appendices.'
toc: true
---

Type
: [Evidence](/templates/) – cover page for one report edition.

Related
: [Report](/templates/report/) for chapter structure, writing conventions, and sub-pages.
: [Report series](/templates/report-series/) for the front door above multiple editions.

A report landing page is the cover of one long-form report. It carries the title, the edition, the publication date, the downloadable version, and the index of chapters. It belongs to the report, not to the section it sits in.

Long-form reports need this page because their chapters are separate URLs. Without a landing page, a report is a set of chapters with no cover and no canonical entry point. The `hasPart` relationship in JSON-LD then has nothing to hang from.

## When to use

Use a report landing page when:

- a report publishes across multiple URLs rather than as a single page
- readers need one address to cite for the report as a whole
- the report has front matter, body chapters, or appendices that need an index

Do not use a report landing page for a short-form report or summary. Those publish as a single [report](/templates/report/) page.

## What a report landing page is not

Four page shapes get confused with each other. The deciding factor is the reader's job on arrival.

| Page | Type | Reader's job |
|---|---|---|
| [Section landing page](/templates/section-landing-page/) | Navigation | Orient in a content domain such as Investment or Policy |
| [Report series](/templates/report-series/) | Navigation | Find the right edition or instalment of a recurring publication |
| Report landing page | Evidence | Enter one report and find the chapter they need |
| Front-matter chapter | Evidence | Read the foreword or executive summary in sequence |

Two distinctions carry most of the confusion.

**A report landing page is not a section landing page.** The section landing template covers a content domain that holds unrelated publications, programs, and guides. A report holds its own chapters and nothing else. Tag a report cover as Navigation and you put a publication in the same class as the Policy section.

**A report landing page is not a front-matter chapter.** The foreword, executive summary, and 'at a glance' pages are chapters. They are read in sequence and they use [chapter nav](/components/chapter-nav/). The landing page is read once, at the start, and uses a chapter index. Where a report has no landing page, publish one. Do not promote its foreword to fill the gap, which leaves the report with a cover that paginates into its own second chapter.

## Structure

A report landing page follows this pattern:

1. **Cover block** – report title, edition identity, and the version and date stamp
2. **Scope** – two to three paragraphs on what the report covers and why it exists; not the findings
3. **Chapter index** – every chapter, grouped by the report's own structure
4. **Appendices** – listed under their own heading, not mixed into the chapter index
5. **Download** – the canonical PDF where one exists

Keep the findings off this page. A reader who can get the headline result from the cover has no reason to open the executive summary. That is where the result belongs.

## Chapter index

Group the index under headings that mirror the report's own structure: front matter, body chapters, appendices. Readers arriving from a search result use the index to work out where they landed. A flat list gives them nothing to place themselves against.

The Major Digital Projects Report 2026 currently publishes ten chapter links in a single flat list, followed by appendices. The foreword, the executive summary, and a body chapter on project performance all present identically. The reader cannot tell the entry sleeve from the findings.

Use a card grid where each chapter needs a one-line description to be choosable. Use a link list where the chapter titles are self-explanatory and the set runs past about eight items. See [card selection](/patterns/card-selection/).

Where the report belongs to a series, link up to the [report series](/templates/report-series/) page from the landing page. Readers who want a different year should not have to go back to search.

## Writing conventions

Follow the [Australian Government Style Manual](https://www.stylemanual.gov.au) throughout. Key conventions for report landing pages:

- State the edition in the H1 where the report recurs. Write `Major Digital Projects Report 2026`, not `Major Digital Projects Report`
- Show the version and publication date near the title, so they travel with screenshots and search results
- Write the scope in present tense: 'this report examines', 'the review covers'
- Use the chapter's exact H1 as its link text in the index. Do not write an alternative title for the same page
- Do not number the chapter index unless the report itself numbers its chapters

## Web UI components

Use the following UI components when building report landing pages in the CMS.

**Page header (hero)** – Use the full-width hero with the report title, a one-sentence description, and the publication date. See the [page header pattern](/patterns/page-header/).

**Publication card** – Use for the cover image, full title, date, and PDF. The same component appears at the top of each front-matter chapter, so the report re-establishes itself for readers who arrive mid-document. See the [publication card component](/components/publication-card/).

**Card grid or link list** – The chapter index. Group under H2 headings matching the report's structure.

**Attachment** – Use for the canonical PDF. Display the file name, format, and file size. Do not use a plain hyperlink.

**Related content cards** – Link to the series page, the policy area the report informs, and any program tied to its findings. Two to four cards.

**Tags** – Apply tags from the approved taxonomy. Report landing pages carry the policy domain, the publication type, and the year of publication.

## Examples

- [Major Digital Projects Report 2026](https://www.digital.gov.au/investment/assurance/MDPR-2026)
- [Microsoft 365 Copilot: full report](https://www.digital.gov.au/initiatives/copilot-trial/microsoft-365-copilot-evaluation-report-full)
- [Strategic review of whole-of-government single seller arrangements](https://www.digital.gov.au/strategic-review-whole-australian-government-single-seller-arrangements)

## Sub-page variants

Chapters, glossaries, and appendices attach to the report rather than to its landing page. See [report sub-page variants](/templates/report/#sub-page-variants).
