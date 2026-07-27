import { defineConfig } from 'vite';
import { resolve } from 'path';
import twig from 'vite-plugin-twig-drupal';
import sdcPlugin from './.storybook/sdc-plugin.js';

const componentDir = resolve(import.meta.dirname, './components');

export default defineConfig(({ mode }) => ({
  // drupal-twig-extensions deep-imports locutus with a .js extension, which
  // locutus 3's exports map rewrites to date.js.js, and default-imports a now
  // named-only export. The shim fixes both; drop with drupal-twig-extensions#63.
  resolve: {
    alias: [
      {
        find: /^locutus\/php\/datetime\/date\.js$/,
        replacement: resolve(import.meta.dirname, '../../tools/vite/locutus-php-date.js'),
      },
    ],
  },
  plugins: [
    twig({
      namespaces: {
        civictheme: componentDir,
      },
    }),
    sdcPlugin({ path: componentDir }),
    // This plugin allow watching files in the ./dist folder.
    {
      name: 'watch-dist',
      configureServer: (server) => {
        server.watcher.options = {
          ...server.watcher.options,
          ignored: [
            '**/.git/**',
            '**/node_modules.logs/**',
          ]
        }
      }
    }
  ],
}));
