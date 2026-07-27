# Software bill of materials

Every release publishes CycloneDX SBOMs and every dependency change is gated
by a vulnerability scan. Generation is lockfile-derived plus a manual annex
for the components npm cannot see.

## What is generated

| File | Scope | Destination |
| --- | --- | --- |
| `uikit-dev.cdx.json` | Full dev graph – everything `npm ci` installs, plus Chrome-for-testing, Dart Sass and git-override annotations | CI artifact; attached to releases |
| `uikit-dist-sdc.cdx.json` | Published `@dta-au/designsystem-sdc` surface – `@popperjs/core` plus bundled fonts | Attached to releases |
| `uikit-dist-twig.cdx.json` | Published `@dta-au/designsystem-twig` surface | Attached to releases |
| `uikit-storybook.cdx.json` | Deployed Storybook site – vendored D3/d3-sankey plus the two packages | Attached to releases |

The storybook SBOM deliberately lists only the vendored runtime assets and the
two packages, not the dev graph: the static build bundles an unenumerable
subset of devDependencies, and publishing the full graph as "the deployed
site" would flood consumers with findings for code that never reaches the
bundle. The dev SBOM is the superset for anyone auditing the build
environment.

## Regenerate locally

```bash
npm run sbom          # all four, written to .logs/sbom/
npm run sbom:dist     # just the two package SBOMs
```

Requires `npm ci` first. Output is never committed.

## How scanning gates CI and releases

`.github/workflows/sbom.yml` runs on any PR touching the lockfile, manifests,
annex or itself, and as a `workflow_call` gate inside `release.yml` before
`npm publish`. Grype scans `uikit-dev.cdx.json` and fails the build on
high-or-critical findings that have a fix available. Syft generates an
independent cross-check SBOM in the same run.

Fix-less advisories are intentionally outside the gate (`only-fixed`) –
Renovate `vulnerabilityAlerts` remains the channel for those.

The anchore actions are pinned by commit SHA, not tag. Scanners run with CI
credentials and are themselves supply-chain targets; when bumping, resolve the
new tag to a commit and update the `# vX.Y.Z` comment.

## Adding a suppression

Add an entry to `.grype.yaml` with a comment stating why the finding is a
false positive or accepted risk, who assessed it, and a revisit date:

```yaml
ignore:
  # False positive: CVE applies to the server component, we ship client only.
  # Assessed jfehon 2026-07-04, revisit 2026-10-01.
  - vulnerability: CVE-2026-XXXXX
    package:
      name: example-package
```

## When to edit the annex

`tools/sbom/components.annex.json` declares components invisible to
`npm sbom`. Update it when:

- the vendored D3 or d3-sankey files change version – edit the version and purl
- bundled fonts change – edit the font entries
- a new vendored asset or native binary enters the repo – add an entry with
  the right `targets`

Bumping `sass-embedded` needs no annex change – its binary version resolves
at generation time.

## Calling the workflow from another repo

```yaml
jobs:
  sbom:
    uses: dta-au/design-system/.github/workflows/sbom.yml@main
    with:
      fail-severity: high
```

Caveat: the `generate` job runs this repo's generator script, so external
callers get meaningful results from the syft and grype jobs only. Consuming
sites (dga-dl) should generate their own lockfile-derived SBOM and reuse the
scan pattern.
