const ACCENT_PALETTE = [
  {
    surface: '#F6F1FF',
    border: '#CDB8FF',
    text: '#6B46C1',
    strong: '#7C4DCC',
  },
  {
    surface: '#EEF6FF',
    border: '#B7D5FF',
    text: '#1D4ED8',
    strong: '#2563EB',
  },
  {
    surface: '#EEF9F4',
    border: '#B9E5CC',
    text: '#0F766E',
    strong: '#0F9B8E',
  },
  {
    surface: '#FFF6EB',
    border: '#FFD4A8',
    text: '#B45309',
    strong: '#D97706',
  },
];

const getHashIndex = (value = '') => {
  return value.split('').reduce((total, char) => total + char.charCodeAt(0), 0) % ACCENT_PALETTE.length;
};

export const getChildAccent = (childId) => ACCENT_PALETTE[getHashIndex(childId)];
