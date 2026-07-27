// Bundles CivicTheme component behaviours into classic-safe runtime entries.
//
// Replaces the hand-rolled text concat build.js used for JS: a virtual entry
// imports every behaviour file through Rollup, so an ESM source resolves as a
// real module instead of corrupting the bundle. Classic behaviour files –
// plain scripts written to run inside a wrapper – are wrapped into
// `export default function () { <body> }` by the load hook, preserving their
// paste-in semantics exactly. A behaviour authored as ESM (top-level
// import/export) must `export default` its init function and is imported
// natively, with its own imports resolved by the bundler.
//
// The generated entry registers behaviours per environment at load time:
// - Drupal present: one `Drupal.behaviors.civictheme_<name>` per behaviour.
// - Otherwise: run all behaviours on DOMContentLoaded, again on synthetic
//   re-dispatch, and immediately if the DOM is already parsed.
// The bundle exports attach() (window.CivicTheme.attach in the IIFE build) so
// consumers can re-run behaviours over injected DOM. Each behaviour is
// isolated in try/catch – one failure no longer kills the whole bundle.

import fs from 'node:fs'
import path from 'node:path'
import { globSync } from 'glob'

const VIRTUAL_ID = 'virtual:civictheme-runtime'
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`
const BEHAVIOUR_SUFFIX = '?civictheme-behaviour'

export const RUNTIME_ENTRY = VIRTUAL_ID

export const RUNTIME_BANNER = [
  '// phpcs:ignoreFile',
  '/**',
  ' * This file was automatically generated. Please run `npm run dist` to update.',
  ' */',
].join('\n')

// Top-level import/export means the file is a real module.
const isEsm = (source) => /^[ \t]*(import|export)[ \t{*'"]/m.test(source)

const behaviourName = (file) => `civictheme_${path.basename(file, '.js').replace(/-/g, '_')}`

function entryCode(files) {
  const imports = files
    .map((file, i) => `import init${i} from ${JSON.stringify(file + BEHAVIOUR_SUFFIX)}`)
    .join('\n')
  const entries = files
    .map((file, i) => `  ${behaviourName(file)}: init${i},`)
    .join('\n')

  return `import * as Popper from '@popperjs/core'

${imports}

export const behaviours = {
${entries}
}

export function attach() {
  Object.entries(behaviours).forEach(([name, init]) => {
    try {
      init()
    } catch (error) {
      console.error('CivicTheme behaviour ' + name + ' failed to attach.', error)
    }
  })
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // Tooltip reads Popper from the window global.
  if (!window.Popper) {
    window.Popper = Popper
  }

  if (typeof window.Drupal !== 'undefined' && window.Drupal.behaviors) {
    Object.entries(behaviours).forEach(([name, init]) => {
      window.Drupal.behaviors[name] = { attach: init }
    })
  } else {
    document.addEventListener('DOMContentLoaded', attach)
    if (document.readyState !== 'loading') {
      attach()
    }
  }
}
`
}

export default function civicthemeRuntime({ componentsDir, include, aliases = {} }) {
  const files = include
    .flatMap((pattern) => globSync(pattern, { cwd: componentsDir, absolute: true }))
    .sort()

  if (files.length === 0) {
    throw new Error(`civictheme-runtime: no behaviour files matched in ${componentsDir}`)
  }

  return {
    name: 'civictheme-runtime',

    resolveId(id) {
      if (id === VIRTUAL_ID) {
        return RESOLVED_VIRTUAL_ID
      }
      if (id.endsWith(BEHAVIOUR_SUFFIX)) {
        return id
      }
      return null
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_ID) {
        return entryCode(files)
      }
      if (id.endsWith(BEHAVIOUR_SUFFIX)) {
        const file = id.slice(0, -BEHAVIOUR_SUFFIX.length)
        const source = fs.readFileSync(file, 'utf-8')
        if (isEsm(source)) {
          return `export { default } from ${JSON.stringify(file)}\n`
        }
        return `export default function () {\n${source}\n}\n`
      }
      return null
    },

    // Prepend the generated-file banner (Vite's app-mode build does not apply
    // rollup output.banner), then emit byte-identical copies under legacy
    // filenames so existing consumer paths keep resolving
    // (e.g. civictheme.storybook.js).
    writeBundle(options, bundle) {
      Object.values(bundle).forEach((output) => {
        if (output.type !== 'chunk') {
          return
        }
        const file = path.join(options.dir, output.fileName)
        const code = fs.readFileSync(file, 'utf-8')
        if (!code.startsWith(RUNTIME_BANNER)) {
          fs.writeFileSync(file, `${RUNTIME_BANNER}\n${code}`, 'utf-8')
        }
      })
      Object.entries(aliases).forEach(([source, copies]) => {
        if (!bundle[source]) {
          return
        }
        copies.forEach((copy) => {
          fs.copyFileSync(path.join(options.dir, source), path.join(options.dir, copy))
        })
      })
    },
  }
}
