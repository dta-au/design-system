import React from 'react';
import { addons } from 'storybook/manager-api';
import theme from './theme';

// Badge digital.gov.au components in the sidebar. Tags are the source of
// truth – strip them for an upstream PR. `digitalgovau` marks a DGA-extended
// component; `dga-experiment` marks a DGA experiment not yet part of the
// design system proper.
//
// `onStories: false` keeps a chip on the group and docs rows only, so story
// rows stay clear and a story-level chip like Experiment reads on its own.
const BADGES = [
  { tag: 'digitalgovau', label: 'DGA', background: '#0b3d91', onStories: false },
  // Experiment chip uses data-vis categorical 3 (berry).
  { tag: 'dga-experiment', label: 'Experiment', background: '#801650', onStories: true },
];

const chipStyle = (background) => ({
  marginLeft: 6,
  padding: '0 5px',
  borderRadius: 8,
  fontSize: 9,
  fontWeight: 700,
  lineHeight: '15px',
  background,
  color: '#fff',
});

const dgaBadge = (label, tags, isStory) => {
  const chips = Array.isArray(tags)
    ? BADGES.filter((b) => tags.includes(b.tag) && (b.onStories || !isStory))
    : [];
  return chips.length
    ? React.createElement(
        'span',
        null,
        label,
        ...chips.map((b) =>
          React.createElement('span', { key: b.tag, style: chipStyle(b.background) }, b.label),
        ),
      )
    : label;
};

addons.setConfig({
  theme,
  sidebar: {
    renderLabel: (item) => dgaBadge(item.name, item.tags, item.type === 'story'),
  },
});
