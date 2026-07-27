import '../dist/civictheme.stories.css?module';
import '../dist/civictheme.base.storybook.css';
import '../dist/civictheme.variables.css';
import '../dist/civictheme.base';
import { useEffect, useChannel } from 'storybook/preview-api';
import { format } from 'prettier/standalone';
import htmlPlugin from 'prettier/plugins/html';
import { decoratorDocs } from '../components/00-base/storybook/storybook.docs.utils';
import collapsibleSource from '../components/00-base/collapsible/collapsible.js?raw';
import flyoutSource from '../components/00-base/flyout/flyout.js?raw';
import scrollspySource from '../components/00-base/scrollspy/scrollspy.js?raw';

const ADDON_EVENT = 'storybook/html/codeUpdate';

// CivicTheme behaviours self-initialise at module scope - dist/civictheme.base
// runs `querySelectorAll('[data-collapsible]')` and friends once, as it
// evaluates, which is before any story has rendered. Stories with a small
// module graph happen to win that race; one that imports a chart (~130KB of
// chart.js) renders after it and gets no behaviours, so its menus never open.
// Charts themselves are immune because chart.js ships its own static-page
// driver that re-attaches on DOM mutation; these base utilities have none.
//
// Re-run them after each story renders. They are pulled in as source text
// (`?raw`) and re-executed, because neither import form re-initialises: the
// dist bundle is a static asset, so re-importing it is a cache hit that
// evaluates nothing, and a cache-busted source import resolves only under the
// dev server - in a static build there is no /components path to fetch.
// `?raw` is statically analysable, so the text is bundled and this behaves the
// same in `storybook dev` and `build-storybook`.
//
// Only the three behaviours that bail when their element is already
// initialised are listed, so re-running is idempotent; the unguarded ones
// would bind duplicate listeners. All three are plain scripts with no
// import/export, so re-executing the body is equivalent to re-evaluating the
// module. This is Storybook-only glue - the components stay untouched.
const BEHAVIOUR_SOURCES = [
  collapsibleSource,
  flyoutSource,
  scrollspySource,
];

const withBehaviours = (storyFn) => {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      BEHAVIOUR_SOURCES.forEach((source) => {
        new Function(source)();
      });
    }, 0);

    return () => window.clearTimeout(timer);
  });

  return storyFn();
};

const withHTML = (storyFn, context) => {
  const emit = useChannel({});
  const parameters = context.parameters?.html || {};

  useEffect(() => {
    if (parameters.disable) return undefined;

    const timer = window.setTimeout(async () => {
      const root = context.canvasElement || document.querySelector('#storybook-root, #root');
      if (!root) return;

      let code = root.innerHTML || '';
      if (!code) return;

      try {
        code = await format(code, {
          parser: 'html',
          plugins: [htmlPlugin],
          htmlWhitespaceSensitivity: 'ignore',
        });
      } catch (e) {
        // Use unformatted HTML if prettier fails.
      }

      emit(ADDON_EVENT, { code, options: parameters });
    }, 0);

    return () => window.clearTimeout(timer);
  });

  return storyFn();
};

export default {
  // Autodocs Docs page per component, from its CSF meta + argTypes.
  tags: ['autodocs'],
  decorators: [withHTML, withBehaviours, decoratorDocs],
  parameters: {
    a11y: {
      // axe blocks 100-500ms per story; don't auto-run on every story.
      // Use the Accessibility panel's "Run audit" button instead.
      manual: true,
    },
    backgrounds: {
      options: {
        white: {
          name: 'White',
          value: '#ffffff',
        },

        light: {
          name: 'Light',
          value: '#f2f4f5',
        },

        dark: {
          name: 'Dark',
          value: '#003f56',
        },
      },
    },
    viewport: {
      options: {
        xs: {
          name: 'XS',
          styles: {
            width: '368px',
            height: '568px',
          },
          type: 'mobile',
        },
        s: {
          name: 'S',
          styles: {
            width: '576px',
            height: '896px',
          },
          type: 'mobile',
        },
        m: {
          name: 'M',
          styles: {
            width: '768px',
            height: '1112px',
          },
          type: 'tablet',
        },
        l: {
          name: 'L',
          styles: {
            width: '992px',
            height: '1112px',
          },
          type: 'desktop',
        },
        xl: {
          name: 'XL',
          styles: {
            width: '1280px',
            height: '1024px',
          },
          type: 'desktop',
        },
        xxl: {
          name: 'XXL',
          styles: {
            width: '1440px',
            height: '900px',
          },
          type: 'desktop',
        },
      },
    },
    options: {
      storySort: {
        order: [
          'Welcome',
          'About CivicTheme',
          'Base',
          [
            'Colors',
            'Fonts',
            'Typography',
            'Icon',
            'Background',
            'Elevation',
            'Grid',
            'Layout',
            'Spacing',
            'Item List',
            'Utilities',
            'Storybook',
            [
              'Overview',
              '*',
            ],
          ],
          '*',
          'Atoms',
          [
            'Chip',
            'Content Link',
            'Heading',
            'Iframe',
            'Image',
            'Form Controls',
          ],
          '*',
          'Molecules',
          [
            'Accordion',
            'Attachment',
            'Back To Top',
            'Basic Content',
            'Breadcrumb',
            'Callout',
            'Field',
            'Figure',
            'List',
            [
              'Single Filter',
              'Group Filter',
              'Pagination',
              '*',
              'Snippet',
            ],
            '*',
          ],
          '*',
          'Organisms',
          '*',
          'Templates',
          '*',
        ],
      },
    },
    html: {
      prettier: {
        tabWidth: 4,
        useTabs: false,
        htmlWhitespaceSensitivity: 'strict',
      },
    },
  },

  initialGlobals: {
    backgrounds: {
      value: 'white',
    },
  },
};
