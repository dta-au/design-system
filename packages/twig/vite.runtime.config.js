import { defineConfig } from 'vite';
import { resolve } from 'path';
import civicthemeRuntime, { RUNTIME_ENTRY } from '../../tools/vite/runtime-bundle.js';

// Runtime behaviour bundle for the twig package - the supported entry
// downstream consumers import instead of scavenging the storybook artifact.
//
// dist/civictheme.js     IIFE, classic-safe, auto-attaches (main entry).
// dist/civictheme.esm.js ES module exporting { attach, behaviours }.
// civictheme.storybook.js is kept as a byte-identical alias of civictheme.js
// for the Storybook preview and consumers not yet on the documented entry.
//
// Include pattern matches the behaviour set the old build.js concat used.
export default defineConfig({
  plugins: [
    civicthemeRuntime({
      componentsDir: resolve(import.meta.dirname, 'components'),
      include: ['**/!(*.stories|*.stories.data|*.component|*.min|*.test|*.script|*.utils|*.data).js'],
      aliases: { 'civictheme.js': ['civictheme.storybook.js'] },
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
          entryFileNames: 'civictheme.js',
          // Behaviour sources were written for sloppy-mode concat; do not
          // impose strict mode on the classic bundle.
          strict: false,
        },
        {
          format: 'es',
          entryFileNames: 'civictheme.esm.js',
        },
      ],
    },
  },
});
