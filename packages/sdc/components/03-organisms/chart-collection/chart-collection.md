---
title: Chart collection
description: Several related charts in one keyline frame, with a shared control that opens every panel's data table.
component-type: Content
rendered-by:
  - packages/sdc/components/03-organisms/chart-collection
---

## When to use

- a page needs several related figures that read as one set – quarterly results, a program overview, before and after views
- readers compare across the panels – the shared frame and consistent panel chrome make the set scannable
- each panel stands on its own data – every chart keeps its own table

## When not to use

- one chart tells the story – use the Chart component on its own
- the panels are unrelated – separate figures with their own context beat a false grouping
- you need live dashboards, streaming updates or cross-chart brushing – the collection is a static composition of static figures

## How it works

The collection renders a named section with a heading, a description and a responsive grid of chart panels. Each panel is the standard Chart component in embedded mode: the collection owns the keyline border and surface, and each panel keeps its own canvas, legend and data table. Panels adapt to their own grid cell width, not the viewport.

The "View all as tables" control opens or closes every panel disclosure at once. Each panel's own summary keeps working, and the control follows: it reads open only while every table is open. Without JavaScript the control is inert and the summaries remain the path to the data.

Panel headings render one level below the collection heading. Give every panel a page-unique chart_id, or leave it off and the collection derives one.

Set table_toggle to swap on the panels to exchange each chart and its table in place through a corner icon control. The collection control still switches every panel at once.

The collection has no outer margin of its own – set vertical_spacing for space above or below.

## Accessibility

- The collection is a named region, so assistive technology lists it and can jump to it (WCAG 1.3.1 Info and Relationships).
- The "View all as tables" control reports its state through aria-expanded, and stays in step when a panel summary is used instead (WCAG 4.1.2 Name, Role, Value).
- Every panel keeps its data table as the text alternative for its chart, with or without JavaScript (WCAG 1.1.1 Non-text Content).

## Related components

- Chart – a single figure, and the component every panel is built from.
- Table – when the numbers are the point and no shape needs drawing.
