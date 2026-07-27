import { defineConfig } from 'vite';
import { resolve } from 'path';
import civicthemeRuntime, { RUNTIME_ENTRY } from '../../tools/vite/runtime-bundle.js';

// Base runtime bundle for the sdc package. Components ship their JS
// per-directory for Drupal SDC auto-attach; only the 00-base utilities (and
// window.Popper) need a global bundle.
//
// dist/civictheme.base.js     IIFE, classic-safe, auto-attaches (main entry).
// dist/civictheme.base.esm.js ES module exporting { attach, behaviours }.
// civictheme.drupal.base.js is kept as a byte-identical alias - the bundle is
// environment-aware, so the separate Drupal build no longer exists.
//
// Include pattern matches the base set the old build.js concat used.
export default defineConfig({
  plugins: [
    civicthemeRuntime({
      componentsDir: resolve(import.meta.dirname, 'components'),
      include: ['00-base/**/!(*.stories|*.test|*.data|*.stories.data|*.utils).js'],
      aliases: { 'civictheme.base.js': ['civictheme.drupal.base.js'] },
    }),
  ],
  build: {
    outDir: 'dist',
    // dist/ also holds the CSS/JS/constants emitted by build.js - do not wipe it.
    emptyOutDir: false,
    sourcemap: false,
    // Keep the published bundle reviewable rather than minified.
    minify: false,
    rollupOptions: {
      input: RUNTIME_ENTRY,
      // Vite's app-mode default drops entry exports; keep attach/behaviours.
      preserveEntrySignatures: 'strict',
      output: [
        {
          format: 'iife',
          name: 'CivicTheme',
          entryFileNames: 'civictheme.base.js',
          // Behaviour sources were written for sloppy-mode concat; do not
          // impose strict mode on the classic bundle.
          strict: false,
        },
        {
          format: 'es',
          entryFileNames: 'civictheme.base.esm.js',
        },
      ],
    },
  },
});
