// Theme-driven timeline type metadata and helpers
import { getIncidentDisplayInfo, getJournalDisplayInfo, getDailyHabitsDisplayInfo } from './uiDisplayConstants';

// Dynamic function to get entry types with centralized labels
export const getEntryTypes = () => {
  const incidentDisplay = getIncidentDisplayInfo();
  const journalDisplay = getJournalDisplayInfo();
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
    journal: {
      key: 'journal',
      label: journalDisplay.label,
      icon: journalDisplay.emoji,
      paletteKey: 'timeline.entries.journal',
    },
    behavior: {
      key: 'behavior',
      label: 'Behavior',
      icon: '🌋',
      paletteKey: 'timeline.entries.behavior',
    },
    health: {
      key: 'health',
      label: 'Health',
      icon: '💊',
      paletteKey: 'timeline.entries.health',
    },
    mood: {
      key: 'mood',
      label: 'Mood',
      icon: '😰',
      paletteKey: 'timeline.entries.mood',
    },
    sleep: {
      key: 'sleep',
      label: 'Sleep',
      icon: '😴',
      paletteKey: 'timeline.entries.sleep',
    },
    food: {
      key: 'food',
      label: 'Food',
      icon: '🍽️',
      paletteKey: 'timeline.entries.food',
    },
    milestone: {
      key: 'milestone',
      label: 'Win',
      icon: '⭐',
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
  JOURNAL: 'journal',
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
  // - dailyLogs collection → 'journal' type
  // - therapyNotes collection → 'therapyNote' type
  
  if (type === 'incident') return 'incident';
  if (type === 'followUp') return 'incident'; // Follow-ups should display as incidents
  if (type === 'journal') return 'journal'; // dailyLogs collection = journal entries
  if (['behavior', 'health', 'mood', 'sleep', 'food', 'milestone', 'log'].includes(type)) {
    return type === 'log' ? 'journal' : type;
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
  return entryTypes[normalized] || entryTypes.journal; // Default to journal instead of removed dailyNote
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
