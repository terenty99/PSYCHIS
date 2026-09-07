export const COLOR_TOKENS = {
  whitePure: '#FFFFFF',
  whiteWarm: '#F8F7F5',
  whiteSubtle: '#F5F4F2',
  greySoft: '#F0EFED',
  greyMedium: '#E8E6E3',
  greyDeep: '#E0DED9',
  greyAccent: '#D8D6D2',
  greyStrong: '#C5C2BC',
  greyDark: '#8A8782',

  textPrimary: '#4A4540',
  textSecondary: '#6B655A',
  textMuted: '#8A8782',
  textFaint: '#B0ADA8',
  textOnAccent: '#FFFFFF',

  obsidianBg: 'rgba(15, 18, 26, 0.96)',
};

export const RELATIONSHIP_TYPES = {
  ORIGIN_URL: 'ORIGIN_URL',
  COUPLED_SYSTEM: 'COUPLED_SYSTEM',
  CONTRADICTS: 'CONTRADICTS',
  DEEP_PROBE: 'DEEP_PROBE',
  DEFAULT: 'DEFAULT',
};

export const RELATION_INFO = {
  ORIGIN_URL: {
    label: 'origin',
    title: 'ORIGIN_URL (Topological Anchor)',
    desc: 'Web corpus anchor providing primary parametric derivations and closed-form axioms.',
    stroke: '#4A4540',
    dashed: false,
  },
  COUPLED_SYSTEM: {
    label: 'coupled',
    title: 'COUPLED_SYSTEM (Mechanical Transport)',
    desc: '94.8% mathematical coupling through straight-line Chebyshev guidance.',
    stroke: '#4A4540',
    dashed: false,
  },
  CONTRADICTS: {
    label: 'contradicts',
    title: 'CONTRADICTS (Refutation Dialectic)',
    desc: 'Strict experimental contradiction: Cu2S phase transition vs superconductivity claims.',
    stroke: '#3A3530',
    dashed: true,
  },
  DEEP_PROBE: {
    label: 'ai probe',
    title: 'DEEP_PROBE (Crawled 2026)',
    desc: 'Autonomous discovery validating zero stick-slip hysteresis at 4.2 K.',
    stroke: '#7A7570',
    dashed: false,
  },
  DEFAULT: {
    label: 'link',
    title: 'ASSOCIATED_NODE',
    desc: 'Topological semantic linkage within the spatial knowledge graph.',
    stroke: '#8A8782',
    dashed: false,
  }
};
