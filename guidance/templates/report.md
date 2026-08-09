---
title: 'Report'
description: 'A report presents the findings, analysis, or evaluation of a specific inquiry, project, program, or policy area.'
toc: true
---

Type
: [Evidence](/templates/) – long-form findings, analysis, or evaluation.

Related
: [Communique](/templates/communique/) for short, dated Evidence pages.
: [Report landing page](/templates/report-landing-page/) for the cover page and chapter index.

Reports are formal, structured documents which present findings, evaluation, analysis, oversight or whole-of-government performance. The DTA may publish a report as a full or a summary version. They sometimes take the form of a plan or strategy document.

The DTA typically authors or commissions reports on digital.gov.au. They are a formal record of evidence and recommendations for government decision-makers, agencies, and the public.

Unlike guides, reports describe the findings rather than the actions to take. They are evidence-first documents whose authority comes from the rigour of their methodology and the quality of their source data.

Use a report when:
- the content presents the results of an evaluation, review, trial, or research process
- the findings must inform decision-making by agencies, ministers, or the public
- readers may cite the content as a formal government record over time

Reports may exist as a single page (summary) or as a multi-page publication with a landing page, body sections, and appendices. A report tabled in parliament must follow the full structural requirements in the Australian Government Style Manual.

## Sizing your report

**Long-form reports** are comprehensive publications – typically structured as multi-page sites with a foreword, methodology, findings sections, and appendices. They require a dedicated landing page that introduces the report and links to each chapter. The section's Sub-nav lists every chapter, so readers keep their place from any page. See the [section navigation pattern](/patterns/section-navigation/).

**Short-form reports and summaries** present key findings in a condensed format – typically a single page or two to three short sections. They serve readers who need the headline findings without the full detail. A short-form report should always link to the full report where one exists.

## Front-matter chapters and body chapters

Long-form reports have two kinds of chapter, and they need different treatment.

**Front-matter chapters** are the entry sleeve to the report: foreword, executive summary, 'at a glance', introduction. Readers usually arrive at these from the report landing page and read them linearly. Treat front-matter chapters as gateway pages. Put a [publication card](/components/publication-card/) at the top of the body to re-establish the parent report: cover, full title, date, PDF. The chapter prose follows, then [chapter nav](/components/chapter-nav/) to the next chapter.

**Body chapters** are where the findings live. Readers often arrive directly from a search result, so each body chapter must restate context and let readers locate findings quickly. Add an in-page [table of contents](/components/table-of-contents/) generated from the chapter's H2s. Present figures and tables inline, never collapsed. Use one [callout](/components/callout/) for the chapter's headline finding.

The structural difference matters for cross-linking: front-matter chapters use [chapter nav](/components/chapter-nav/) only – they are read in order. Body chapters use chapter nav *and* may carry a [next step](/components/next-step/) into a related surface (the policy area, the next report in the series).

Reports may also publish case studies as body chapters – for example, named-project pages inside a major reporting cycle. Treat these as Evidence body chapters, not as the narrative case study variant of guide. They exist to present the project's findings, not to teach a method.

Do not split a single body chapter across tabs by year or portfolio. Where a report publishes per-year or per-portfolio appendices, those are separate URLs in their own right. A tab strip breaks the URL contract and the report's `hasPart` relationship in JSON-LD.

## Writing conventions

