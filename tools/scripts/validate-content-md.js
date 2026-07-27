#!/usr/bin/env node

/**
 * Structural gate for the shared content corpus: guidance/** and the
 * component .md twins under packages/sdc/components.
 *
 * These files are consumed by the design library's Astro build via the
 * docs-live git ref, so a Storybook import or JSX block that leaks into one
 * breaks the consumer, not this repo. The gate enforces buildability only;
 * semantic validation (taxonomy enums, a11y) is owned by the consumer, which
 * fails stale-not-broken.
 *
 * Rules per file:
 *   - YAML frontmatter block with non-empty `title` and `description`
 *   - no `import ` statements
 *   - no JSX (a line starting with `<` + capital letter) outside code fences
 *   - no H1 in the body (consumers render the frontmatter title; Storybook
 *     shims supply their own H1)
 *
 * README.md files are engineering docs, not corpus content, and are skipped.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(scriptDir, '../..');

const ROOTS = [
  path.join(root, 'guidance'),
  path.join(root, 'packages/sdc/components'),
];

const mdFiles = (dir) => {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return mdFiles(full);
    if (entry.name.endsWith('.md') && entry.name !== 'README.md') return [full];
    return [];
  });
};

const errors = [];

for (const dir of ROOTS) {
  for (const file of mdFiles(dir)) {
    const rel = path.relative(root, file);
    const text = fs.readFileSync(file, 'utf8');

    const fm = text.match(/^---\n([\s\S]*?)\n---\n?/);
    if (!fm) {
      errors.push(`${rel}: missing frontmatter block`);
      continue;
    }
    for (const key of ['title', 'description']) {
      if (!new RegExp(`^${key}:\\s*\\S`, 'm').test(fm[1])) {
        errors.push(`${rel}: frontmatter missing ${key}`);
      }
    }

    const body = text.slice(fm[0].length);
    let inFence = false;
    body.split('\n').forEach((line, i) => {
      const lineNo = fm[0].split('\n').length + i;
      if (/^(```|~~~)/.test(line.trim())) {
        inFence = !inFence;
        return;
      }
      if (inFence) return;
      if (/^import\s/.test(line)) {
        errors.push(`${rel}:${lineNo}: import statement in shared content`);
      }
      if (/^<[A-Z]/.test(line.trim())) {
        errors.push(`${rel}:${lineNo}: JSX in shared content`);
      }
      if (/^#\s/.test(line)) {
        errors.push(`${rel}:${lineNo}: H1 in body (title belongs in frontmatter)`);
      }
    });
  }
}

if (errors.length) {
  console.error(`validate-content-md: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}
console.log('validate-content-md: shared content is structurally clean.');
