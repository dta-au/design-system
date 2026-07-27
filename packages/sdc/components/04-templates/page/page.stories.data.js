import Banner from '../../03-organisms/banner/banner.twig';
import BannerData from '../../03-organisms/banner/banner.stories.data';
import HeaderData from '../../03-organisms/header/header.stories.data';
import FooterData from '../../03-organisms/footer/footer.stories.data';
import SideNavigation from '../../03-organisms/side-navigation/side-navigation.twig';
import SideNavigationData from '../../03-organisms/side-navigation/side-navigation.stories.data';
import Button from '../../01-atoms/button/button.twig';
import BasicContent from '../../02-molecules/basic-content/basic-content.twig';
import BasicContentData from '../../02-molecules/basic-content/basic-content.stories.data';
import Accordion from '../../02-molecules/accordion/accordion.twig';
import Attachment from '../../02-molecules/attachment/attachment.twig';
import Callout from '../../02-molecules/callout/callout.twig';
import NextStep from '../../02-molecules/next-step/next-step.twig';
import FeatureLinkList from '../../02-molecules/feature-link-list/feature-link-list.twig';
import FeatureLinkListData from '../../02-molecules/feature-link-list/feature-link-list.stories.data';
import Promo from '../../03-organisms/promo/promo.twig';
import Slider from '../../03-organisms/slider/slider.twig';
import Slide from '../../03-organisms/slider/slide.twig';
import StepByStepNav from '../../03-organisms/step-by-step-nav/step-by-step-nav.twig';
import StepByStepNavData from '../../03-organisms/step-by-step-nav/step-by-step-nav.stories.data';
import List from '../../03-organisms/list/list.twig';
import ListData from '../../03-organisms/list/list.stories.data';
import Grid from '../../00-base/grid/grid.twig';
import Navigation from '../../03-organisms/navigation/navigation.twig';
import SearchForm from '../../02-molecules/search-form/search-form.twig';
import MobileNavigationPanel from '../../03-organisms/mobile-navigation/mobile-navigation.twig';
import MobileNavigationTrigger from '../../03-organisms/mobile-navigation/mobile-navigation-trigger.twig';
import { MobileNavigation as MobileNavigationStory } from '../../03-organisms/mobile-navigation/mobile-navigation.stories';

// Cross-government site links for the header utility (top) row. Sites are named
// (not addressed) and stay in-ecosystem: no external-link icon, no new window.
const siteItem = (title, url) => ({
  title, url, in_active_trail: false, is_expanded: false, is_external: false, is_new_window: false, below: false,
});
const HUB_SITE = siteItem('digital.gov.au', 'https://www.digital.gov.au');
const SIBLING_SITES = [
  siteItem('BuyICT', 'https://www.buyict.gov.au'),
  siteItem('Australian Government Architecture', 'https://www.architecture.gov.au'),
  siteItem('Data and Digital', 'https://www.dataanddigital.gov.au'),
];

const siteNavigation = (theme, items, modifier_class) => Navigation({
  theme, name: 'site', title: null, type: 'dropdown', variant: 'secondary', items, modifier_class,
});

// "Return to digital.gov.au" back-link: left-aligned, heavier weight, with a
// left-arrow icon (CSS-masked via .story-site-back - an icon cannot live in the
// menu item.title, which civictheme:menu reuses as the link `title`).
const backLink = (theme) => siteNavigation(theme, [HUB_SITE], 'story-site-back');

// Desktop site row: hub plus siblings, right-aligned. Lives in the header top
// region, which is itself desktop-only (hide-xxs show-m).
const siteRow = (theme) => siteNavigation(theme, [HUB_SITE, ...SIBLING_SITES], 'ct-flex-justify-content-end');

// Mobile site switcher: a "digital.gov.au" toggle whose panel expands the
// sibling sites upward (CSS column-reverse in the SCSS). Shown only below m,
// where the desktop row is hidden. Uses the core `collapsible` behaviour
// (auto-init from civictheme.base) - no bespoke JS.
const mobileSiteSwitcher = (theme) => [
  `<div class="story-site-switcher ct-theme-${theme} hide-m" data-collapsible data-collapsible-collapsed data-collapsible-duration="250">`,
  '<button class="story-site-switcher__trigger" type="button" data-collapsible-trigger aria-expanded="false">digital.gov.au</button>',
  '<div class="story-site-switcher__panel" data-collapsible-panel aria-hidden="true">',
  '<ul class="story-site-switcher__list">',
  SIBLING_SITES.map((s) => `<li><a class="ct-link ct-theme-${theme} story-site-switcher__link" href="${s.url}">${s.title}</a></li>`).join(''),
  '</ul>',
  '</div>',
  '</div>',
].join('');

