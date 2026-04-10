import colors from '../../../assets/theme/colors';

const ACCENT_PALETTE = [
  {
    surface: colors.landing.panelSoft,
    border: colors.landing.quoteGradientStart,
    text: colors.landing.midNavy,
    strong: colors.brand.deep,
  },
  {
    surface: colors.landing.tealLight || '#EAF4F2',
    border: colors.landing.cyanPop,
    text: '#0F766E',
    strong: '#0F9B8E',
  },
  {
    surface: colors.landing.sageLight || '#F7FBF9',
    border: colors.landing.pastelAqua,
    text: '#4E6C60',
    strong: '#6B8B76',
  },
  {
    surface: '#FFF8ED',
    border: '#F4C88A',
    text: '#B45309',
    strong: '#D97706',
  },
];

const getHashIndex = (value = '') => {
  return value.split('').reduce((total, char) => total + char.charCodeAt(0), 0) % ACCENT_PALETTE.length;
};

export const getChildAccent = (childId) => ACCENT_PALETTE[getHashIndex(childId)];
