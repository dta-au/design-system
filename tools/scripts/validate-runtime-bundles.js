#!/usr/bin/env node

/* eslint-disable no-underscore-dangle */
/**
 * Validate that emitted runtime JS bundles parse as CLASSIC scripts.
 *
 * Runtime bundles (vite.runtime.config.js in each package) are loaded in the
 * browser as classic <script>s, where a top-level `export`/`import` is a hard
 * SyntaxError that discards the WHOLE bundle (every behaviour dies at once).
 *
 * The bundler should never emit ESM syntax into an IIFE output, but this
 * guard is the contract: `node --check` cannot catch a regression because
 * both packages are `"type": "module"`, so Node parses `dist/*.js` AS an ES
 * module and happily accepts `export`. We therefore parse each bundle with
 * `vm.Script`, which uses classic-script semantics — the same thing the
 * browser does.
 *
 * ESM/UMD library outputs from Vite (`*.esm.js`) are intentionally modules and
 * are skipped.
 *
 * Exits 1 if any classic bundle fails to parse as a classic script.
 */

import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// Classic runtime bundles live at the root of each package's dist/.
// Skip Vite ESM library outputs, which are modules by design.
const BUNDLE_GLOB = 'packages/*/dist/*.js';
const SKIP_SUFFIXES = ['.esm.js'];

const bundles = globSync(BUNDLE_GLOB, { cwd: projectRoot })
  .filter((rel) => !SKIP_SUFFIXES.some((suffix) => rel.endsWith(suffix)));

if (bundles.length === 0) {
  console.error(`No runtime bundles matched ${BUNDLE_GLOB}. Did you run "npm run build" first?`);
  process.exit(1);
}

let failed = 0;

bundles.forEach((rel) => {
  const abs = path.join(projectRoot, rel);
  const code = fs.readFileSync(abs, 'utf8');
  try {
    // Parse only — do not execute. Throws SyntaxError on top-level
    // import/export, i.e. ESM leaking into a classic bundle.
    const script = new vm.Script(code, { filename: abs });
    void script;
    console.log(`\x1b[32mOK\x1b[0m    ${rel}`);
  } catch (error) {
    failed++;
    console.error(`\x1b[31mFAIL\x1b[0m  ${rel}: ${error.message}`);
  }
});

if (failed > 0) {
  console.error(`\n${failed} bundle(s) are not valid classic scripts (ESM leaked into a classic bundle?).`);
  console.error('Runtime bundles are emitted by vite.runtime.config.js - check the civictheme-runtime plugin include globs.');
  process.exit(1);
}

console.log(`\n${bundles.length} runtime bundle(s) parse as classic scripts.`);
