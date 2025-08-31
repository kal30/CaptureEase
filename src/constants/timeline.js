// Theme-driven timeline type metadata and helpers

export const ENTRY_TYPES = {
  incident: {
    key: 'incident',
    label: 'Incidents',
    icon: '🛑',
    paletteKey: 'timeline.entries.incident',
  },
  dailyHabit: {
    key: 'dailyHabit',
    label: 'Daily Habits',
    icon: '📋',
    paletteKey: 'timeline.entries.dailyHabit',
  },
  dailyNote: {
    key: 'dailyNote',
    label: 'Daily Notes',
    icon: '📝',
    paletteKey: 'timeline.entries.dailyNote',
  },
  journal: {
    key: 'journal',
    label: 'Journal',
    icon: '📔',
    paletteKey: 'timeline.entries.journal',
  },
};

// String constants for entry type keys to avoid magic strings in components
export const ENTRY_TYPE = {
  INCIDENT: 'incident',
  DAILY_HABIT: 'dailyHabit',
  DAILY_NOTE: 'dailyNote',
  JOURNAL: 'journal',
};

const LEGACY_TO_ENTRY = new Set([
  'mood',
  'sleep',
  'nutrition',
  'progress',
  'other',
  'dailyHabit',
  'moodLog',
  'sleepLog',
  'foodLog',
  'customHabit',
  'quickNote',
]);

export const mapLegacyType = (type) => {
  if (type === 'incident') return 'incident';
  if (type === 'journal' || type === 'progressNote') return 'dailyNote';
  if (type === 'dailyLog' && ENTRY_TYPES.journal) return 'journal';
  if (LEGACY_TO_ENTRY.has(type)) return 'dailyHabit';
  return type; // fallback
};

export const getEntryTypeMeta = (type) => {
  const normalized = mapLegacyType(type);
  return ENTRY_TYPES[normalized] || ENTRY_TYPES.dailyNote;
};

// Time-of-day periods for grouping entries
export const PERIODS = {
  morning: { key: 'morning', label: '🌅 Morning', startHour: 6, endHour: 12 },
  afternoon: { key: 'afternoon', label: '☀️ Afternoon', startHour: 12, endHour: 18 },
  evening: { key: 'evening', label: '🌙 Evening', startHour: 18, endHour: 24 },
};

const toDate = (ts) => (ts?.toDate ? ts.toDate() : new Date(ts));

// Group entries by PERIODS based on timestamp
export const groupEntriesByPeriod = (entries = []) => {
  if (!entries.length) return [];

  const groups = {
    morning: { label: PERIODS.morning.label, period: 'morning', entries: [] },
    afternoon: { label: PERIODS.afternoon.label, period: 'afternoon', entries: [] },
    evening: { label: PERIODS.evening.label, period: 'evening', entries: [] },
  };

  entries.forEach((entry) => {
    const d = toDate(entry.timestamp);
    const hour = d.getHours();
    if (hour >= PERIODS.morning.startHour && hour < PERIODS.morning.endHour) {
      groups.morning.entries.push(entry);
    } else if (hour >= PERIODS.afternoon.startHour && hour < PERIODS.afternoon.endHour) {
      groups.afternoon.entries.push(entry);
    } else {
      groups.evening.entries.push(entry);
    }
  });

  return Object.values(groups).filter((g) => g.entries.length > 0);
};
