#!/usr/bin/env node

/**
 * Link and anchor checker for the shared content corpus. Campaign companion
 * to validate-content-md.js; not wired into CI.
 *
 * Builds the consumer's URL space by replicating its sync routing (slug =
 * basename; `requires-cms-config: true` routes a component doc to
 * /components-advanced/), slugs every heading the way Astro does
 * (github-slugger semantics), then verifies that every internal link and
 * anchor in the corpus resolves.
 *
 * Usage:
 *   node tools/scripts/validate-links.js                 # check the corpus
 *   node tools/scripts/validate-links.js --baseline REF  # list anchors that
 *     existed at git REF but are gone from the working tree (rename audit;
 *     informational, always exits 0)
 */

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(scriptDir, '../..');

const GUIDANCE = path.join(root, 'guidance');
const SDC_COMPONENTS = path.join(root, 'packages/sdc/components');

// Site routes that exist outside the synced collections.
const KNOWN_ROUTES = new Set([
  '/', '/components/', '/patterns/', '/foundations/', '/templates/',
  '/search/', '/plan/', '/plan/content/', '/plan/development/', '/plan/metadata/',
]);

const mdFiles = (dir) => {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return mdFiles(full);
    if (entry.name.endsWith('.md') && entry.name !== 'README.md') return [full];
    return [];
  });
};

// Mirror of scripts/sync-content.mjs routing in the consumer repo.
const urlFor = (relPath, text) => {
  const base = path.basename(relPath, '.md');
  const dir = relPath.split(path.sep);
  if (dir[0] === 'guidance' && dir.length === 2) return null; // root guidance files are not synced
  if (dir[0] === 'guidance' && dir[1] === 'patterns') return `/patterns/${base}/`;
  if (dir[0] === 'guidance' && dir[1] === 'foundations') return `/foundations/${base}/`;
  if (dir[0] === 'guidance' && dir[1] === 'templates') {
    return base === 'index' ? '/templates/' : `/templates/${base}/`;
  }
  // Component docs: guidance/components/ and the sdc twins share one namespace.
  const fm = text.match(/^---\n([\s\S]*?)\n---\n?/);
  const advanced = fm && /^requires-cms-config:\s*true\b/m.test(fm[1]);
  return advanced ? `/components-advanced/${base}/` : `/components/${base}/`;
};

// github-slugger semantics – what Astro generates heading IDs with.
const slugify = (heading) => {
  const text = heading
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .toLowerCase()
    .replace(/[^\w\- ]/g, '')
    .replace(/ /g, '-');
  return text;
};

const parseDoc = (text) => {
  const fm = text.match(/^---\n([\s\S]*?)\n---\n?/);
  const body = fm ? text.slice(fm[0].length) : text;
  const fmLines = fm ? fm[0].split('\n').length : 1;
  const anchors = new Set();
  const links = [];
  const seen = new Map();
  let inFence = false;
  body.split('\n').forEach((line, i) => {
    if (/^(```|~~~)/.test(line.trim())) { inFence = !inFence; return; }
    if (inFence) return;
    const heading = line.trim().match(/^#{1,6}\s+(.*)$/);
    if (heading) {
      let slug = slugify(heading[1].trim());
      const n = seen.get(slug) ?? 0;
      seen.set(slug, n + 1);
      if (n > 0) slug = `${slug}-${n}`;
      anchors.add(slug);
      return;
    }
    for (const m of line.matchAll(/\]\(([^)\s]+)\)/g)) {
      links.push({ target: m[1], lineNo: fmLines + i });
    }
  });
  return { anchors, links };
};

const buildCorpus = (read, list) => {
  const pages = new Map(); // url -> anchors
  const sources = [];      // { rel, url|null, anchors, links }
  for (const rel of list) {
    const text = read(rel);
    if (text === null) continue;
    const { anchors, links } = parseDoc(text);
    const url = urlFor(rel, text);
    if (url) pages.set(url, anchors);
    sources.push({ rel, url, anchors, links });
  }
  return { pages, sources };
};

const workingList = () =>
  [...mdFiles(GUIDANCE), ...mdFiles(SDC_COMPONENTS)].map((f) => path.relative(root, f));
const readWorking = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const args = process.argv.slice(2);
const baselineIdx = args.indexOf('--baseline');

if (baselineIdx !== -1) {
  const ref = args[baselineIdx + 1];
  if (!ref) {
    console.error('validate-links: --baseline needs a git ref');
    process.exit(1);
  }
  const lsTree = execFileSync(
    'git', ['ls-tree', '-r', '--name-only', ref, '--', 'guidance', 'packages/sdc/components'],
    { cwd: root, encoding: 'utf8' },
  );
  const baseList = lsTree.split('\n').filter(
    (p) => p.endsWith('.md') && path.basename(p) !== 'README.md',
  );
  const readAtRef = (rel) => {
    try {
      return execFileSync('git', ['show', `${ref}:${rel}`], { cwd: root, encoding: 'utf8' });
    } catch {
      return null;
    }
  };
  const before = buildCorpus(readAtRef, baseList);
  const after = buildCorpus(readWorking, workingList());

  let removals = 0;
  for (const [url, anchors] of before.pages) {
    if (!after.pages.has(url)) {
      console.log(`removed page: ${url}`);
      removals++;
      continue;
    }
    for (const a of anchors) {
      if (!after.pages.get(url).has(a)) {
        console.log(`removed anchor: ${url}#${a}`);
        removals++;
      }
    }
  }
  console.log(removals
    ? `validate-links: ${removals} anchor/page removal(s) vs ${ref} – each must be deliberate.`
    : `validate-links: no anchors or pages removed vs ${ref}.`);
  process.exit(0);
}

const { pages, sources } = buildCorpus(readWorking, workingList());
const errors = [];

for (const src of sources) {
  for (const { target, lineNo } of src.links) {
    if (/^(https?:|mailto:)/.test(target)) continue;

    if (target.startsWith('#')) {
      if (!src.anchors.has(target.slice(1))) {
        errors.push(`${src.rel}:${lineNo}: broken same-page anchor ${target}`);
      }
      continue;
    }

    if (!target.startsWith('/')) {
      errors.push(`${src.rel}:${lineNo}: relative link "${target}" – use a site-absolute route`);
      continue;
    }
    if (target.startsWith('/dga-dl/')) {
      errors.push(`${src.rel}:${lineNo}: stale /dga-dl/ base path in "${target}"`);
      continue;
    }

    const [rawPath, anchor] = target.split('#');
    const urlPath = rawPath.endsWith('/') ? rawPath : `${rawPath}/`;

    if (!pages.has(urlPath) && !KNOWN_ROUTES.has(urlPath)) {
      errors.push(`${src.rel}:${lineNo}: no page at "${target}"`);
      continue;
    }
    if (anchor && pages.has(urlPath) && !pages.get(urlPath).has(anchor)) {
      errors.push(`${src.rel}:${lineNo}: no anchor #${anchor} on ${urlPath}`);
    }
  }
}

if (errors.length) {
  console.error(`validate-links: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}
console.log(`validate-links: all internal links and anchors resolve (${sources.length} file(s)).`);
