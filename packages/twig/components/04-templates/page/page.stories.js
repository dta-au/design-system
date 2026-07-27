/**
 * digital.gov.au Page Template component stories.
 */

import Component from './page.twig';
import PageData, { PageFullWidthData, PageReviewData, PageAccountData, PageDropdownMenuData } from './page.stories.data';

const meta = {
  title: 'Templates/Page',
  component: Component,
  argTypes: {
    theme: {
      control: { type: 'radio' },
      options: ['light', 'dark'],
    },
    vertical_spacing: {
      control: { type: 'radio' },
      options: ['none', 'top', 'bottom', 'both'],
    },
    header_theme: {
      control: { type: 'radio' },
      options: ['light', 'dark'],
    },
    header_top_1: {
      control: { type: 'text' },
    },
    header_top_2: {
      control: { type: 'text' },
    },
    header_top_3: {
      control: { type: 'text' },
    },
    header_middle_1: {
      control: { type: 'text' },
    },
    header_middle_2: {
      control: { type: 'text' },
    },
    header_middle_3: {
      control: { type: 'text' },
    },
    header_bottom_1: {
      control: { type: 'text' },
    },
    banner: {
      control: { type: 'text' },
    },
    highlighted: {
      control: { type: 'text' },
    },
    content_top: {
      control: { type: 'text' },
    },
    hide_sidebar_left: {
      control: { type: 'boolean' },
    },
    hide_sidebar_right: {
      control: { type: 'boolean' },
    },
    sidebar_top_left: {
      control: { type: 'text' },
    },
    sidebar_top_right: {
      control: { type: 'text' },
    },
    content: {
      control: { type: 'text' },
    },
    sidebar_bottom_left: {
      control: { type: 'text' },
    },
    sidebar: {
      control: { type: 'text' },
    },
    sidebar_bottom_right: {
      control: { type: 'text' },
    },
    content_contained: {
      control: { type: 'boolean' },
    },
    content_bottom: {
      control: { type: 'text' },
    },
    footer_theme: {
      control: { type: 'text' },
    },
    footer_logo: {
      control: { type: 'text' },
    },
    footer_background_image: {
      control: { type: 'text' },
    },
    footer_top_1: {
      control: { type: 'text' },
    },
    footer_top_2: {
      control: { type: 'text' },
    },
    footer_middle_1: {
      control: { type: 'text' },
    },
    footer_middle_2: {
      control: { type: 'text' },
    },
    footer_middle_3: {
      control: { type: 'text' },
    },
    footer_middle_4: {
      control: { type: 'text' },
    },
    footer_bottom_1: {
      control: { type: 'text' },
    },
    footer_bottom_2: {
      control: { type: 'text' },
    },
    modifier_class: {
      control: { type: 'text' },
    },
  },
};

export default meta;

export const Page = {
  parameters: {
    layout: 'fullscreen',
  },
  args: PageData.args('light'),
};

export const PageDark = {
  parameters: {
    layout: 'fullscreen',
  },

  args: PageData.args('dark'),

  globals: {
    backgrounds: {
      value: 'dark',
    },
  },
};

export const PageFullWidth = {
  parameters: {
    layout: 'fullscreen',
  },
  args: PageFullWidthData.args('light'),
};

export const PageSidebar = {
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    // Sidebar layout constrains the main column, so components render with
    // is_contained: false - no nested container, backgrounds fill flush.
    ...PageFullWidthData.args('light', false),
    hide_sidebar_left: false,
    hide_sidebar_right: false,
    sidebar_top_left: PageData.args('light').sidebar_top_left,
  },
};

// Temporary review stories - every component changed by the with_background /
// is_contained / heading_level work, in a real page context. Full-width shows
// the band behaviour (components own their container); sidebar shows the
// nested surface-fill behaviour (is_contained: false throughout). Delete
// these and PageReviewData once the review is complete.
export const PageReviewFullWidth = {
  parameters: {
    layout: 'fullscreen',
  },
  args: PageReviewData.args('light', true),
};

export const PageReviewSidebar = {
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    ...PageReviewData.args('light', false),
    hide_sidebar_left: false,
    hide_sidebar_right: false,
    sidebar_top_left: PageData.args('light').sidebar_top_left,
  },
};

export const PageReviewFullWidthDark = {
  parameters: {
    layout: 'fullscreen',
  },
  args: PageReviewData.args('dark', true),
  globals: {
    backgrounds: { value: 'dark' },
  },
};

export const PageReviewSidebarDark = {
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    ...PageReviewData.args('dark', false),
    hide_sidebar_left: false,
    hide_sidebar_right: false,
    sidebar_top_left: PageData.args('dark').sidebar_top_left,
  },
  globals: {
    backgrounds: { value: 'dark' },
  },
};

// Data-platform header, for page types on platforms that sit beside the
// content sites. The top-left carries a back-link to the hub instead of the
// "A design system for digital.gov.au" line; the sibling sites keep the
// right-hand top slot, and the account dropdown sits alone in the bottom band.
// Below m the site nav moves into the mobile drawer's footer. The signed-in
// state shows a name trigger with account controls. Identity is placeholder
// demo data (Jordan Citizen).
export const PageWithAccountSignedIn = {
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['digitalgovau'],
  args: PageAccountData.args('light', { signedIn: true }),
};

export const PageWithAccountAnonymous = {
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['digitalgovau'],
  args: PageAccountData.args('light', { signedIn: false }),
};

// Back-link site-nav variant: a left-aligned "back to digital.gov.au" link with
// the sibling ecosystem sites right-aligned.
export const PageWithSiteBackLink = {
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['digitalgovau'],
  args: PageAccountData.args('light', { signedIn: true, siteNav: 'back' }),
};

// Header with a primary navigation menu (BuyICT-style): dropdown sections plus
// a search form, the active underline flush to the header's bottom edge.
export const PageWithDropdownMenu = {
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['digitalgovau'],
  args: PageDropdownMenuData.args('light'),
};
