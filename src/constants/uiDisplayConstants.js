// UI Display Constants for consistent labeling across components
// This centralizes display labels that appear in multiple UI locations

export const UI_LABELS = {
  INCIDENT_SECTION: {
    emoji: '⚡',
    label: 'Important Moment',
    description: 'Log behaviors, challenges, or milestones',
    pluralLabel: 'Important Moments', // For filters and headers
    pluralLabelLowercase: 'important moments', // For inline text
  },
  
  // Future: could add other UI sections here
  JOURNAL_SECTION: {
    emoji: '💬',
    label: 'Journaling',
    description: 'Rich daily journal with photos, videos & templates',
  },
  
  DAILY_HABITS_SECTION: {
    emoji: '📅', 
    label: 'Daily Habits',
    description: 'Track mood, sleep, nutrition, progress & quick notes',
  },
};

// Helper function to get incident display info
export const getIncidentDisplayInfo = () => UI_LABELS.INCIDENT_SECTION;