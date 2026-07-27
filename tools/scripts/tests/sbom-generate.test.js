#!/usr/bin/env node

/**
 * Tests for the pure functions in sbom-generate.js: annex target routing,
 * workspace promotion, version resolution and release-version stamping.
 *
 * Standalone runner: node tools/scripts/tests/sbom-generate.test.js
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';
import { mergeAnnex, promoteWorkspaceComponent, pruneUnreachableComponents, resolveAnnexVersions, stampVersion } from '../sbom-generate.js';

// eslint-disable-next-line no-underscore-dangle
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-underscore-dangle
const __dirname = path.dirname(__filename);

const fixturePath = path.join(__dirname, 'fixtures/sbom-dist-sdc.cdx.json');
const loadFixture = () => JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

const testAnnex = {
  components: [
    {
      targets: ['dist-sdc'],
      component: { type: 'file', name: 'arimo-font', version: '0' },
    },
    {
      targets: ['dev'],
      versionFrom: 'fake-tool',
      component: {
        type: 'application',
        name: 'fake-tool',
        purl: 'pkg:generic/fake-tool@{version}',
      },
    },
  ],
  annotations: [
    { targets: ['dev'], subjectName: 'fake-tool', text: 'A note.' },
    { targets: ['dev'], subjectName: 'not-present', text: 'Orphan note.' },
  ],
};

let failures = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`  PASS ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`  FAIL ${name}: ${error.message}`);
  }
}

test('resolveAnnexVersions substitutes resolved versions into purl', () => {
  const { annex, warnings } = resolveAnnexVersions(testAnnex, {
    'fake-tool': () => '9.9.9',
  });
  const tool = annex.components.find((e) => e.component.name === 'fake-tool');
  assert.strictEqual(tool.component.version, '9.9.9');
  assert.strictEqual(tool.component.purl, 'pkg:generic/fake-tool@9.9.9');
  assert.strictEqual(warnings.length, 0);
});

test('resolveAnnexVersions degrades to "unknown" with a warning', () => {
  const { annex, warnings } = resolveAnnexVersions(testAnnex, {});
  const tool = annex.components.find((e) => e.component.name === 'fake-tool');
  assert.strictEqual(tool.component.version, 'unknown');
  assert.strictEqual(warnings.length, 1);
});

test('mergeAnnex adds components for the matching target only', () => {
  const sbom = loadFixture();
  const before = sbom.components.length;
  mergeAnnex(sbom, testAnnex, 'dist-sdc');
  assert.strictEqual(sbom.components.length, before + 1);
  const font = sbom.components.find((c) => c.name === 'arimo-font');
  assert.strictEqual(font['bom-ref'], 'arimo-font@0');
  assert.strictEqual(sbom.annotations, undefined);
});

test('mergeAnnex attaches annotations by subject name and warns on orphans', () => {
  const sbom = loadFixture();
  const { annex } = resolveAnnexVersions(testAnnex, { 'fake-tool': () => '1.0.0' });
  const warnings = mergeAnnex(sbom, annex, 'dev');
  assert.strictEqual(sbom.annotations.length, 1);
  assert.deepStrictEqual(sbom.annotations[0].subjects, ['fake-tool@1.0.0']);
  assert.strictEqual(warnings.length, 1);
  assert.match(warnings[0], /not-present/);
});

test('promoteWorkspaceComponent re-roots at the published package', () => {
  const sbom = loadFixture();
  const oldRootRef = sbom.metadata.component['bom-ref'];
  promoteWorkspaceComponent(sbom, '@dta-au/designsystem-sdc');
  const root = sbom.metadata.component;
  assert.strictEqual(root.group, '@dta-au');
  assert.strictEqual(root.name, 'designsystem-sdc');
  assert.ok(root['bom-ref'].startsWith('@dta-au/designsystem-sdc@'));
  // Workspace component left the components list; old root left the graph.
  assert.ok(!sbom.components.some((c) => c['bom-ref'] === root['bom-ref']));
  assert.ok(!sbom.dependencies.some((d) => d.ref === oldRootRef));
  // No dependency entry references a component that no longer exists.
  const refs = new Set([
    root['bom-ref'],
    ...sbom.components.map((c) => c['bom-ref']),
  ]);
  for (const dep of sbom.dependencies) {
    assert.ok(refs.has(dep.ref), `dangling dependency ref ${dep.ref}`);
  }
});

test('pruneUnreachableComponents drops orphan peers of dev dependencies', () => {
  const sbom = loadFixture();
  promoteWorkspaceComponent(sbom, '@dta-au/designsystem-sdc');
  // Simulate the twig@3.0.0 case: present in components/dependencies but
  // not reachable from the root.
  sbom.components.push({
    'bom-ref': 'orphan@1.0.0',
    type: 'library',
    name: 'orphan',
    version: '1.0.0',
    scope: 'optional',
  });
  sbom.dependencies.push({ ref: 'orphan@1.0.0', dependsOn: [] });
  pruneUnreachableComponents(sbom);
  assert.ok(!sbom.components.some((c) => c.name === 'orphan'));
  assert.ok(!sbom.dependencies.some((d) => d.ref === 'orphan@1.0.0'));
  assert.ok(sbom.components.some((c) => c.name === '@popperjs/core'));
});

test('stampVersion rewrites root version, bom-ref, purl and dependency refs', () => {
  const sbom = loadFixture();
  promoteWorkspaceComponent(sbom, '@dta-au/designsystem-sdc');
  stampVersion(sbom, '1.14.1');
  const root = sbom.metadata.component;
  assert.strictEqual(root.version, '1.14.1');
  assert.strictEqual(root['bom-ref'], '@dta-au/designsystem-sdc@1.14.1');
  assert.match(root.purl, /@1\.14\.1$/);
  assert.ok(sbom.dependencies.some((d) => d.ref === root['bom-ref']));
});

if (failures > 0) {
  console.error(`\n${failures} test(s) failed`);
  process.exit(1);
}
console.log('\nAll sbom-generate tests passed');