// Header regions shared by every page story. The site nav has one home per
// breakpoint: the right-hand top slot on desktop (that band is hide-xxs
// show-m), and the mobile drawer's footer below m - never a row of its own
// beside the account controls.
const siteHeaderRegions = (theme) => ({
  header_top_3: siteRow(theme),
});

const PageData = {
  args: (theme = 'light') => {
    const headerData = HeaderData.args(theme, { drawerBottom: mobileSiteSwitcher(theme) });
    const footerData = FooterData.args(theme);

    return {
      theme,
      vertical_spacing: 'both',
      header_theme: theme,
      header_top_1: headerData.content_top1,
      header_top_2: headerData.content_top2,
      header_middle_1: headerData.content_middle1,
      header_middle_2: headerData.content_middle2,
      header_middle_3: headerData.content_middle3,
      // Site nav: desktop row (top) + mobile switcher (bottom).
      ...siteHeaderRegions(theme),
      banner: Banner(BannerData.args(theme)),
      highlighted: '',
      content_top: '',
      hide_sidebar_left: false,
      hide_sidebar_right: false,
      sidebar_top_left: SideNavigation(SideNavigationData.args(theme)),
      sidebar_top_left_attributes: null,
      sidebar_top_right: '',
      sidebar_top_right_attributes: null,
      content: BasicContent(BasicContentData.args(theme)),
      content_attributes: null,
      // Rich content goes in a content region, not a Paragraph atom - the atom
      // is a single paragraph, so nesting <p>s inside it is invalid markup.
      sidebar_bottom_left: BasicContent({
        theme,
        content: `<p>Register for events!</p><p>${Button({
          theme,
          text: 'Register',
          type: 'primary',
          kind: 'link',
        })}</p>`,
      }),
      sidebar_bottom_left_attributes: null,
      sidebar: '',
      sidebar_attributes: null,
      sidebar_bottom_right: '',
      sidebar_bottom_right_attributes: null,
      content_contained: false,
      content_bottom: '',
      footer_theme: theme,
      footer_logo: '',
      footer_background_image: '',
      footer_top_1: footerData.content_top1,
      footer_top_2: footerData.content_top2,
      footer_middle_1: footerData.content_middle1,
      footer_middle_2: footerData.content_middle2,
      footer_middle_3: footerData.content_middle3,
      footer_middle_4: footerData.content_middle4,
      footer_bottom_1: footerData.content_bottom1,
      footer_bottom_2: footerData.content_bottom2,
      attributes: null,
      modifier_class: '',
    };
  },
};

// Account controls for the header utility (top) row. Two identity states:
// anonymous (single "Log in" link) and signed-in (a name trigger whose
// dropdown holds "My account" and "Log out"). Composed from the existing
// Navigation dropdown - no new markup on the page component.
const accountItems = (signedIn) => (signedIn
  ? [{
    title: 'Jordan Citizen',
    url: '/user',
    in_active_trail: false,
    is_expanded: false,
    below: [
      { title: 'My account', url: '/user', in_active_trail: false, is_expanded: false, below: false },
      { title: 'Log out', url: '/user/logout', in_active_trail: false, is_expanded: false, below: false },
    ],
  }]
  : [{
    title: 'Log in',
    url: '/user/login',
    in_active_trail: false,
    is_expanded: false,
    below: false,
  }]);

const accountNavigation = (theme, signedIn) => Navigation({
  theme,
  name: 'account',
  title: null,
  type: 'dropdown',
  variant: 'secondary',
  items: accountItems(signedIn),
  // story-account-nav scopes the CSS-masked account/login icons - they can't
  // live in item.title, which civictheme:menu reuses as the link `title`.
  modifier_class: 'ct-flex-justify-content-end story-account-nav',
});

