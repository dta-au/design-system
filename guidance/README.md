# Authoring content for the design library

Docs under `guidance/` and the co-located component `.md` twins are consumed by the design library site from the `docs-live` ref. CI gates structure (`validate-content-md`); the semantic contract below is validated at the consumer build – a violation stops the site updating, it never breaks the live site.

## Frontmatter

Every doc:

- `title` – required.
- `description` – required; one sentence, shown on index cards and below the page title.

Component docs (twins and `guidance/components/`):

- `component-type` – one of `Content`, `Data`, `Forms`, `Layout`, `Navigation`; drives the catalogue index.
- `rendered-by` – list of `packages/sdc/components/` paths implementing the doc's subject; `[]` means native HTML or not yet built. Mappings are living, not canonical.
- `requires-cms-config: true` – routes the doc to the advanced catalogue (components that need site-builder configuration beyond content entry).

Any doc:

- `toc: true` – inserts an 'On this page' table of contents below the introduction and renders the page full width. Foundations pages default to true; opt out with `toc: false`.
- `toc-max-level` – integer 2 to 4 (default 2); the deepest heading level the table of contents lists. Raise it only where sub-headings are navigation targets in their own right.

## Body

- No H1 – the site renders the title. Start at H2.
- No `import` statements, no JSX – the gate rejects them. Storybook needs live in the `.mdx` shim beside each twin, never in the `.md`.
- Links may target site routes (`/components/…`, `/patterns/…`); Storybook renders them as plain text.
- Never embed demo markup. Demos are a consumer concern – a component page shows one when the site holds a matching demo file for its slug.

## Naming

Slug = filename. Component-doc filenames must be unique across `packages/sdc/components/**` and `guidance/components/` together – a collision fails the consumer sync.
