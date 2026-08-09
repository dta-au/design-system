---
title: Chart
description: An accessible chart that draws its figure from a real data table, so the data stays readable without the graphic.
component-type: Data
rendered-by:
  - packages/sdc/components/03-organisms/chart
---

Use a chart when the shape of the numbers carries the message. The component draws twelve chart types from one data contract.

## When to use

- the numbers carry a shape worth seeing – a trend, a comparison, a share of a whole, a flow between states
- the data is public – every chart ships its rows as a table and offers them for download
- the page is a content page – the chart renders as a figure with a title, a description and a data table

## When not to use

- a handful of values reads better as a sentence or a [table](/components/table/)
- the data cannot appear in public – the data table and the downloads expose every row by design
- you need live dashboards, streaming updates or cross-chart brushing – the chart is a static figure with light interactivity
- several related figures need one frame – use the [chart collection](/components/chart-collection/) instead

## How it works

The component renders a figure with a title, a description and the full data behind a `Show underlying data` disclosure. JavaScript draws the graphic from the same rows. Without JavaScript the figure still works – the table carries every value as text. Set `table_toggle` to `swap` to exchange the chart and its table in place through a corner icon control.

The host page supplies the rows for local charts. In `url` mode the renderer fetches the rows from data.gov.au at view time. The fetch refuses every other host and bounds the row count, cell length, payload size and wait time.

`toolbar` adds a `View as table` control and an overflow menu. For local data the menu offers the rows as CSV or JSON, plus PNG and SVG image export. In `url` mode the menu links to the source instead. An interactive legend, per-dimension `filters` and keyboard-operable `zoom` layer on top. Each one adjusts the picture only – the data table always shows the full data.

## Do

- write the description to say what the chart shows and where the data comes from
- keep the series count at six or fewer – filter the data instead of adding colours
- set `x_label` and `y_label` so the axes and the table show plain-language labels instead of field names
- turn on the `toolbar` when readers may want to cite or reuse the data

## Don't

- rely on colour alone to distinguish series – turn on `texture` to add pattern fills
- use a pie for more than a few shares – a bar or a treemap keeps every share readable
- treat the data table as decoration – for some readers the table is the chart
- fetch data from hosts other than data.gov.au – `url` mode refuses them by design

## Variants

`chart_type` picks the renderer. Every type keeps the same figure, toolbar and data table.

- **Bar, grouped bar and stacked bar** – comparison across categories. Grouped bars sit side by side. Stacked bars show the parts of each total.
- **Line** – change across an ordered series, usually time. Each entry in `y_keys` draws one labelled line.
- **Pie and donut** – shares of a whole, for a few slices only. The donut opens its centre and shows the total of the visible slices there.
- **Lollipop** – one value per item down a long list, with an optional median reference line.
- **Cleveland dot plot** – two points per row on a shared scale, for before and after comparison.
- **Sankey and flow** – quantities that move between states. These types take one row per link – source, target and value – and the data table keeps that three-column shape.
- **Chord** – flows between entities arranged on a circle, for movement in both directions among many parties. It takes the same link rows as the sankey.
- **Treemap** – shares of a whole as tiled cells, when there are too many parts for a pie.

## Accessibility

- The data table is the text alternative for the graphic, and it stays reachable with or without JavaScript (WCAG 1.1.1 Non-text Content).
- The figure takes its accessible name from the chart title and its accessible description from the description text (WCAG 1.3.1 Info and Relationships).
- Every data point sits in the keyboard order. Arrow keys move through points and series, Home and End jump to the ends, and Escape closes the tooltip (WCAG 2.1.1 Keyboard).
- A visually hidden status region announces loading, zoom, filter and series changes (WCAG 4.1.3 Status Messages). When the data fails to load, the component hides the graphic and keeps the table.
- Colour never carries the meaning alone – the renderer labels series directly, varies marker shapes, and offers `texture` pattern fills (WCAG 1.4.1 Use of Colour).

## Related components

- [Chart collection](/components/chart-collection/) – several related charts in one frame, with a shared control for every data table.
- [Table](/components/table/) – when the numbers are the point and no shape needs drawing.
- [Figure](/components/figure/) – a static image with a caption, including a pre-rendered chart image.