export const PageAccountData = {
  // Data-platform header. The site nav keeps its two homes - siblings in the
  // right-hand top slot on desktop, the switcher in the mobile drawer footer
  // (inherited from PageData) - and never shares a row with the account
  // controls, which sit alone in the bottom band.
  //
  // siteNav: 'back' (the platform default) replaces the "A design system for
  // digital.gov.au" line in the top-left with a back-link to the hub, since a
  // platform is somewhere you navigate back from. 'row' keeps the content-site
  // arrangement: the hub sits inside the right-hand row with its siblings.
  args: (theme = 'light', { signedIn = true, siteNav = 'back' } = {}) => {
    const base = {
      ...PageData.args(theme),
      // Bottom band: account controls only.
      header_bottom_1: accountNavigation(theme, signedIn),
    };

    if (siteNav === 'back') {
      return {
        ...base,
        header_top_2: backLink(theme),
        header_top_3: siteNavigation(theme, SIBLING_SITES, 'ct-flex-justify-content-end'),
      };
    }

    return base;
  },
};

// BuyICT primary menu (captured from the live buyict.gov.au nav). Buyers,
// Sellers, Marketplaces and Resources open mega-menus on the real site; those
// level-2 columns lazy-load and were empty in the captured markup, so the
// `below` children here are representative placeholders - swap in the real
// sub-nav when available.
const dropdownChildren = (labels) => labels.map((title) => ({
  title, url: '#', in_active_trail: false, is_expanded: false, below: false,
}));

const primaryMenuItems = [
  { title: 'Opportunities', url: '/public?id=opportunities', in_active_trail: true, is_expanded: false, below: false },
  { title: 'Browse sellers', url: '/public?id=seller_catalogue', in_active_trail: false, is_expanded: false, below: false },
  { title: 'Buyers', url: '/public/en/buyers', in_active_trail: false, is_expanded: false, below: dropdownChildren(['Getting started', 'Buy from a panel', 'Guidance for buyers']) },
  { title: 'Sellers', url: '/public/en/sellers', in_active_trail: false, is_expanded: false, below: dropdownChildren(['Register as a seller', 'Manage your profile', 'Guidance for sellers']) },
  { title: 'Marketplaces', url: '/public/en/marketplaces', in_active_trail: false, is_expanded: false, below: dropdownChildren(['Digital Marketplace', 'Cloud Marketplace', 'Hardware Marketplace']) },
  { title: 'Resources', url: '/public/en/resources', in_active_trail: false, is_expanded: false, below: dropdownChildren(['Guides', 'Reporting', 'News and updates']) },
  { title: 'Contact', url: '/public?id=contact_us', in_active_trail: false, is_expanded: false, below: false },
];

const primaryNavigation = (theme) => Navigation({
  theme,
  name: 'primary',
  title: null,
  type: 'drawer',
  variant: 'primary',
  dropdown_columns: 1,
  items: primaryMenuItems,
  modifier_class: 'ct-primary-navigation',
});

// Header with a primary navigation menu (BuyICT-style, Multiline layout): the
// drawer menu sits in the bottom slot with dropdowns on the sections that have
// sub-nav. Seven items only fit the grid container at L and up (896px), so the
// desktop menu switches at L, not M: below L the bottom bar is hidden and the
// middle-row hamburger drives the same menu (see page.stories.scss).
export const PageDropdownMenuData = {
  args: (theme = 'light') => ({
    ...PageData.args(theme),
    header_middle_3: [
      SearchForm({ theme, label: 'Search', modifier_class: 'story-header-search' }).trim(),
      MobileNavigationTrigger({ theme, icon: 'bars', text: 'Menu' }).trim(),
      MobileNavigationPanel({ ...MobileNavigationStory.args, theme, top_menu: primaryMenuItems }).trim(),
    ].join(''),
    header_bottom_1: primaryNavigation(theme),
  }),
};

export default PageData;

