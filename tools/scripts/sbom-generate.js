#!/usr/bin/env node

/**
 * Generates CycloneDX SBOMs for the UIKit from package-lock.json via
 * `npm sbom`, then merges the manual components declared in
 * tools/sbom/components.annex.json (vendored D3, fonts, native binaries,
 * git-override annotations).
 *
 * Outputs (default .logs/sbom/):
 *   uikit-dev.cdx.json       - full dev graph (everything npm ci installs)
 *   uikit-dist-sdc.cdx.json  - published @dta-au/designsystem-sdc surface
 *   uikit-dist-twig.cdx.json - published @dta-au/designsystem-twig surface
 *   uikit-storybook.cdx.json - deployed Storybook site (annex-only)
 *
 * Usage: node tools/scripts/sbom-generate.js [--out <dir>]
 *          [--target dev|dist|storybook|all] [--version <x.y.z>]
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// eslint-disable-next-line no-underscore-dangle
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-underscore-dangle
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.join(__dirname, '../..');
const ANNEX_PATH = path.join(REPO_ROOT, 'tools/sbom/components.annex.json');

// ANSI color codes for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
};

/**
 * Resolves versionFrom entries in the annex against the repo state.
 * @param {Object} annex - Parsed annex JSON.
 * @param {Object} resolvers - Map of versionFrom key to () => string|null.
 * @returns {{annex: Object, warnings: string[]}} Copy with versions applied.
 */
export function resolveAnnexVersions(annex, resolvers) {
  const warnings = [];
  const resolved = structuredClone(annex);
  for (const entry of resolved.components) {
    if (!entry.versionFrom) continue;
    const resolver = resolvers[entry.versionFrom];
    const version = resolver ? resolver() : null;
    if (!version) {
      warnings.push(
        `Could not resolve version for "${entry.component.name}" (versionFrom: ${entry.versionFrom}); emitting "unknown"`
      );
    }
    entry.component.version = version || 'unknown';
    if (entry.component.purl) {
      entry.component.purl = entry.component.purl.replace(
        '{version}',
        entry.component.version
      );
    }
  }
  return { annex: resolved, warnings };
}

/**
 * Merges annex components and annotations for one target into an SBOM.
 * Annotation subjects are matched by component name (survives version churn).
 * @param {Object} sbom - CycloneDX document (mutated).
 * @param {Object} annex - Annex with versions already resolved.
 * @param {string} target - dev | dist-sdc | dist-twig | storybook.
 * @returns {string[]} Warnings.
 */
export function mergeAnnex(sbom, annex, target) {
  const warnings = [];
  for (const entry of annex.components) {
    if (!entry.targets.includes(target)) continue;
    const component = structuredClone(entry.component);
    if (!component['bom-ref']) {
      component['bom-ref'] = `${component.name}@${component.version}`;
    }
    sbom.components = sbom.components || [];
    sbom.components.push(component);
  }
  for (const annotation of annex.annotations || []) {
    if (!annotation.targets.includes(target)) continue;
    const subject = (sbom.components || []).find(
      (c) => c.name === annotation.subjectName
    );
    if (!subject) {
      warnings.push(
        `Annotation subject "${annotation.subjectName}" not found in ${target} SBOM; skipped`
      );
      continue;
    }
    sbom.annotations = sbom.annotations || [];
    sbom.annotations.push({
      subjects: [subject['bom-ref']],
      annotator: { organization: { name: 'DTA - civictheme-uikit' } },
      timestamp: new Date().toISOString(),
      text: annotation.text,
    });
  }
  return warnings;
}

/**
 * Re-roots a workspace SBOM at the published package. `npm sbom --workspace`
 * keeps the private monorepo root as metadata.component; this promotes the
 * workspace package into that slot and drops the monorepo root entirely.
 * @param {Object} sbom - CycloneDX document (mutated).
 * @param {string} pkgName - Scoped package name, e.g. @dta-au/designsystem-sdc.
 */
