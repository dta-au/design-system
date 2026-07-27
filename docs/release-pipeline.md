# Releasing the DTA CivicTheme UIKit

How a tag push turns into published packages, a deployed Storybook, and a refreshed docs site. Applies to `@dta-au/designsystem-sdc` and `@dta-au/designsystem-twig`.

## Hub model

The UIKit repo is the hub. One monorepo (root is `private`) publishes two packages:

- **`@dta-au/designsystem-sdc`** (`packages/sdc/`) is the source of truth. Drupal's SDC plugin consumes its `.component.yml` + twig + per-component CSS directly; it ships per-component CSS, not a monolithic stylesheet.
- **`@dta-au/designsystem-twig`** (`packages/twig/`) is the Drupal-agnostic derivative. Its build emits the monolithic `civictheme.css`, so non-Drupal consumers render from it.

Both publish from the same tag at the same version. The interim hub is the fork `dta-au/design-system` (with `upstream` = `civictheme/uikit`); the canonical repo will become `dta-au/design-system`. Storybook deploys to GitHub Pages and the docs site (`JamesFehon-DTA/dga-dl`) is notified by `repository_dispatch`.

## npm name as the abstraction

Consumers pin npm names, never the GitHub repository. aga4 tracks `@dta-au/designsystem-sdc` at `1.13.x`, bdga at `1.12.x`, and dga-dl pins `@dta-au/designsystem-twig` at an exact version.

Because the names are the contract, moving from the fork to `dta-au/design-system` is invisible downstream. The migration changes only the npm provenance source and where the `NPM_TOKEN` / `DISPATCH_PAT` secrets live. Provenance requires `package.json` `repository` to match the publishing repo case-sensitively, so that field is repointed at migration time, but no consumer reads it.

## DTA-owned release lines

DTA owns the line and cuts its own tags and releases. It tracks the upstream CivicTheme **major.minor** it is based on (so `1.13.x` genuinely means "the CivicTheme 1.13 line", which is what aga4 and bdga expect) and owns the **patch**. Upstream is pulled in by merging `upstream` periodically, not by branching per patch.

| Branch | Role | Tags | Consumers |
|---|---|---|---|
| `main` | current DTA line (CivicTheme 1.13 base) | `v1.13.0`, `v1.13.1`, … | aga4 (`1.13.x`), dga-dl (exact) |
| `dta-1.12` | maintenance line (CivicTheme 1.12 base) | `v1.12.3`, `v1.12.4`, … | bdga (`1.12.x`) |

When CivicTheme 1.14 lands upstream, branch `dta-1.13` off `main` to freeze the old line, then move `main` to 1.14.

Versions are plain semver with no prerelease suffix. A `-dta.N` prerelease would be excluded from range pins (npm does not match `1.13.0-dta.1` against `1.13.x`), so the pins would silently fail to resolve. The `@dta-au` scope and the provenance attestation already mark a build as DTA's; the upstream CivicTheme version a release tracks is recorded in release notes, not in the version string.

`LATEST_LINE` (a workflow env var, currently `1.13`) owns the npm `latest` dist-tag, the published Storybook, and the docs dispatch. Other lines publish under `--tag maintenance-<line>` (e.g. `maintenance-1.12`) and do not move the live Storybook or the docs pin. Range pins ignore dist-tags, so `1.12.x` and `1.13.x` resolve correctly regardless.

bdga currently sits in a mixed 1.8.2 / 1.12.2 state and does not pin cleanly to one line. That is unresolved: either consolidate bdga onto 1.12 first, or let it track the `dta-1.12` line and leave the 1.8.2 parts unmanaged.

## Tag to publish flow

`.github/workflows/release.yml` triggers on `push: tags: ['v*']`:

1. Derive `VERSION` from the tag (`v1.13.2` -> `1.13.2`) and the dist-tag from `LATEST_LINE`.
2. `npm ci`, set both workspace versions from the tag, `npm run dist`.
3. Publish each package with `--provenance --access public --tag <dist-tag>` (provenance needs `id-token: write` and the matching `repository` field).
4. Current line only: build the SDC Storybook and deploy to GitHub Pages.
5. Current line only: `repository_dispatch` (`uikit-released`, payload `version`) to `JamesFehon-DTA/dga-dl`.

The dga-dl receiver (`astro.yml`) handles the dispatch by bumping its exact `@dta-au/designsystem-twig` pin to the dispatched version, re-syncing the package's `dist/` assets into `public/`, committing the pin back with `[skip ci]`, then building and deploying. The committed pin is the source of truth, so docs never drift from components.

To cut a release: check out the line branch (`main` for 1.13, `dta-1.12` for 1.12), confirm `package-lock.json` matches the `@dta-au` package names, then `git tag v1.13.1 && git push origin v1.13.1`.

First-time setup on the fork: enable Actions (a new fork disables all workflows until the owner confirms in the Actions tab), enable Pages on both repos, regenerate `package-lock.json` for the renamed packages, and provision `NPM_TOKEN` (granular, publish-only) and `DISPATCH_PAT` (fine-grained, Contents: read and write on dga-dl). The first publish bootstraps dga-dl's dependency; until then its sync script no-ops. Pinned actions: `actions/checkout@v6`, `actions/setup-node@v6`, `actions/upload-pages-artifact@v5`, `actions/deploy-pages@v5`.
