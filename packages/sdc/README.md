# @dta-au/civictheme-uikit

CivicTheme UI Kit for Drupal Single Directory Components. Each component ships its own Twig, YAML schema, CSS, and JS under `components/` for per-component attachment by Drupal.

## Runtime JS

`dist/civictheme.base.js` is the supported runtime entry (package main): a classic-safe IIFE bundle of the `00-base` utilities plus `window.Popper`, built by Vite. It runs behaviours on DOMContentLoaded – or registers one `Drupal.behaviors.civictheme_*` entry per behaviour when Drupal is present – and exposes `window.CivicTheme.attach()`. Component-level behaviours are not in this bundle; they ship per component for SDC auto-attach.

`dist/civictheme.base.esm.js` is the same bundle as an ES module exporting `attach` and `behaviours`. `dist/civictheme.drupal.base.js` is a byte-identical alias of the main entry, kept for consumers of the old Drupal-only build – the bundle is now environment-aware.

## Chart data contract

`@dta-au/civictheme-uikit/chart.data` resolves the shared chart data module: ESM for bundlers, UMD (global `bdgaChartData`) as the default for classic scripts.

## Styles

- `dist/civictheme.base.css` – base styles for the `00-base` layer
- `dist/civictheme.variables.css` – CSS custom properties
- per-component `*.css` files compiled next to their source under `components/`

Issues and source live in the repository at https://github.com/JamesFehon-DTA/civictheme-uikit.