export const PageFullWidthData = {
  // is_contained mirrors the placement context: true when the layout is
  // full-width and each component provides its own container; false when the
  // layout column constrains the components (sidebar page).
  args: (theme = 'light', isContained = true) => {
    const headerData = HeaderData.args(theme);
    const footerData = FooterData.args(theme);
    const accordionData = {
      theme,
      with_background: true,
      is_contained: isContained,
      vertical_spacing: 'both',
      panels: [
        {
          title: 'Accordion title 1',
          content: 'Accordion content 1 <a href="https://example.com">Example link</a>',
          expanded: false,
        },
        {
          title: 'Accordion title 2',
          content: 'Accordion content 2 <a href="https://example.com">Example link</a>',
          expanded: false,
        },
        {
          title: 'Accordion title 3',
          content: 'Accordion content 3 <a href="https://example.com">Example link</a>',
          expanded: false,
        },
      ],
    };
    const listData = {
      theme,
      is_contained: isContained,
      rows: Grid({
        theme,
        use_container: isContained,
        items: ListData.items(theme, {
          component: 'promo',
          items: [
            { title: 'Example 1', date: null, subtitle: null, tags: null },
            { title: 'Example 2 lorem ipsum dolor sit amet', date: null, subtitle: null, tags: null },
            { title: 'Example 3', date: null, subtitle: null, tags: null },
          ],
        }),
        template_column_count: 3,
        fill_width: false,
        with_background: false,
        row_class: 'row--equal-heights-content row--vertically-spaced',
      }),
      vertical_spacing: 'none',
      with_background: false,
      attributes: null,
      modifier_class: '',
    };

    return {
      theme,
      vertical_spacing: 'none',
      header_theme: theme,
      header_top_1: headerData.content_top1,
      header_top_2: headerData.content_top2,
      header_middle_1: headerData.content_middle1,
      header_middle_2: headerData.content_middle2,
      header_middle_3: headerData.content_middle3,
      // Site nav: desktop row (top) + mobile switcher (bottom).
      ...siteHeaderRegions(theme),
      banner: Banner({ ...BannerData.args(theme), content_below: '', is_decorative: false, featured_image: null }),
      highlighted: '',
      content_top: '',
      content_attributes: null,
      content_contained: false,
      content_bottom: '',
      footer_theme: theme,
      footer_logo: '',
      footer_background_image: '',
      footer_top_1: footerData.content_top1,
      footer_top_2: footerData.content_top2,
      footer_middle_1: footerData.content_middle1,
      footer_middle_2: footerData.content_middle2,
      footer_middle_3: footerData.content_middle3,
      footer_middle_4: footerData.content_middle4,
      footer_bottom_1: footerData.content_bottom1,
      footer_bottom_2: footerData.content_bottom2,
      attributes: null,
      modifier_class: '',
      hide_sidebar_left: true,
      hide_sidebar_right: true,
      content: [
        BasicContent({ theme, content: '<p>Text without a class sed aute in sed consequat veniam excepteur minim mollit.</p>', is_contained: isContained, vertical_spacing: 'both' }),
        Accordion(accordionData),
        Accordion({ ...accordionData, with_background: false }),
        List({ ...listData, with_background: true, vertical_spacing: 'both' }),
        List({ ...listData, with_background: false, vertical_spacing: 'both' }),
      ].join(''),
    };
  },
};

