# Releasing the design system

How a tag push turns into published packages, a deployed Storybook, and a refreshed docs site. Applies to `@dta-au/designsystem-sdc` and `@dta-au/designsystem-twig`.

## Hub model

The design system repo is the hub. One monorepo (root is `private`) publishes two packages:

- **`@dta-au/designsystem-sdc`** (`packages/sdc/`) is the source of truth. Drupal's SDC plugin consumes its `.component.yml` + twig + per-component CSS directly; it ships per-component CSS, not a monolithic stylesheet.
- **`@dta-au/designsystem-twig`** (`packages/twig/`) is the Drupal-agnostic derivative. Its build emits the monolithic `civictheme.css`, so non-Drupal consumers render from it.

Both publish from the same tag at the same version. The canonical repo is `dta-au/design-system`. Its history was seeded fresh, so `origin` is the only remote – there is no `upstream` remote and no cherry-pick channel from `civictheme/uikit`. Storybook deploys to GitHub Pages and the docs site (`dta-au/design-system-docs`) is notified by `repository_dispatch`.

## npm name as the abstraction

Consumers pin npm names, never the GitHub repository. Two pinning styles are in use:

- **Exact pin.** `design-system-docs` pins `@dta-au/designsystem-twig` with `--save-exact`. A bump there is either a deliberate edit or the automated one described below.
- **Range pin.** A consumer that tracks a line pins `1.0.x`. Range pins ignore dist-tags, so they resolve correctly whichever line owns `latest`.

Not every downstream consumes npm. aga4 vendors its own `themes/civictheme/` copy, so a release here never reaches it – that port is manual.

Because the names are the contract, the move to `dta-au/design-system` was invisible downstream. Provenance requires the `package.json` `repository` field to match the publishing repo case-sensitively, so that field points at `dta-au/design-system`. No consumer reads it.

## Versioning

Versioning is plain semver, decoupled from the CivicTheme base. The 1.0 line starts at the design system rename. There is no upstream major.minor to track and no maintenance branch. `main` is the only line, and every tag is cut from it.

Versions carry no prerelease suffix. A `-dta.N` suffix would be excluded from range pins (npm does not match `1.0.0-dta.1` against `1.0.x`), so the pins would silently fail to resolve. The `@dta-au` scope and the provenance attestation already mark a build as DTA's.

`LATEST_LINE` (a workflow env var, currently `1.0`) owns the npm `latest` dist-tag, the published Storybook, and the docs dispatch. Keep it in sync with the current minor. If a maintenance line is branched later, its tags publish under `--tag maintenance-<line>` and do not move the live Storybook or the docs pin. No maintenance line exists today.

## Tag to publish flow

`.github/workflows/release.yml` triggers on `push: tags: ['v*']`:

1. Pre-publish gate: `sbom.yml` generates the SBOMs and fails the release on high or above fixable vulnerabilities. Nothing publishes until it passes.
2. Derive `VERSION` from the tag (`v1.0.2` -> `1.0.2`) and the dist-tag from `LATEST_LINE`.
3. `npm ci`, set both workspace versions from the tag, `npm run dist`.
4. Publish each package with `--provenance --access public --tag <dist-tag>` (provenance needs `id-token: write` and the matching `repository` field).
5. Current line only: build the SDC Storybook and deploy to GitHub Pages.
6. Current line only: `repository_dispatch` (`uikit-released`, payload `version`, `npm_tag` and `package`) to `dta-au/design-system-docs`.
7. Create the GitHub release if it does not exist, then attach the SBOMs. Release-drafter is config-only and creates no release object.

Step 3 sets the versions in the CI checkout only. `npm version --no-git-tag-version` never commits the change back, so the committed `package.json` files stay at their last hand-set value while npm serves the tagged version. Manifests reading `1.0.0` against a published `1.0.1` is the designed steady state, not drift. Do not hand-bump them to match. The root package is `private` and never publishes.

The design-system-docs receiver (`astro.yml`) handles the dispatch by bumping its exact `@dta-au/designsystem-twig` pin to the dispatched version, re-syncing the package's `dist/` assets into `public/`, committing the pin back with `[skip ci]`, then building and deploying. The committed pin is the source of truth, so docs never drift from components.

To cut a release, confirm `package-lock.json` matches the `@dta-au` package names. Then tag `main` and push the tag:

```bash
git tag v1.0.2 && git push origin v1.0.2
```

Publishing auth: both packages use npm **trusted publishing (OIDC)**, configured per package on npmjs.com. There is no `NPM_TOKEN` secret – `release.yml` only needs `id-token: write` plus a `repository` field matching `dta-au/design-system` exactly. The one secret is `DISPATCH_PAT` (fine-grained, Contents: read and write on `dta-au/design-system-docs`), used for both dispatches. Pinned actions: `actions/checkout@v6`, `actions/setup-node@v6`, `actions/upload-pages-artifact@v5`, `actions/deploy-pages@v5`.
