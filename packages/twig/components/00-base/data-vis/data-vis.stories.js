import Component from './data-vis.stories.twig';

// Specimen data. Values mirror the chart tokens --dga-data-vis-categorical-*
// (categorical) and --bdga-chart-s* (sequential) in chart.scss. Prose lives in
// data-vis.mdx; markup in data-vis.stories.twig.
const CATEGORICAL = [
  { name: 'Navy', note: 'primary anchor', hex: '#1E3C50', rgb: '30, 60, 80' },
  { name: 'Turquoise', note: '', hex: '#28A197', rgb: '40, 161, 151' },
  { name: 'Dark pink', note: '', hex: '#801650', rgb: '128, 22, 80' },
  { name: 'Orange', note: '', hex: '#F46A25', rgb: '244, 106, 37' },
  { name: 'Light purple', note: '', hex: '#A285D1', rgb: '162, 133, 209' },
  { name: 'Dark grey', note: '', hex: '#3D3D3D', rgb: '61, 61, 61' },
];

const SEQUENTIAL = [
  { name: 'Darkest', note: '', hex: '#001D33', rgb: '0, 29, 51' },
  { name: 'Dark', note: '', hex: '#003C61', rgb: '0, 60, 97' },
  { name: 'Mid', note: '', hex: '#015E8C', rgb: '1, 94, 140' },
  { name: 'Light', note: '', hex: '#5693BD', rgb: '86, 147, 189' },
  { name: 'Lightest', note: '', hex: '#AED0E8', rgb: '174, 208, 232' },
  { name: 'Pale grey', note: 'no data', hex: '#F0EEEE', rgb: '240, 238, 238' },
];

const COLORBY = [
  { key: 'single', value: 'Default. One navy; distinguish by axis position, label and filter.' },
  { key: 'series', value: 'One categorical colour per Y-series (multi-series charts).' },
  { key: 'category', value: 'One categorical colour per X-position (few categories only).' },
  { key: 'field name', value: 'Colour by that field: the sequential ramp for ordinal values, categorical otherwise.' },
];

const CVD_FILTER = {
  none: '',
  deutan: 'url(#dv-deutan)',
  protan: 'url(#dv-protan)',
  tritan: 'url(#dv-tritan)',
};

// Render the twig, then wire the CVD toggle (markup stays in twig; this only
// adds behaviour). A no-op when a specimen has no toggle (e.g. ColourScheme).
const renderSpecimen = (args) => {
  const wrap = document.createElement('div');
  wrap.innerHTML = Component(args);
  wrap.querySelectorAll('.dv-cvd__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      wrap.querySelectorAll('.dv-cvd__btn').forEach((b) => {
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      const filter = CVD_FILTER[btn.dataset.cvd] || '';
      wrap.querySelectorAll('.dv-chip, .dv-ramp').forEach((el) => {
        el.style.filter = filter;
      });
    });
  });
  return wrap;
};

const meta = {
  title: 'Base/Data visualisation/Colour',
  component: Component,
  // digital.gov.au extension - badged DGA in the sidebar (see manager.js).
  tags: ['digitalgovau'],
  parameters: { html: { disable: true } },
};

export default meta;

export const Categorical = {
  args: { palette: { categorical: CATEGORICAL } },
  render: renderSpecimen,
};

export const Sequential = {
  args: { palette: { sequential: SEQUENTIAL } },
  render: renderSpecimen,
};

export const ColourScheme = {
  args: { palette: { colorby: COLORBY } },
  render: renderSpecimen,
};