// Temporary review data - composes every component changed by the
// with_background / is_contained / heading_level work inside a real page.
// Delete together with the PageReview* stories once the review is done.
export const PageReviewData = {
  args: (theme = 'light', isContained = true) => {
    const base = PageFullWidthData.args(theme, isContained);
    const sectionLabel = (text) => BasicContent({
      theme,
      content: `<h2>${text}</h2>`,
      is_contained: isContained,
      vertical_spacing: 'top',
    });
    // The surface-panel state is a nested placement: on the full-width page it
    // needs a grid column to nest into; on the sidebar page the layout column
    // already provides one.
    const inColumn = (html) => (isContained
      ? `<div class="container"><div class="row"><div class="col-xxs-12">${html}</div></div></div>`
      : html);

    return {
      ...base,
      content: [
        sectionLabel('Basic content (with background)'),
        BasicContent({
          theme,
          content: '<p>Surface fill should sit flush with this column when nested; full-width it bands to the page edge.</p>',
          with_background: true,
          is_contained: isContained,
          vertical_spacing: 'both',
        }),

        sectionLabel('Attachment (with background, heading level 3)'),
        Attachment({
          theme,
          title: 'Attachment title',
          content: 'Attachment content.',
          heading_level: 3,
          with_background: true,
          is_contained: isContained,
          files: [
            { name: 'Annual report', ext: 'pdf', size: '1.2MB', url: '#', icon: 'download-file' },
          ],
        }),

        sectionLabel('Callout (heading level 3)'),
        Callout({
          theme,
          title: 'Callout title',
          content: 'Callout content.',
          heading_level: 3,
          is_contained: isContained,
          links: [{ text: 'First action', url: '#' }, { text: 'Second action', url: '#' }],
        }),

        sectionLabel('Next step (heading level 3)'),
        NextStep({
          theme,
          title: 'Next step title',
          content: 'Next step content.',
          heading_level: 3,
          is_contained: isContained,
          link: { url: '#' },
        }),

        sectionLabel('Feature link list (with background, heading level 3)'),
        FeatureLinkList({
          ...FeatureLinkListData.args(theme),
          heading_level: 3,
          with_background: true,
          is_contained: isContained,
        }),

        sectionLabel(isContained
          ? 'Accordion - three states: band, plain, surface panel'
          : 'Accordion - nested states: plain, surface panel'),
        ...(isContained ? [Accordion({
          theme,
          with_background: true,
          is_contained: true,
          vertical_spacing: 'both',
          panels: [
            { title: 'Band: with_background, contained', content: 'Section-band colour, full-bleed on a full-width page.', expanded: false },
            { title: 'Accordion title 2', content: 'Accordion content 2', expanded: false },
          ],
        })] : []),
        Accordion({
          theme,
          is_contained: isContained,
          vertical_spacing: 'both',
          panels: [
            { title: 'Plain: no background', content: 'The standard accordion.', expanded: false },
            { title: 'Accordion title 2', content: 'Accordion content 2', expanded: false },
          ],
        }),
        inColumn(Accordion({
          theme,
          with_background: true,
          is_contained: false,
          vertical_spacing: 'both',
          panels: [
            { title: 'Surface panel: with_background, not contained', content: 'Panels carry the surface colour; standard width, no band.', expanded: false },
            { title: 'Accordion title 2', content: 'Accordion content 2', expanded: false },
          ],
        })),

        sectionLabel('Step by step nav (with background - new in this change)'),
        StepByStepNav({
          ...StepByStepNavData.args(theme),
          with_background: true,
          is_contained: isContained,
        }),

        sectionLabel(isContained
          ? 'Promo - band, then surface panel (heading level 2)'
          : 'Promo - nested states: plain, surface panel (heading level 2)'),
        isContained
          ? Promo({
            theme,
            title: 'Sign up for industry news',
            content: 'Band: with_background, contained.',
            heading_level: 2,
            with_background: true,
            is_contained: true,
            link: { text: 'Sign up', url: '#' },
          })
          : Promo({
            theme,
            title: 'Sign up for industry news',
            content: 'Plain: no background.',
            heading_level: 2,
            is_contained: false,
            link: { text: 'Sign up', url: '#' },
          }),
        inColumn(Promo({
          theme,
          title: 'Sign up for industry news',
          content: 'Surface panel: with_background, not contained.',
          heading_level: 2,
          with_background: true,
          is_contained: false,
          link: { text: 'Sign up', url: '#' },
        })),

        sectionLabel('Slider (with background, slide heading level 4)'),
        Slider({
          theme,
          title: 'Slider title',
          with_background: true,
          is_contained: isContained,
          slides: [1, 2].map((idx) => Slide({
            theme,
            title: `Slide ${idx}`,
            content: 'Content',
            heading_level: 4,
            links: [{ text: `Link ${idx}`, url: '#' }],
          }).trim()).join(''),
        }),

        sectionLabel('List (with background)'),
        List({
          theme,
          with_background: true,
          is_contained: isContained,
          vertical_spacing: 'both',
          rows: Grid({
            theme,
            use_container: isContained,
            items: ListData.items(theme, {
              component: 'promo',
              items: [
                { title: 'Example 1', date: null, subtitle: null, tags: null },
                { title: 'Example 2', date: null, subtitle: null, tags: null },
                { title: 'Example 3', date: null, subtitle: null, tags: null },
              ],
            }),
            template_column_count: 3,
            fill_width: false,
            with_background: false,
            row_class: 'row--equal-heights-content row--vertically-spaced',
          }),
        }),
      ].join(''),
    };
  },
};
