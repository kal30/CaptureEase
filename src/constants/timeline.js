// Theme-driven timeline type metadata and helpers
import { getIncidentDisplayInfo, getDailyLogDisplayInfo, getDailyHabitsDisplayInfo } from './uiDisplayConstants';
import { LOG_TYPES, SPECIAL_FILTER_TYPES } from './logTypeRegistry';

// Dynamic function to get entry types with centralized labels
export const getEntryTypes = () => {
  const incidentDisplay = getIncidentDisplayInfo();
  const dailyLogDisplay = getDailyLogDisplayInfo();
  const dailyHabitsDisplay = getDailyHabitsDisplayInfo();
  
  return {
    incident: {
      key: 'incident',
      label: incidentDisplay.pluralLabel,
      icon: incidentDisplay.emoji,
      paletteKey: 'timeline.entries.incident',
    },
    dailyHabit: {
      key: 'dailyHabit',
      label: dailyHabitsDisplay.label,
      icon: dailyHabitsDisplay.emoji,
      paletteKey: 'timeline.entries.dailyHabit',
    },
    dailyLog: {
      key: 'dailyLog',
      label: dailyLogDisplay.label,
      icon: dailyLogDisplay.emoji,
      paletteKey: 'timeline.entries.dailyLog',
    },
    importantMoment: {
      key: 'importantMoment',
      label: SPECIAL_FILTER_TYPES.importantMoment.label,
      icon: SPECIAL_FILTER_TYPES.importantMoment.icon,
      paletteKey: 'timeline.entries.dailyLog',
    },
    behavior: {
      key: 'behavior',
      label: LOG_TYPES.behavior.displayLabel,
      icon: LOG_TYPES.behavior.icon,
      paletteKey: 'timeline.entries.behavior',
    },
    health: {
      key: 'health',
      label: LOG_TYPES.health.displayLabel,
      icon: LOG_TYPES.health.icon,
      paletteKey: 'timeline.entries.health',
    },
    mood: {
      key: 'mood',
      label: LOG_TYPES.mood.displayLabel,
      icon: LOG_TYPES.mood.icon,
      paletteKey: 'timeline.entries.mood',
    },
    sleep: {
      key: 'sleep',
      label: LOG_TYPES.sleep.displayLabel,
      icon: LOG_TYPES.sleep.icon,
      paletteKey: 'timeline.entries.sleep',
    },
    food: {
      key: 'food',
      label: LOG_TYPES.food.displayLabel,
      icon: LOG_TYPES.food.icon,
      paletteKey: 'timeline.entries.food',
    },
    bathroom: {
      key: 'bathroom',
      label: LOG_TYPES.bathroom.displayLabel,
      icon: LOG_TYPES.bathroom.icon,
      paletteKey: 'timeline.entries.health',
    },
    milestone: {
      key: 'milestone',
      label: LOG_TYPES.milestone.displayLabel,
      icon: LOG_TYPES.milestone.icon,
      paletteKey: 'timeline.entries.milestone',
    },
    therapyNote: {
      key: 'therapyNote',
      label: 'Therapy Notes',
      icon: '🩺',
      paletteKey: 'timeline.entries.therapyNote',
    },
  };
};

// Legacy static export for backward compatibility
export const ENTRY_TYPES = getEntryTypes();

// String constants for entry type keys to avoid magic strings in components
export const ENTRY_TYPE = {
  INCIDENT: 'incident',
  DAILY_HABIT: 'dailyHabit',
  DAILY_LOG: 'dailyLog',
  IMPORTANT_MOMENT: 'importantMoment',
  BEHAVIOR: 'behavior',
  HEALTH: 'health',
  MOOD: 'mood',
  SLEEP: 'sleep',
  FOOD: 'food',
  MILESTONE: 'milestone',
  THERAPY_NOTE: 'therapyNote',
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
  // Collection-based mapping (preferred):
  // - incidents collection → 'incident' type
  // - dailyCare collection → 'dailyHabit' type  
  // - dailyLogs collection → 'dailyLog' type
  // - therapyNotes collection → 'therapyNote' type
  
  if (type === 'incident') return 'incident';
  if (type === 'followUp') return 'incident'; // Follow-ups should display as incidents
  if (type === 'dailyLog') return 'dailyLog'; // dailyLogs collection = daily log entries
  if (type === 'importantMoment') return 'importantMoment';
  if (Object.keys(LOG_TYPES).includes(type)) {
    return type === 'log' ? 'dailyLog' : type;
  }
  if (type === 'dailyHabit') return 'dailyHabit'; // dailyCare collection = daily habits
  if (type === 'therapyNote') return 'therapyNote'; // therapyNotes collection = therapy notes
  // Removed legacy progressNote mapping - no longer used
  if (LEGACY_TO_ENTRY.has(type)) return 'dailyHabit';
  return type; // fallback
};

export const getEntryTypeMeta = (type) => {
  const normalized = mapLegacyType(type);
  const entryTypes = getEntryTypes();
  return entryTypes[normalized] || entryTypes.dailyLog;
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
