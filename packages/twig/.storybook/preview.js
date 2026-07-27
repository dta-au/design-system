import '../dist/civictheme.storybook.css';
import '../dist/civictheme.storybook';
import '../dist/civictheme.stories.css?module';

// Ensure font-family is inherited by form elements and body, which browsers
// don't inherit from html by default. Uses the CivicTheme CSS variable so it
// stays in sync with whatever theme is active.
(function () {
  const style = document.createElement('style');
  style.textContent = 'body, button, input, select, textarea, label { font-family: var(--ct-typography-text-regular-font-name, "Lexend", sans-serif); }';
  document.head.appendChild(style);
}());
import { useEffect, useChannel } from 'storybook/preview-api';
import { format } from 'prettier/standalone';
import htmlPlugin from 'prettier/plugins/html';
import { decoratorDocs } from '../components/00-base/storybook/storybook.docs.utils';

const ADDON_EVENT = 'storybook/html/codeUpdate';

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
  decorators: [withHTML, decoratorDocs],
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
