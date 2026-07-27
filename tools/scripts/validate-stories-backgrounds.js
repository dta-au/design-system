#!/usr/bin/env node

/**
 * Guards against the dead Storybook 8 backgrounds pattern in story files.
 *
 * `parameters.backgrounds: { default: '<name>' }` is silently inert on
 * Storybook 10 – no lint error, no console warning – so a Dark story keeps a
 * white canvas while looking correct. SB10 sets the canvas background per story
 * via the globals API instead:
 *
 *     globals: { backgrounds: { value: 'dark' } }
 *
 * where the value is the option KEY from backgrounds.options in
 * packages/sdc/.storybook/preview.js (e.g. `dark`), not the display name.
 *
 * This check scans every *.stories.js under packages/<pkg>/components and fails
 * if the SB8 pattern reappears.
 */

import fs from 'fs';
import path from 'path';

const dirname = import.meta.dirname;

const COMPONENTS_DIRS = [
  path.join(dirname, '../../packages/sdc/components'),
  path.join(dirname, '../../packages/twig/components'),
];

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

// Matches `backgrounds: { default` with any inner whitespace.
const SB8_PATTERN = /backgrounds:\s*\{\s*default\b/;

/**
 * Recursively collects *.stories.js files under a directory.
 * @param {string} dir - Directory to walk
 * @returns {string[]} Absolute paths to story files
 */
function findStoryFiles(dir) {
  if (!fs.existsSync(dir)) return [];

  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findStoryFiles(full));
    } else if (entry.name.endsWith('.stories.js')) {
      files.push(full);
    }
  }
  return files;
}

function validateStoryBackgrounds() {
  console.log(`${colors.blue}Validating Storybook backgrounds API in story files...${colors.reset}\n`);

  const offenders = [];

  COMPONENTS_DIRS.forEach((dir) => {
    findStoryFiles(dir).forEach((filePath) => {
      const lines = fs.readFileSync(filePath, 'utf8').split('\n');
      lines.forEach((line, index) => {
        if (SB8_PATTERN.test(line)) {
          offenders.push({ filePath, line: index + 1, text: line.trim() });
        }
      });
    });
  });

  console.log('─'.repeat(60));
  if (offenders.length > 0) {
    console.log(`${colors.red}✗ Found ${offenders.length} dead Storybook 8 backgrounds pattern(s):${colors.reset}\n`);
    offenders.forEach((o) => {
      console.log(`  ${colors.yellow}${o.filePath}:${o.line}${colors.reset}`);
      console.log(`    ${o.text}\n`);
    });
    console.log(
      `${colors.red}SB10 ignores parameters.backgrounds.default silently (white canvas).${colors.reset}`
    );
    console.log(
      `Use the globals API instead: ${colors.green}globals: { backgrounds: { value: 'dark' } }${colors.reset}`
    );
    console.log(
      `where the value is the option KEY from backgrounds.options in packages/sdc/.storybook/preview.js.`
    );
    process.exit(1);
  } else {
    console.log(`${colors.green}✓ No dead SB8 backgrounds pattern found in any story file.${colors.reset}`);
    process.exit(0);
  }
}

validateStoryBackgrounds();
