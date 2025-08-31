// Timeline color helpers - theme driven
// Keep UI components small by centralizing color mapping here

import { mapLegacyType } from '../../../constants/timeline';

export const getTypeColor = (theme, entryType) => {
  const key = mapLegacyType(entryType);
  return theme.palette?.timeline?.entries?.[key] || theme.palette.primary.main;
};

export const getPeriodColor = (theme, period) => {
  return theme.palette?.timeline?.periods?.[period] || theme.palette.text.secondary;
};

// Simple severity mapping (1-3 info, 4-6 warning, 7-10 error)
export const getSeverityColor = (theme, level) => {
  const n = Number(level);
  if (Number.isFinite(n)) {
    if (n >= 7) return theme.palette.error.main;
    if (n >= 4) return theme.palette.warning.main;
    if (n >= 1) return theme.palette.info.main;
  }
  return theme.palette.grey[600];
};

