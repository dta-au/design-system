import HeaderData from '../../03-organisms/header/header.stories.data';
import FooterData from '../../03-organisms/footer/footer.stories.data';
import SearchBar from '../../02-molecules/search-bar/search-bar.twig';
import SearchBarData from '../../02-molecules/search-bar/search-bar.stories.data';
import Pagination from '../../02-molecules/pagination/pagination.twig';
import PaginationData from '../../02-molecules/pagination/pagination.stories.data';

const sampleFilters = [
  {
    type: 'checkbox',
    label: 'Topic',
    name: 'topic',
    options: [
      { label: 'Climate change and the environment', value: 'climate-change', count: 45 },
      { label: 'Health and community services', value: 'health-services', count: 213 },
      { label: 'Education and training', value: 'education', count: 4 },
      { label: 'Transport and infrastructure', value: 'transport', count: 17 },
    ],
  },
  {
    type: 'checkbox',
    label: 'Audience',
    name: 'audience',
    options: [
      { label: 'Individuals and families', value: 'individuals', count: 0 },
      { label: 'Small and medium businesses', value: 'business', count: 21 },
      { label: 'Not-for-profit organisations', value: 'nfp', count: 754 },
      { label: 'Local government bodies', value: 'local-gov', count: 6 },
    ],
  },
  {
    type: 'date_range',
    label: 'Date range',
    name: 'date',
    options: [],
  },
];

const sampleSortFilters = [
  {
    type: 'radio',
    label: 'Sort by',
    name: 'sort',
    options: [
      { label: 'Most relevant', value: 'relevance' },
      { label: 'Newest first', value: 'date-desc' },
      { label: 'Oldest first', value: 'date-asc' },
      { label: 'Alphabetical A–Z', value: 'alpha' },
    ],
  },
];

const sampleResults = [
  {
    title: 'Programs and services overview',
    url: 'https://example.gov.au/programs-and-services',
    description: 'Find the full range of programs and services available to residents, businesses, and community organisations.',
  },
  {
    title: 'Citizenship application fees to change from 1 July',
    url: 'https://example.gov.au/news/citizenship-fees',
    description: 'The government has announced changes to citizenship application processing fees. Find out the new rates and when they take effect.',
  },
  {
    title: 'Three tips for greener driving to save money and reduce emissions',
    url: 'https://example.gov.au/environment/greener-driving',
    description: 'Small changes to how you drive can significantly cut fuel costs and carbon emissions. Read our practical guide to get started.',
  },
  {
    title: 'Health services directory',
    url: 'https://example.gov.au/health/services',
    description: 'A searchable directory of local health services including GPs, hospitals, mental health support, and specialist care providers.',
  },
  {
    title: 'Employment support and job placement',
    url: 'https://example.gov.au/employment',
    description: 'Access job search resources, résumé advice, and connect with local employers through our employment services programme.',
  },
  {
    title: 'Register your small business',
    url: 'https://example.gov.au/business/register',
    description: 'Everything you need to register a new business — ABN applications, business name registration, and an overview of your tax obligations.',
  },
  {
    title: 'Community grants and funding opportunities',
    url: 'https://example.gov.au/grants',
    description: 'Discover grants for community groups, sporting clubs, arts organisations, and not-for-profit bodies. Applications open quarterly.',
  },
  {
    title: 'Public transport timetables and upcoming route changes',
    url: 'https://example.gov.au/transport/timetables',
    description: 'Updated timetables for bus, train, and ferry services across the network. New route changes take effect from the next service period.',
  },
  {
    title: 'Planning and development applications',
    url: 'https://example.gov.au/planning',
    description: 'Submit and track development applications, view approved plans, and find out about proposed changes to local planning schemes.',
  },
  {
    title: 'Waste collection and recycling schedule',
    url: 'https://example.gov.au/waste',
    description: 'Find your bin collection day, download the recycling guide, and book a hard rubbish pickup for your address.',
  },
];

export default {
  args: (theme = 'light', options = {}) => {
    const headerData = HeaderData.args(theme);
    const footerData = FooterData.args(theme);

    return {
      theme,
      filter_layout: options.filter_layout || 'left',
      filter_label: 'Filter results by:',
      filter_toggle_label: 'Filters',
      search: SearchBar(SearchBarData.args(theme)),
      filters: options.no_filters ? [] : sampleFilters,
      sort_filters: options.no_filters ? [] : sampleSortFilters,
      results_summary: "Showing 1 – 10 of 51 results for 'climate change'",
      results: sampleResults,
      pagination: Pagination(PaginationData.args(theme)),
      apply_label: 'Apply filters',
      clear_label: 'Clear filters',
      // Page skeleton
      header_theme: theme,
      header_top_1: headerData.content_top1,
      header_top_2: headerData.content_top2,
      header_top_3: headerData.content_top3,
      header_middle_1: headerData.content_middle1,
      header_middle_2: headerData.content_middle2,
      header_middle_3: headerData.content_middle3,
      header_bottom_1: headerData.content_bottom1,
      banner: '',
      footer_theme: theme,
      footer_background_image: '',
      footer_top_1: footerData.content_top1,
      footer_top_2: footerData.content_top2,
      footer_middle_1: footerData.content_middle1,
      footer_middle_2: footerData.content_middle2,
      footer_middle_3: footerData.content_middle3,
      footer_middle_4: footerData.content_middle4,
      footer_bottom_1: footerData.content_bottom1,
      footer_bottom_2: footerData.content_bottom2,
      modifier_class: '',
      attributes: null,
    };
  },
};
