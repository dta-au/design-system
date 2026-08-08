#!/usr/bin/env node

/**
 * Release tag gate. A patch tag must not carry new components – a new
 * component.yml is added API, and a consumer pinned to ~1.0.0 would take it as
 * a bug fix.
 *
 * Also warns when the tag sits off LATEST_LINE, because release.yml then
 * publishes under maintenance-<line> and skips both the Storybook deploy and
 * the docs dispatch.
 *
 * .husky/pre-push runs this for every v* ref being pushed. Run it by hand
 * before tagging:
 *   node tools/scripts/check-release-tag.js v1.1.0
 */

import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const git = (...args) =>
  execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();

const tag = process.argv[2];
if (!tag) {
  console.error('check-release-tag: needs a tag, e.g. v1.1.0');
  process.exit(1);
}

const version = tag.replace(/^v/, '');
if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error(`check-release-tag: "${tag}" is not a plain semver v-tag`);
  process.exit(1);
}
const line = version.slice(0, version.lastIndexOf('.'));

// The previous release is the nearest tag behind this one.
let previous = null;
try {
  previous = git('describe', '--tags', '--abbrev=0', `${tag}^`);
} catch {
  // First tag on the repo: nothing to compare against.
}

let failed = false;

if (previous) {
  const previousLine = previous.replace(/^v/, '').replace(/\.\d+$/, '');
  if (previousLine === line) {
    const added = git(
      'diff', '--name-only', '--diff-filter=A', previous, tag,
      '--', 'packages/sdc/components',
    )
      .split('\n')
      .filter((f) => f.endsWith('.component.yml'));

    if (added.length) {
      console.error(`check-release-tag: ${tag} is a patch on the ${line} line, but these components are new since ${previous}:\n`);
      for (const f of added) console.error(`  ${f}`);
      console.error('\nA new component is added API. Tag a minor instead.');
      failed = true;
    }
  }
}

// LATEST_LINE owns the npm `latest` dist-tag, the Storybook deploy and the
// docs dispatch. A tag off that line publishes as maintenance-<line>.
// Read it at the tagged commit, not from the working tree: the workflow that
// runs is the one in the tag, so a LATEST_LINE bump left uncommitted, or
// committed after the tag, still releases as maintenance.
let latestLine;
try {
  const workflow = git('show', `${tag}:.github/workflows/release.yml`);
  latestLine = (workflow.match(/^\s*LATEST_LINE:\s*'([^']+)'/m) ?? [])[1];
} catch {
  // No workflow at that commit: nothing to compare against.
}

// Opening a new line above LATEST_LINE is the silent one: npm takes the
// release under a maintenance dist-tag and both the Storybook deploy and the
// docs dispatch are skipped. Dropping below it is a real maintenance release.
const compareLines = (a, b) => {
  const [aMajor, aMinor] = a.split('.').map(Number);
  const [bMajor, bMinor] = b.split('.').map(Number);
  return aMajor - bMajor || aMinor - bMinor;
};

if (latestLine) {
  const delta = compareLines(line, latestLine);
  if (delta > 0) {
    console.error(`check-release-tag: ${tag} opens the ${line} line, but LATEST_LINE is still '${latestLine}'.`);
    console.error(`  It would publish as maintenance-${line}: no latest dist-tag, no Storybook deploy, no docs dispatch.`);
    console.error(`  Bump LATEST_LINE in .github/workflows/release.yml in the same commit you tag.`);
    failed = true;
  } else if (delta < 0) {
    console.log(`check-release-tag: ${tag} is a maintenance release on the ${line} line; the current line is ${latestLine}.`);
    console.log(`  It publishes as maintenance-${line}, with no Storybook deploy and no docs dispatch.`);
  }
}

if (failed) process.exit(1);
console.log(`check-release-tag: ${tag} looks right${previous ? ` against ${previous}` : ''}.`);
