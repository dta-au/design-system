#!/usr/bin/env node

/**
 * Validate the declared JS entry points of both publishable packages.
 *
 * For packages/twig and packages/sdc, asserts that:
 * - `main`, `module`, and every concrete `exports` target exist on disk
 *   (patterns with `*` are checked to their static base directory);
 * - `main` and every `default` condition parse as CLASSIC scripts
 *   (vm.Script), since consumers load them via plain <script> tags;
 * - `module` and every `import` condition actually contain ESM exports.
 *
 * Run after `npm run dist` - built files must exist. Wired into
 * `npm run check:bundles` alongside the classic-bundle guard.
 */

import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const PACKAGES = ['packages/twig', 'packages/sdc'];

let failed = 0;

const fail = (message) => {
  failed++;
  console.error(`\x1b[31mFAIL\x1b[0m  ${message}`);
};

const ok = (message) => {
  console.log(`\x1b[32mOK\x1b[0m    ${message}`);
};

const checkExists = (packageDir, target) => {
  // "./dist/*" style patterns - assert the static base directory exists.
  const staticPart = target.includes('*') ? path.dirname(target.slice(0, target.indexOf('*'))) : target;
  const abs = path.join(projectRoot, packageDir, staticPart);
  if (!fs.existsSync(abs)) {
    fail(`${packageDir}: ${target} does not exist (expected ${staticPart})`);
    return null;
  }
  return target.includes('*') ? null : abs;
};

const checkClassic = (packageDir, target, abs) => {
  try {
    // Parse only - throws SyntaxError on top-level import/export.
    const script = new vm.Script(fs.readFileSync(abs, 'utf8'), { filename: abs });
    void script;
    ok(`${packageDir}: ${target} parses as a classic script`);
  } catch (error) {
    fail(`${packageDir}: ${target} is not a valid classic script: ${error.message}`);
  }
};

const checkEsm = (packageDir, target, abs) => {
  const source = fs.readFileSync(abs, 'utf8');
  if (/^\s*export\s/m.test(source)) {
    ok(`${packageDir}: ${target} contains ESM exports`);
  } else {
    fail(`${packageDir}: ${target} declared as a module entry but has no ESM exports`);
  }
};

PACKAGES.forEach((packageDir) => {
  const manifestPath = path.join(projectRoot, packageDir, 'package.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  ['main', 'module', 'exports'].forEach((field) => {
    if (!manifest[field]) {
      fail(`${packageDir}: package.json is missing "${field}"`);
    }
  });

  if (manifest.main) {
    const abs = checkExists(packageDir, manifest.main);
    if (abs) checkClassic(packageDir, manifest.main, abs);
  }
  if (manifest.module) {
    const abs = checkExists(packageDir, manifest.module);
    if (abs) checkEsm(packageDir, manifest.module, abs);
  }

  Object.entries(manifest.exports || {}).forEach(([subpath, value]) => {
    const conditions = typeof value === 'string' ? { default: value } : value;
    Object.entries(conditions).forEach(([condition, target]) => {
      const abs = checkExists(packageDir, target);
      if (!abs || !target.endsWith('.js')) {
        return;
      }
      if (condition === 'default') {
        checkClassic(packageDir, `${subpath} (${condition})`, abs);
      }
      if (condition === 'import') {
        checkEsm(packageDir, `${subpath} (${condition})`, abs);
      }
    });
  });
});

if (failed > 0) {
  console.error(`\n${failed} package entry problem(s). Run "npm run dist" first if files are missing.`);
  process.exit(1);
}

console.log('\nPackage entries are declared and resolve.');
