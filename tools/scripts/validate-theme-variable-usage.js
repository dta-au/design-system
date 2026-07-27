#!/usr/bin/env node

/**
 * Validates CSS variable usage across the built theme and component CSS.
 *
 * Two checks, two severities:
 * - Used but never defined, with no var() fallback: renders broken, so this
 *   fails the run. Usages with a fallback are the intentional override-hook
 *   pattern and are not reported.
 * - Defined in civictheme.variables.css but never used: cruft, reported as a
 *   warning without failing the run.
 *
 * Requires a build (reads packages/sdc/dist); skips with a notice if absent.
 */

import fs from 'fs';
import path from 'path';

const dirname = import.meta.dirname;

const VARIABLES_FILE = path.join(
  dirname,
  '../../packages/sdc/dist/civictheme.variables.css'
);

const BASE_CSS_FILE = path.join(
  dirname,
  '../../packages/sdc/dist/civictheme.base.css'
);

const COMPONENTS_DIR = path.join(
  dirname,
  '../../packages/sdc/components'
);

// ANSI colour codes for terminal output
const colours = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

/**
 * Extracts CSS variable names defined in the content.
 * @param {string} content - CSS file content
 * @returns {Set<string>} Set of variable names (without the -- prefix)
 */
function extractDefinedVariables(content) {
  const variables = new Set();
  // Match CSS custom property definitions: --variable-name: value;
  const variablePattern = /--([\w-]+)\s*:/g;
  let match;

  while ((match = variablePattern.exec(content)) !== null) {
    variables.add(match[1]);
  }

  return variables;
}

/**
 * Finds all CSS files recursively in a directory.
 * @param {string} dir - Directory to search
 * @param {string[]} files - Accumulated file paths
 * @returns {string[]} Array of CSS file paths
 */
function findCssFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findCssFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.css')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Extracts variable usages from CSS content, split by fallback presence.
 * @param {string} content - CSS file content
 * @returns {{withFallback: Set<string>, withoutFallback: Set<string>}}
 */
function extractUsedVariables(content) {
  const withFallback = new Set();
  const withoutFallback = new Set();
  // Match var(--variable-name) or var(--variable-name, fallback)
  const varPattern = /var\(\s*--([\w-]+)\s*([,)])/g;
  let match;

  while ((match = varPattern.exec(content)) !== null) {
    (match[2] === ',' ? withFallback : withoutFallback).add(match[1]);
  }

  return { withFallback, withoutFallback };
}

/**
 * Main validation function.
 */
function validateVariableUsage() {
  console.log(`${colours.blue}Validating CSS variable usage...${colours.reset}\n`);

  // A missing build is expected in contexts that lint before building (CI):
  // skip visibly rather than fail.
  if (!fs.existsSync(VARIABLES_FILE)) {
    console.log(`${colours.yellow}Skipped: ${VARIABLES_FILE} not found. Run 'npm run dist' first to enable this check.${colours.reset}`);
    process.exit(0);
  }

  const variablesContent = fs.readFileSync(VARIABLES_FILE, 'utf8');
  const themeDefined = extractDefinedVariables(variablesContent);
  console.log(`${colours.blue}Variables file:${colours.reset} ${VARIABLES_FILE}`);
  console.log(`Found ${colours.green}${themeDefined.size}${colours.reset} defined variables\n`);

  let cssFiles;
  try {
    cssFiles = findCssFiles(COMPONENTS_DIR);
  } catch (error) {
    console.log(`${colours.red}Error reading components directory: ${error.message}${colours.reset}`);
    process.exit(1);
  }

  console.log(`${colours.blue}Components directory:${colours.reset} ${COMPONENTS_DIR}`);
  console.log(`Found ${colours.green}${cssFiles.length}${colours.reset} CSS files\n`);

  let baseCssContent = '';
  try {
    baseCssContent = fs.readFileSync(BASE_CSS_FILE, 'utf8');
    console.log(`${colours.blue}Base CSS file:${colours.reset} ${BASE_CSS_FILE}`);
  } catch (error) {
    console.log(`${colours.yellow}Warning: Could not read base CSS file: ${error.message}${colours.reset}\n`);
  }

  // Definitions from anywhere satisfy the undefined check; the unused check
  // only covers the theme variables file.
  const definedAnywhere = new Set(themeDefined);
  const usedAnywhere = new Set();
  const usedWithoutFallback = new Set();

  const scanContent = (content) => {
    extractDefinedVariables(content).forEach((v) => definedAnywhere.add(v));
    const used = extractUsedVariables(content);
    used.withFallback.forEach((v) => usedAnywhere.add(v));
    used.withoutFallback.forEach((v) => {
      usedAnywhere.add(v);
      usedWithoutFallback.add(v);
    });
  };

  for (const file of cssFiles) {
    scanContent(fs.readFileSync(file, 'utf8'));
  }
  if (baseCssContent) {
    scanContent(baseCssContent);
  }
  scanContent(variablesContent);

  console.log(`Found ${colours.green}${usedAnywhere.size}${colours.reset} total unique variables used\n`);
  console.log(`${'─'.repeat(60)}\n`);

  // Blocking: used with no fallback and never defined.
  const undefinedVariables = [...usedWithoutFallback]
    .filter((v) => !definedAnywhere.has(v))
    .sort();

  if (undefinedVariables.length > 0) {
    console.log(`${colours.red}Used without fallback but never defined:${colours.reset}\n`);
    undefinedVariables.forEach((varName) => {
      console.log(`  ${colours.red}--${varName}${colours.reset}`);
    });
    console.log();
  }

  // Warning only: defined in the theme variables file but never used.
  const unusedVariables = [...themeDefined]
    .filter((v) => !usedAnywhere.has(v))
    .sort();

  if (unusedVariables.length > 0) {
    console.log(`${colours.yellow}Unused variables (warning):${colours.reset}\n`);
    unusedVariables.forEach((varName) => {
      console.log(`  ${colours.yellow}--${varName}${colours.reset}`);
    });
    console.log();
  }

  console.log('─'.repeat(60));

  if (undefinedVariables.length > 0) {
    console.log(`${colours.red}✗ Found ${undefinedVariables.length} undefined variable(s) used without a fallback${colours.reset}`);
    process.exit(1);
  }
  if (unusedVariables.length > 0) {
    console.log(`${colours.yellow}⚠ Found ${unusedVariables.length} unused variable(s) – not blocking${colours.reset}`);
    process.exit(0);
  }
  console.log(`${colours.green}✓ All variables defined and used!${colours.reset}`);
  process.exit(0);
}

// Run validation
validateVariableUsage();