export function promoteWorkspaceComponent(sbom, pkgName) {
  const wsIndex = (sbom.components || []).findIndex((c) =>
    (c['bom-ref'] || '').startsWith(`${pkgName}@`)
  );
  if (wsIndex === -1) {
    throw new Error(`Workspace package ${pkgName} not found in SBOM components`);
  }
  const wsComponent = sbom.components.splice(wsIndex, 1)[0];
  const [, scope, bareName] = pkgName.match(/^(?:(@[^/]+)\/)?(.+)$/);
  wsComponent.name = bareName;
  if (scope) {
    wsComponent.group = scope;
  }
  const oldRootRef = sbom.metadata.component['bom-ref'];
  sbom.metadata.component = wsComponent;
  sbom.dependencies = (sbom.dependencies || []).filter(
    (d) => d.ref !== oldRootRef
  );
}

/**
 * Drops components not reachable from metadata.component via the dependency
 * graph. `npm sbom --omit dev` still emits peers of dev dependencies (scope
 * "optional", e.g. twig via twig-testing-library) that consumers of the
 * published package never install.
 * @param {Object} sbom - CycloneDX document (mutated).
 */
export function pruneUnreachableComponents(sbom) {
  const edges = new Map(
    (sbom.dependencies || []).map((d) => [d.ref, d.dependsOn || []])
  );
  const reachable = new Set();
  const queue = [sbom.metadata.component['bom-ref']];
  while (queue.length > 0) {
    const ref = queue.pop();
    if (reachable.has(ref)) continue;
    reachable.add(ref);
    queue.push(...(edges.get(ref) || []));
  }
  sbom.components = (sbom.components || []).filter((c) =>
    reachable.has(c['bom-ref'])
  );
  sbom.dependencies = (sbom.dependencies || []).filter((d) =>
    reachable.has(d.ref)
  );
}

/**
 * Stamps a release version onto the SBOM's root component, keeping bom-ref,
 * purl and dependency refs consistent. Used on tag builds, where the tag
 * version is applied to the workspaces only inside the publish job.
 * @param {Object} sbom - CycloneDX document (mutated).
 * @param {string} version - Plain semver, no v prefix.
 */
export function stampVersion(sbom, version) {
  const root = sbom.metadata.component;
  const oldRef = root['bom-ref'];
  root.version = version;
  if (root['bom-ref']) {
    root['bom-ref'] = root['bom-ref'].replace(/@[^@]+$/, `@${version}`);
  }
  if (root.purl) {
    root.purl = root.purl.replace(/@[^@]+$/, `@${version}`);
  }
  for (const dep of sbom.dependencies || []) {
    if (dep.ref === oldRef) dep.ref = root['bom-ref'];
  }
}

function appendToolEntry(sbom, version) {
  sbom.metadata.tools = sbom.metadata.tools || [];
  sbom.metadata.tools.push({
    name: 'civictheme-uikit-sbom-generate',
    version,
  });
}

function runNpmSbom(args) {
  const output = execSync(
    `npm sbom --sbom-format cyclonedx --package-lock-only ${args}`.trim(),
    { cwd: REPO_ROOT, maxBuffer: 64 * 1024 * 1024 }
  );
  return JSON.parse(output.toString());
}

function readLockfileVersion(pkgPath) {
  const lock = JSON.parse(
    fs.readFileSync(path.join(REPO_ROOT, 'package-lock.json'), 'utf8')
  );
  return lock.packages?.[pkgPath]?.version || null;
}

const versionResolvers = {
  'sass-embedded': () => readLockfileVersion('node_modules/sass-embedded'),
};

function buildStorybookSbom(annex, version) {
  const sbom = {
    $schema: 'http://cyclonedx.org/schema/bom-1.5.schema.json',
    bomFormat: 'CycloneDX',
    specVersion: '1.5',
    serialNumber: `urn:uuid:${crypto.randomUUID()}`,
    version: 1,
    metadata: {
      timestamp: new Date().toISOString(),
      tools: [],
      component: {
        'bom-ref': `civictheme-uikit-storybook@${version}`,
        type: 'application',
        name: 'civictheme-uikit-storybook',
        version,
        description:
          'Static SDC Storybook deployed to GitHub Pages. Contains vendored runtime assets only; the bundled Storybook build subset of devDependencies is intentionally not enumerated - see docs/sbom.md.',
      },
    },
    components: [
      {
        'bom-ref': `@dta-au/designsystem-sdc@${version}`,
        type: 'library',
        group: '@dta-au',
        name: 'civictheme-uikit',
        version,
        purl: `pkg:npm/%40dta-au/civictheme-uikit@${version}`,
      },
      {
        'bom-ref': `@dta-au/designsystem-twig@${version}`,
        type: 'library',
        group: '@dta-au',
        name: 'civictheme-twig',
        version,
        purl: `pkg:npm/%40dta-au/civictheme-twig@${version}`,
      },
    ],
    dependencies: [],
  };
  const warnings = mergeAnnex(sbom, annex, 'storybook');
  return { sbom, warnings };
}

