# @dta-au/civictheme-twig

CivicTheme UI Kit for Twig – components plus compiled CSS/JS distributables for non-Drupal consumers.

## Runtime JS

`dist/civictheme.js` is the supported runtime entry (package main): a classic-safe IIFE bundle of every component behaviour, built by Vite. It runs behaviours on DOMContentLoaded – or registers one `Drupal.behaviors.civictheme_*` entry per behaviour when Drupal is present – and exposes `window.CivicTheme.attach()` for re-running behaviours over injected DOM.

Load it as a classic script:

```html
<script src="civictheme.js"></script>
```

Or import the ES module build, which exports `attach` and `behaviours`:

```js
import { attach } from '@dta-au/civictheme-twig';
```

`dist/civictheme.storybook.js` is a byte-identical alias kept for consumers of the old storybook artifact – switch to `dist/civictheme.js`.

## Styles

- `dist/civictheme.css` – all component styles
- `dist/civictheme.variables.css` – CSS custom properties

## Source components

Twig templates, SCSS, and behaviour JS live under `components/`, mirrored from the SDC package in this repo. Behaviour files are plain classic scripts; a behaviour authored as an ES module must `export default` its init function, and the bundler resolves its imports.

Issues and source live in the repository at https://github.com/JamesFehon-DTA/civictheme-uikit.
