import { defineConfig } from 'vite';
import { resolve } from 'path';

// Library build for the shared chart data module.
//
// chart.data.js is the data contract (parse, validate, fetch, resolveSourcePage)
// shared between this renderer and bdga. This build emits it as ESM + UMD into
// dist/ so bdga can vendor both: ESM for its webpack frontend bundle, UMD
// (global: bdgaChartData) for the plain-JS admin editor. The module is
// dependency-free, so nothing is bundled or externalised.
export default defineConfig({
  build: {
    outDir: 'dist',
    // dist/ also holds the CSS/JS/constants emitted by build.js - do not wipe it.
    emptyOutDir: false,
    sourcemap: false,
    // Small module; keep the vendored copy reviewable rather than minified.
    minify: false,
    lib: {
      entry: resolve(import.meta.dirname, 'components/03-organisms/chart/chart.data.js'),
      name: 'bdgaChartData',
      formats: ['es', 'umd'],
      fileName: (format) => (format === 'es' ? 'chart.data.esm.js' : 'chart.data.umd.js'),
    },
  },
});
