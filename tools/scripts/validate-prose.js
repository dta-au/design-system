#!/usr/bin/env node

/**
 * Prose checker for the shared content corpus – the campaign companion to
 * validate-content-md.js. Not wired into CI; run it on changed docs before a
 * PR. The rules it mirrors live in guidance/writing-rules.md.
 *
 * Errors are objective defects and fail the run. Warnings need judgment and
 * never fail the run unless --strict promotes them.
 *
 * Usage:
 *   node tools/scripts/validate-prose.js [--strict] [file ...]
 *
 * With no file args the whole corpus is checked. The duplicate-filename check
 * always runs corpus-wide (it mirrors the consumer sync's collision failure).
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

// Component-doc trees share one slug namespace at the consumer.
const COMPONENT_DOC_ROOTS = [
  path.join(root, 'guidance/components'),
  path.join(root, 'packages/sdc/components'),
];

// Checkable subset of guidance/writing-rules.md. Change that file first,
// then mirror the change here.
const BANNED_HEADINGS = [
  'When to use this component',
  'When not to use this component',
  'Variations',
];
const PLACEHOLDER_MARKERS = /\[(to be reviewed|todo)\]|\bTBD\b/i;
const CAPS_ALLOW = new Set([
  'WCAG', 'HTML', 'ARIA', 'JSON', 'YAML', 'HTTP', 'HTTPS',
  'SDDC', 'SCSS', 'OKLCH', 'GIF', 'HREF',
]);
const ING_ALLOW = new Set([
  'During', 'Nothing', 'Anything', 'Everything', 'Something',
]);
const UNAPPROVED = [
  [/\butilis(?:e|es|ed|ing|ation)\b/i, 'use'],
  [/\bleverag(?:e|es|ed|ing)\b/i, 'use'],
  [/\bin order to\b/i, 'to'],
  [/\bprior to\b/i, 'before'],
  [/\bin the event that\b/i, 'if'],
  [/\bnote that\b/i, 'delete it'],
  [/\bit is important to\b/i, 'delete it'],
  [/\bsimply\b/i, 'delete it'],
  [/\beasily\b/i, 'delete it'],
  [/\breach for\b/i, 'choose'],
  [/\bsurfacing\b/i, 'showing'],
  [/\bto surface\b/i, 'to show'],
  [/\b(?:over|under)-?promot(?:e|es|ed|ing)\b/i, 'weight'],
];
const PASSIVE =
  /\b(?:is|are|was|were|be|been|being)\s+(?:\w+ed|built|done|found|given|held|kept|known|made|shown|written|chosen|hidden|set)\b/i;
const MAX_SENTENCE_WORDS = 25;
const MAX_TOC_H2_CHARS = 40;
const TAXONOMY_H2S = ['When to use', 'When not to use', 'Accessibility', 'Related components'];

const mdFiles = (dir) => {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return mdFiles(full);
    if (entry.name.endsWith('.md') && entry.name !== 'README.md') return [full];
    return [];
  });
};

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const fileArgs = args.filter((a) => a !== '--strict').map((a) => path.resolve(a));

const allFiles = ROOTS.flatMap(mdFiles);
const files = fileArgs.length ? allFiles.filter((f) => fileArgs.includes(f)) : allFiles;

const errors = [];
const warnings = [];

// Inline code is exempt from content checks; keep the line length stable.
const maskInlineCode = (line) => line.replace(/`[^`]*`/g, (m) => ' '.repeat(m.length));

const sentences = (text) =>
  text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
const wordCount = (s) => s.split(/\s+/).filter(Boolean).length;

for (const file of files) {
  const rel = path.relative(root, file);
  const text = fs.readFileSync(file, 'utf8');

  const fm = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!fm) continue; // validate-content-md owns this failure

  if (/^requires-cms-config/m.test(fm[1]) && !/^requires-cms-config: true$/m.test(fm[1])) {
    errors.push(`${rel}: requires-cms-config must be exactly \`requires-cms-config: true\` – the consumer routes on that byte sequence`);
  }

  if (!text.endsWith('\n')) errors.push(`${rel}: missing final newline`);

  const desc = fm[1].match(/^description:\s*['"]?(.+?)['"]?\s*$/m);
  if (desc && wordCount(desc[1]) > MAX_SENTENCE_WORDS) {
    warnings.push(`${rel}: description is ${wordCount(desc[1])} words – it renders as the lead paragraph and card summary`);
  }

  const body = text.slice(fm[0].length);
  if (body.trim() === '') continue; // intentional stubs (quote.md) carry no prose

  if (/^\n\n/.test(body)) errors.push(`${rel}: double blank line after frontmatter`);
  if (/\n{4,}/.test(body)) errors.push(`${rel}: three or more consecutive blank lines`);

  const fmLines = fm[0].split('\n').length;
  const isComponentDoc = COMPONENT_DOC_ROOTS.some((d) => file.startsWith(d + path.sep));
  const tocDoc = /^toc:\s*true\b/m.test(fm[1]);

  const headings = []; // { level, text, lineNo, contentAfter: 'none'|'deeper'|'prose' }
  let inFence = false;
  let paragraph = [];
  let paragraphStart = 0;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const blockText = paragraph.join(' ');
    for (const s of sentences(blockText)) {
      const words = wordCount(s);
      if (words > MAX_SENTENCE_WORDS) {
        warnings.push(`${rel}:${paragraphStart}: ${words}-word sentence – "${s.split(/\s+/).slice(0, 8).join(' ')}…"`);
      }
      const first = s.replace(/^[-*+]\s+|^\d+\.\s+|^\*\*|^\[/, '').split(/\s+/)[0] ?? '';
      if (/^[A-Z][a-z]+ing$/.test(first) && !ING_ALLOW.has(first)) {
        warnings.push(`${rel}:${paragraphStart}: sentence starts with an -ing form ("${first}")`);
      }
      if (/\bis (?:a |an |the )?[\w\s-]{2,30}, not /.test(s)) {
        warnings.push(`${rel}:${paragraphStart}: "is X, not Y" construction – state what it is`);
      }
    }
    paragraph = [];
  };

  body.split('\n').forEach((raw, i) => {
    const lineNo = fmLines + i;

    if (/[ \t]+$/.test(raw) && !inFence) errors.push(`${rel}:${lineNo}: trailing whitespace`);

    if (/^(```|~~~)/.test(raw.trim())) {
      flushParagraph();
      inFence = !inFence;
      return;
    }
    if (inFence) return;

    const line = maskInlineCode(raw);
    const trimmed = line.trim();

    if (/[‘’“”]/.test(line)) {
      errors.push(`${rel}:${lineNo}: curly quote – use straight quotes in source`);
    }

    const heading = trimmed.match(/^(#{2,6})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      const level = heading[1].length;
      const text2 = heading[2].trim();
      if (BANNED_HEADINGS.includes(text2)) {
        errors.push(`${rel}:${lineNo}: outdated heading "${text2}" – see the section taxonomy in guidance/writing-rules.md`);
      }
      if (PLACEHOLDER_MARKERS.test(text2)) {
        errors.push(`${rel}:${lineNo}: placeholder marker in heading "${text2}"`);
      }
      if (tocDoc && level === 2 && text2.length > MAX_TOC_H2_CHARS) {
        warnings.push(`${rel}:${lineNo}: H2 over ${MAX_TOC_H2_CHARS} chars on a toc page – H2s become nav labels`);
      }
      headings.push({ level, text: text2, lineNo, contentAfter: 'none' });
      return;
    }

    if (trimmed === '') {
      flushParagraph();
      return;
    }

    // Table rows and definition-list bodies are not sentences.
    const isTableRow = /^\|/.test(trimmed) || /^[-| :]+$/.test(trimmed);
    const isDeflist = /^:\s/.test(trimmed);
    const isBlockquote = /^>/.test(trimmed);

    const last = headings[headings.length - 1];
    if (last && last.contentAfter === 'none') last.contentAfter = 'prose';

    if (isBlockquote) return; // quoted external text is not ours to rewrite
    if (trimmed.startsWith('<')) return; // raw HTML blocks are not prose

    if (/—/.test(line)) warnings.push(`${rel}:${lineNo}: em dash – use an en dash`);

    for (const m of line.matchAll(/\b[A-Z]{4,}\b/g)) {
      if (!CAPS_ALLOW.has(m[0])) warnings.push(`${rel}:${lineNo}: all-caps "${m[0]}" – sentence case, or add to the acronym allowlist`);
    }

    if (isTableRow) {
      if (/^\|?\s*Used (?:for|to)\b/i.test(trimmed.replace(/^\|/, '').trim())) {
        warnings.push(`${rel}:${lineNo}: table cell starts "Used for/Used to" – name the subject or use an imperative`);
      }
      return;
    }
    if (isDeflist) return;

    for (const [re, fix] of UNAPPROVED) {
      const m = line.match(re);
      if (m) warnings.push(`${rel}:${lineNo}: unapproved "${m[0]}" – write "${fix}"`);
    }
    if (PASSIVE.test(line)) {
      warnings.push(`${rel}:${lineNo}: passive voice – name the actor`);
    }

    // Each list item is its own block – unpunctuated items must not merge
    // into one long "sentence".
    if (/^(?:[-*+]|\d+\.)\s/.test(trimmed)) {
      flushParagraph();
      paragraphStart = lineNo;
      paragraph.push(trimmed.replace(/^(?:[-*+]|\d+\.)\s+/, ''));
      flushParagraph();
      return;
    }

    if (!paragraph.length) paragraphStart = lineNo;
    paragraph.push(trimmed);
  });
  flushParagraph();

  headings.forEach((h, idx) => {
    const next = headings[idx + 1];
    if (h.contentAfter === 'prose') return;
    if (!next || next.level <= h.level) {
      errors.push(`${rel}:${h.lineNo}: empty section "${h.text}"`);
    } else {
      warnings.push(`${rel}:${h.lineNo}: section "${h.text}" has no intro prose before its subsections`);
    }
  });

  if (isComponentDoc) {
    const h2s = new Set(headings.filter((h) => h.level === 2).map((h) => h.text));
    for (const required of TAXONOMY_H2S) {
      if (!h2s.has(required)) warnings.push(`${rel}: component doc missing "## ${required}"`);
    }
    if (h2s.has('Do') !== h2s.has("Don't")) {
      warnings.push(`${rel}: "## Do" and "## Don't" must appear as a pair`);
    }
  }
}

// Duplicate filenames across the component-doc trees collide at the consumer
// sync (slug = basename). Always corpus-wide.
const byBasename = new Map();
for (const file of COMPONENT_DOC_ROOTS.flatMap(mdFiles)) {
  const base = path.basename(file);
  if (!byBasename.has(base)) byBasename.set(base, []);
  byBasename.get(base).push(path.relative(root, file));
}
for (const [base, paths] of byBasename) {
  if (paths.length > 1) {
    errors.push(`duplicate doc filename "${base}" – slugs collide at the consumer sync: ${paths.join(', ')}`);
  }
}

if (warnings.length) {
  console.log(`validate-prose: ${warnings.length} warning(s)\n`);
  for (const w of warnings) console.log(`  ${w}`);
  console.log('');
}
if (errors.length) {
  console.error(`validate-prose: ${errors.length} error(s)\n`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}
if (strict && warnings.length) {
  console.error('validate-prose: failing on warnings (--strict)');
  process.exit(1);
}
console.log(`validate-prose: clean (${files.length} file(s) checked${strict ? ', strict' : ''}).`);
