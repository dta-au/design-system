<h1 align="center">DTA design system</h1>

<div align="center">

[![GitHub Issues](https://img.shields.io/github/issues/dta-au/design-system.svg)](https://github.com/dta-au/design-system/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/dta-au/design-system.svg)](https://github.com/dta-au/design-system/pulls)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/dta-au/design-system)
[![Test](https://github.com/dta-au/design-system/actions/workflows/test.yml/badge.svg)](https://github.com/dta-au/design-system/actions/workflows/test.yml)
![LICENSE](https://img.shields.io/github/license/dta-au/design-system)
[![RenovateBot](https://img.shields.io/badge/RenovateBot-enabled-brightgreen.svg?logo=renovatebot)](https://renovatebot.com)

</div>

<p align="center">The digital.gov.au component library and Storybook, built on the CivicTheme UI Kit</p>
<p align="center"><a href="https://dta-au.github.io/design-system/">https://dta-au.github.io/design-system/</a></p>

----

## Features

- Atomic design
- Accessible
- Platform-agnostic
- Integrated with Drupal: https://www.drupal.org/project/civictheme

## Installing

```bash
npm install @dta-au/designsystem-sdc
```

or, for the Twig variant:

```bash
npm install @dta-au/designsystem-twig
```

or download the latest release from [GitHub](https://github.com/dta-au/design-system/releases).

## Contributing

Contributions are welcome!

If a specific change is being proposed (either a new feature or a bug fix), you
can [create an issue](https://github.com/dta-au/design-system/issues/new) documenting the proposed
change.

## Maintenance

### Updating minor dependencies

```bash
npm install -g npm-check-updates
npx npm-check-updates -u --target minor
```

### Pre-release build

Tag releases deploy the SDC Storybook to https://dta-au.github.io/design-system/ via GitHub Pages. See [release pipeline](docs/release-pipeline.md) for the full flow, and [SBOM](docs/sbom.md) for the supply-chain gate.

### Build assets

    npm run build

This will build:

- CSS and JS assets in the `dist` directory. These files can be included
  directly into your HTML page, provided that it has components implemented with
  the same markup as components in the `components` directory.
- Storybook assets as compiled HTML page in the `storybook-static` directory.
  These files can be served publicly to show all components available in the
  library.

### Updating components

Components schema for both `components/twig` and `components/sdc` directories is
maintained in the `*.component.yml` files within `components/sdc` directory.
The schema is strict and allows to be a source of truth for the components.

We currently synchronize the entire component implementation between SDC and Twig components,
not just the docblock headers. This includes proper namespace handling, converting
`civictheme:` namespaces to path-based references like `@atoms/button/button.twig`.

To update components, run:

```bash
npm run components:update       # Update all components
npm run components:update:sdc   # Update only SDC components
npm run components:update:twig  # Update only Twig components
```

If you only want to update the docblock headers (for when SDC and Twig implementations diverge in the future):

```bash
npm run components:update:twig:headers  # Update only Twig component headers
```

To check that components are up to date without making any changes (useful for CI/CD), run:

```bash
npm run components:check       # Check all components
npm run components:check:sdc   # Check only SDC components
npm run components:check:twig  # Check only Twig components
npm run components:check:twig:headers  # Check only Twig component headers
```

The `components:update` command reads the YAML schema from component definition files and
synchronizes the full component implementation, ensuring consistency across SDC and Twig components.
The `components:check` command verifies this consistency without making changes, exiting with
a non-zero status if any component needs updating.

> Note: If the SDC and Twig implementations significantly diverge in the future, we will switch
> to only updating the docblock headers rather than the entire component.

#### Validating SDC schema

See `tools/sdc/README.md` for more information on how to validate the SDC schema.

### Check and fix code style

    npm run lint

    npm run lint-fix

### Husky Pre-commit Hooks

Husky automatically runs quality checks before each commit to ensure code quality and consistency. It tests that both SDC and Twig libraries are up to date and have no lint or test errors.

If you need to bypass these checks (e.g., for emergency fixes or when working on experimental features), you can skip Husky by running:

```bash
HUSKY=0 git push
```

or

```bash
git push --no-verify
```

**Note:** Only bypass Husky when absolutely necessary, as these checks help maintain code quality across the project.

### Run Storybook for development

    npm run dev

### Run Storybook after build

    npm run storybook

## Releasing

Push a `v`-prefixed tag (e.g. `v1.0.0`) and the Release workflow publishes
`@dta-au/designsystem-sdc` and `@dta-au/designsystem-twig` to npm with
provenance, deploys the Storybook to GitHub Pages, and notifies the docs
site. See [release pipeline](docs/release-pipeline.md).