function parseArgs(argv) {
  const args = { out: '.logs/sbom', target: 'all', version: null };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--out') args.out = argv[(i += 1)];
    else if (argv[i] === '--target') args.target = argv[(i += 1)];
    else if (argv[i] === '--version') args.version = argv[(i += 1)];
    else {
      console.error(`${colors.red}Unknown argument: ${argv[i]}${colors.reset}`);
      process.exit(1);
    }
  }
  if (args.version) args.version = args.version.replace(/^v/, '');
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const outDir = path.resolve(REPO_ROOT, args.out);
  fs.mkdirSync(outDir, { recursive: true });

  const scriptVersion = JSON.parse(
    fs.readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8')
  ).version;
  const rawAnnex = JSON.parse(fs.readFileSync(ANNEX_PATH, 'utf8'));
  const { annex, warnings } = resolveAnnexVersions(rawAnnex, versionResolvers);

  const wantDev = args.target === 'all' || args.target === 'dev';
  const wantDist = args.target === 'all' || args.target === 'dist';
  const wantStorybook = args.target === 'all' || args.target === 'storybook';
  const written = [];

  if (wantDev) {
    const sbom = runNpmSbom('');
    warnings.push(...mergeAnnex(sbom, annex, 'dev'));
    appendToolEntry(sbom, scriptVersion);
    const file = path.join(outDir, 'uikit-dev.cdx.json');
    fs.writeFileSync(file, `${JSON.stringify(sbom, null, 2)}\n`);
    written.push(file);
  }

  const distTargets = [
    ['packages/sdc', '@dta-au/designsystem-sdc', 'uikit-dist-sdc.cdx.json', 'dist-sdc'],
    ['packages/twig', '@dta-au/designsystem-twig', 'uikit-dist-twig.cdx.json', 'dist-twig'],
  ];
  let releaseVersion = args.version;
  if (wantDist) {
    for (const [workspace, pkgName, filename, target] of distTargets) {
      const sbom = runNpmSbom(`--omit dev --workspace ${workspace}`);
      promoteWorkspaceComponent(sbom, pkgName);
      pruneUnreachableComponents(sbom);
      if (args.version) stampVersion(sbom, args.version);
      releaseVersion = releaseVersion || sbom.metadata.component.version;
      warnings.push(...mergeAnnex(sbom, annex, target));
      appendToolEntry(sbom, scriptVersion);
      const file = path.join(outDir, filename);
      fs.writeFileSync(file, `${JSON.stringify(sbom, null, 2)}\n`);
      written.push(file);
    }
  }

  if (wantStorybook) {
    if (!releaseVersion) {
      releaseVersion = JSON.parse(
        fs.readFileSync(path.join(REPO_ROOT, 'packages/sdc/package.json'), 'utf8')
      ).version;
    }
    const { sbom, warnings: sbWarnings } = buildStorybookSbom(annex, releaseVersion);
    warnings.push(...sbWarnings);
    appendToolEntry(sbom, scriptVersion);
    const file = path.join(outDir, 'uikit-storybook.cdx.json');
    fs.writeFileSync(file, `${JSON.stringify(sbom, null, 2)}\n`);
    written.push(file);
  }

  for (const warning of warnings) {
    console.warn(`${colors.yellow}WARN: ${warning}${colors.reset}`);
  }
  for (const file of written) {
    console.log(`${colors.green}Wrote ${path.relative(REPO_ROOT, file)}${colors.reset}`);
  }
}

if (process.argv[1] === __filename) {
  main();
}
