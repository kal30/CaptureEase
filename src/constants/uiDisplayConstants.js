// UI Display Constants for consistent labeling across components
// This centralizes display labels that appear in multiple UI locations

export const UI_LABELS = {
  INCIDENT_SECTION: {
    emoji: "⚡",
    label: "Important Moment",
    description: "Log behaviors, challenges, or milestones",
    pluralLabel: "Important Moments", // For filters and headers
    pluralLabelLowercase: "important moments", // For inline text
  },

  // Future: could add other UI sections here
  JOURNAL_SECTION: {
    emoji: "📒",
    label: "Journaling",
    description: "Rich daily journal with photos, videos & templates",
  },

  DAILY_HABITS_SECTION: {
    emoji: "📅",
    label: "Daily Habits",
    description: "Track mood, sleep, nutrition, progress, and other daily care data",
  },

  MEDICATION_SECTION: {
    emoji: "💊",
    label: "Medication",
    description: "Log medication given",
  },

  DIAPER_SECTION: {
    emoji: "💩",
    label: "Diaper",
    description: "Log diaper changes and results",
  },

  Messages: {
    emoji: "💬",
    label: "Messages",
    description: "Securely communicate with your care team",
  },
};

// Helper functions to get display info
export const getIncidentDisplayInfo = () => UI_LABELS.INCIDENT_SECTION;
export const getMessagesDisplayInfo = () => UI_LABELS.Messages;
export const getJournalDisplayInfo = () => UI_LABELS.JOURNAL_SECTION;
export const getDailyHabitsDisplayInfo = () => UI_LABELS.DAILY_HABITS_SECTION;
export const getMedicationDisplayInfo = () => UI_LABELS.MEDICATION_SECTION;
export const getDiaperDisplayInfo = () => UI_LABELS.DIAPER_SECTION;