Follow the [Australian Government Style Manual](https://www.stylemanual.gov.au) throughout. Key conventions for reports include:

- Use past tense for findings: 'the evaluation found', 'agencies reported', 'the data showed'
- Present recommendations in the active voice: write `agencies should adopt`, not `it is recommended that agencies consider adopting`
- Use numbered headings for multi-chapter reports to make cross-referencing straightforward
- Tables and figures must have a title and a source citation
- Avoid editorialising findings – present evidence clearly and let recommendations carry the judgment

## Web UI components

Use the following UI components when building report chapters in the CMS. For landing page components, see the [report landing page template](/templates/report-landing-page/).

**Sub-nav** – The report's chapters appear in the section's persistent sidebar, with the current chapter marked. Editors configure it at the section level, not per chapter. See the [sub-nav component](/components/sub-nav/).

**Publication card** – Put one at the top of each front-matter chapter to re-establish the report: cover, full title, date, PDF. See the [publication card component](/components/publication-card/).

**Table of contents** – Enable on every body chapter with four or more H2s. The list generates from the chapter's headings and sits below the introduction. Sub-nav stays on. The sidebar places the chapter in the report. The list shows what the chapter covers. See the [in-page navigation pattern](/patterns/in-page-navigation/).

**Chart** – Build every figure with the [chart component](/components/chart/), not a static image. Each chart carries its own data table, so the data stays readable without the graphic. Group related figures with the [chart collection](/components/chart-collection/).

**Callout** – Use one per body chapter for the chapter's headline finding. See the [callout component](/components/callout/).

**Accordion** – Use only for supporting reference material that is not part of the main report narrative, such as methodology notes or reference lists. Never use accordions for core findings or recommendations. Never nest accordions. Limit to five to seven items.

**Attachment** – Use for the PDF version of the report, not a plain hyperlink. The component displays the file name, format and size. See the [attachment component](/components/attachment/).

**Promo** – Feature one related item at the end of a body chapter: the policy area, the series page, or a related program. Use one per chapter at most. See the [promo component](/components/promo/).

**Next step** – Body chapters may carry one next step into a related surface. Place it above the chapter nav. See the [next step component](/components/next-step/).

**Chapter nav** – Use on every chapter, front matter and body alike. Previous and next links sit at the very bottom of the page, after any next step. See the [chapter navigation pattern](/patterns/chapter-navigation/).

**Tags** – Apply tags from the approved taxonomy. Reports typically carry tags for the policy domain, the publication type, and the year of publication.

## Style Manual guidance

> Create complete reports with a landing page, preliminary content, body and endmatter. Include other parts if the report needs to be tabled in parliament.
> <cite>
[Reports \| Australian Government Style Manual](https://www.stylemanual.gov.au/content-types/reports)
</cite>

## Structure
```
Introduction
Section A
├── Item A1
│   ├── Subitem A1.1
│   └── Subitem A1.2
└── Item A2
    ├── Subitem A2.1
    └── Subitem A2.2
Section B
├── Item B1
└── Item B2
Appendices
├── Appendix 1
├── Appendix 2
└── Appendix 3
```

## Examples
- Long form
  - [Major Digital Projects Report](https://www.digital.gov.au/initiatives/MDPR/foreword)
  - [Microsoft 365 Copilot: Full report](https://www.digital.gov.au/initiatives/copilot-trial/microsoft-365-copilot-evaluation-report-full)
  - [Strategic review of whole-of-government single seller arrangements](https://www.digital.gov.au/ssa/strategic-review-whole-australian-government-single-seller-arrangements-international-comparisons)
- Short form
  - [Microsoft 365 Copilot: Summary of evaluation findings](https://www.digital.gov.au/initiatives/copilot-trial/summary-evaluation-findings)
  - [Australian Government AI Assurance Framework: Pilot Report Summary](https://www.digital.gov.au/policy/ai/ai-assurance-framework-pilot-report/context-data-rationale)
  - [Observatory news and updates](https://www.digital.gov.au/initiatives/observatory/observatory-news)

## Sub-page variants

Reports with broad scope or a large volume of supporting material may include sub-pages beyond the main body. Use sub-page variants to maintain a clear separation between primary content and supplementary material.

**Glossary** – a sub-page listing defined terms; required for long-form reports, optional for short-form. Position as the first appendix or as a named sub-page before appendices. Do not duplicate a glossary that exists on a parent section landing page.

**Appendix** – one or more sub-pages containing supporting data, methodology, stakeholder lists, or reference material that would interrupt the report body. Give each appendix a number and a title. Link to all appendices from the report landing page.

