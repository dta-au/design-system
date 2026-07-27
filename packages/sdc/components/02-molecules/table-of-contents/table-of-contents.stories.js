/**
 * CivicTheme Table of Contents component stories.
 */

import Component from './table-of-contents.twig';
import BasicContent from '../basic-content/basic-content.twig';

const meta = {
  title: 'Molecules/Table Of Contents',
  component: Component,
  argTypes: {
    theme: {
      control: { type: 'radio' },
      options: ['light', 'dark'],
    },
    heading_level: {
      control: { type: 'number', min: 2, max: 6 },
    },
    is_contained: {
      control: { type: 'boolean' },
    },
    title: {
      control: { type: 'text' },
    },
    position: {
      control: { type: 'radio' },
      options: ['before', 'after', 'prepend', 'append'],
    },
    min_level: {
      control: { type: 'select' },
      options: [2, 3, 4, 5, 6],
    },
    max_level: {
      control: { type: 'select' },
      options: [2, 3, 4, 5, 6],
    },
    anchor_selector: {
      control: { type: 'text' },
    },
    scope_selector: {
      control: { type: 'text' },
    },
    exclude_selector: {
      control: { type: 'text' },
    },
    modifier_class: {
      control: { type: 'text' },
    },
  },
};

export default meta;

// Flat, author-provided links.
const FLAT_LINKS = [
  { title: 'Link 1', url: '#link-1' },
  { title: 'Link 2', url: '#link-2' },
  { title: 'Link 3', url: '#link-3' },
];

// Nested, author-provided links (children render as nested __links).
const NESTED_LINKS = [
  {
    title: 'Overview',
    url: '#overview',
    children: [
      { title: 'Background', url: '#background' },
      { title: 'Scope', url: '#scope' },
    ],
  },
  {
    title: 'Details',
    url: '#details',
    children: [
      { title: 'Method', url: '#method' },
    ],
  },
  { title: 'Summary', url: '#summary' },
];

// Content used by the client-side (JS) generation stories.
const AUTOMATIC_CONTENT = `
  <h2>Getting started</h2>
  <p>Ex cillum irure id occaecat aliquip in cillum aute occaecat ullamco in dolore nulla et veniam sed consectetur ut excepteur eu eiusmod.</p>
  <h3>Before you begin</h3>
  <p>Consectetur veniam exercitation voluptate reprehenderit in esse est magna minim sunt cupidatat reprehenderit ut pariatur cillum.</p>
  <h4>Requirements</h4>
  <p>Est incididunt irure eu elit eiusmod incididunt occaecat labore aute in ad non irure sunt ad ut nostrud commodo.</p>
  <h2>Configuration</h2>
  <p>Nulla sed cupidatat irure quis veniam ut in in pariatur do minim adipisicing minim exercitation magna eiusmod culpa tempor.</p>
  <h3>Options</h3>
  <p>Aliquip in cillum aute occaecat ullamco in dolore nulla et veniam sed consectetur ut excepteur eu eiusmod excepteur.</p>
  <h2>Troubleshooting</h2>
  <p>Est incididunt irure eu elit eiusmod incididunt occaecat labore aute in ad non irure sunt ad ut nostrud commodo do fugiat.</p>
`;

// Content with headings that opt out of the generated list.
const EXCLUDE_CONTENT = `
  <h2>Included section one</h2>
  <p>Ex cillum irure id occaecat aliquip in cillum aute occaecat ullamco in dolore nulla et veniam sed consectetur.</p>
  <h2 data-toc-exclude>Excluded via data-toc-exclude</h2>
  <p>Consectetur veniam exercitation voluptate reprehenderit in esse est magna minim sunt cupidatat reprehenderit ut pariatur.</p>
  <h2 class="no-toc">Excluded via exclude_selector</h2>
  <p>Est incididunt irure eu elit eiusmod incididunt occaecat labore aute in ad non irure sunt ad ut nostrud commodo.</p>
  <h2>Included section two</h2>
  <p>Nulla sed cupidatat irure quis veniam ut in in pariatur do minim adipisicing minim exercitation magna eiusmod culpa.</p>
`;

// Author-provided links (static markup path).

export const TableOfContents = {
  args: {
    theme: 'light',
    is_contained: true,
    title: 'On this page',
    links: FLAT_LINKS,
    position: 'before',
    modifier_class: '',
    attributes: null,
  },
};

export const Nested = {
  args: {
    ...TableOfContents.args,
    links: NESTED_LINKS,
  },
};

export const Dark = {
  args: {
    ...TableOfContents.args,
    theme: 'dark',
    links: NESTED_LINKS,
  },
  globals: {
    backgrounds: { value: 'dark' },
  },
};

// Position variants (static markup path).

export const PositionBefore = {
  args: { ...TableOfContents.args, position: 'before' },
};

export const PositionAfter = {
  args: { ...TableOfContents.args, position: 'after' },
};

export const PositionPrepend = {
  args: { ...TableOfContents.args, position: 'prepend' },
};

export const PositionAppend = {
  args: { ...TableOfContents.args, position: 'append' },
};

// Client-side generation (JS path). The list is built from the headings in the
// scope selector, honouring min/max level and exclusions.

export const Automatic = {
  parameters: {
    layout: 'centered',
  },
  args: {
    theme: 'light',
    title: 'On this page',
    min_level: 2,
    max_level: 3,
    scope_selector: '.ct-basic-content',
    position: 'before',
    content: BasicContent({ content: AUTOMATIC_CONTENT }),
    modifier_class: '',
    attributes: null,
  },
};

export const AutomaticDepthH2Only = {
  parameters: {
    layout: 'centered',
  },
  args: {
    ...Automatic.args,
    min_level: 2,
    max_level: 2,
  },
};

export const AutomaticDepthH2ToH4 = {
  parameters: {
    layout: 'centered',
  },
  args: {
    ...Automatic.args,
    min_level: 2,
    max_level: 4,
  },
};

export const AutomaticWithExclusions = {
  parameters: {
    layout: 'centered',
  },
  args: {
    ...Automatic.args,
    max_level: 2,
    exclude_selector: '.no-toc',
    content: BasicContent({ content: EXCLUDE_CONTENT }),
  },
};

export const AutomaticDark = {
  parameters: {
    layout: 'centered',
  },
  args: {
    ...Automatic.args,
    theme: 'dark',
  },
  globals: {
    backgrounds: { value: 'dark' },
  },
};
