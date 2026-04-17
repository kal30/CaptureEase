export const ACTIVITY_THEME_MAP = {
  therapy: {
    key: 'slate',
    label: 'Therapy',
    color: '#64748B',
    softBg: '#F8FAFC',
    dark: '#334155',
    border: '#CBD5E1',
  },
  outing: {
    key: 'indigo',
    label: 'Outing',
    color: '#6366F1',
    softBg: '#EEF2FF',
    dark: '#312E81',
    border: '#C7D2FE',
  },
  routine: {
    key: 'emerald',
    label: 'Routine',
    color: '#10B981',
    softBg: '#ECFDF5',
    dark: '#065F46',
    border: '#6EE7B7',
  },
  appointment: {
    key: 'slate',
    label: 'Appointment',
    color: '#64748B',
    softBg: '#F8FAFC',
    dark: '#334155',
    border: '#CBD5E1',
  },
  social: {
    key: 'rose',
    label: 'Social',
    color: '#F43F5E',
    softBg: '#FFF1F2',
    dark: '#881337',
    border: '#FDA4AF',
  },
  play: {
    key: 'indigo',
    label: 'Play',
    color: '#6366F1',
    softBg: '#EEF2FF',
    dark: '#312E81',
    border: '#C7D2FE',
  },
  other: {
    key: 'amber',
    label: 'Other',
    color: '#F59E0B',
    softBg: '#FFFBEB',
    dark: '#78350F',
    border: '#FCD34D',
  },
  school: {
    key: 'slate',
    label: 'School',
    color: '#64748B',
    softBg: '#F8FAFC',
    dark: '#334155',
    border: '#CBD5E1',
  },
  exercise: {
    key: 'indigo',
    label: 'Exercise',
    color: '#6366F1',
    softBg: '#EEF2FF',
    dark: '#312E81',
    border: '#C7D2FE',
  },
};

export const ACTIVITY_TYPE_OPTIONS = [
  { label: 'Therapy', value: 'therapy', emoji: '🧑‍⚕️', themeKey: 'therapy', group: 'structured' },
  { label: 'School', value: 'school', emoji: '🏫', themeKey: 'school', group: 'structured' },
  { label: 'Appointment', value: 'appointment', emoji: '📅', themeKey: 'appointment', group: 'structured' },
  { label: 'Exercise', value: 'exercise', emoji: '🏃', themeKey: 'exercise', group: 'structured' },
  { label: 'Play', value: 'play', emoji: '🧸', themeKey: 'play', group: 'unstructured' },
  { label: 'Outing', value: 'outing', emoji: '🛝', themeKey: 'outing', group: 'unstructured' },
  { label: 'Social', value: 'social', emoji: '👥', themeKey: 'social', group: 'unstructured' },
  { label: 'Routine', value: 'routine', emoji: '🔁', themeKey: 'routine', group: 'unstructured' },
  { label: 'Other', value: 'other', emoji: '✨', themeKey: 'other', group: 'unstructured' },
];

export const ACTIVITY_TYPE_SECTIONS = [
  {
    key: 'structured',
    label: 'Structured',
    values: ['therapy', 'school', 'appointment', 'exercise'],
  },
  {
    key: 'unstructured',
    label: 'Unstructured',
    values: ['play', 'outing', 'social', 'routine', 'other'],
  },
];

export const getActivityTheme = (activityType) =>
  ACTIVITY_THEME_MAP[activityType] || ACTIVITY_THEME_MAP.other;

export const getPrimaryActivityTheme = (activityTypes = []) =>
  getActivityTheme(
    Array.isArray(activityTypes)
      ? (activityTypes.length > 0 ? activityTypes[0] : 'other')
      : (activityTypes || 'other')
  );
