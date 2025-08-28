/**
 * Configuration for dashboard action groups.
 * @param {import('@mui/material').Theme} theme - The MUI theme object.
 * @returns {function(string): Array<object>} A function that takes a user role and returns the appropriate action groups.
 */
export const getActionGroups = (theme) => (userRole) => {
  const USER_ROLES = {
    PRIMARY_PARENT: 'primary_parent',
    CO_PARENT: 'co_parent',
    FAMILY_MEMBER: 'family_member',
    CAREGIVER: 'caregiver',
    THERAPIST: 'therapist',
  };

  const parentGroups = [
    {
      id: 'daily_care',
      title: 'Daily Care',
      icon: '💜',
      color: theme.palette.dailyCare.primary, // Themed color
      tooltip: 'Essential daily wellness tracking for mood, sleep, energy and health',
      actions: [
        { key: 'mood', label: 'Mood Check', icon: '😊', types: ['mood_log'], trackingType: 'daily' },
        { key: 'sleep', label: 'Sleep Quality', icon: '😴', types: ['sleep_log'], trackingType: 'daily' },
        { key: 'incident', label: 'Log Incident', icon: '🚨', types: ['incident_log'], trackingType: 'task' },
        { key: 'food_health', label: 'Food & Medicine', icon: '🍎', types: ['food_log', 'medication_log', 'medical_event'], trackingType: 'daily' },
        { key: 'safety', label: 'Safety Check', icon: '🛡️', types: ['safety_log'], trackingType: 'task' },
      ],
    },
    {
      id: 'behavior_progress',
      title: 'Behavior & Progress',
      icon: '🧠',
      color: theme.palette.tertiary.dark, // Themed color
      tooltip: 'Track behavioral patterns, sensory responses, and developmental progress',
      actions: [
        { key: 'daily', label: 'Daily Notes', icon: '📝', types: ['daily_note'], trackingType: 'daily' },
        { key: 'behavior_sensory', label: 'Behavior & Sensory', icon: '🧠', types: ['behavior', 'sensory_log'], trackingType: 'task' },
        { key: 'progress', label: 'Progress Review', icon: '📈', types: ['progress_note'], trackingType: 'task' },
      ],
    },
    {
      id: 'planning_reminders',
      title: 'Planning & Reminders',
      icon: '🌸',
      color: theme.palette.calendar.accent, // Themed color (was coral pink)
      tooltip: 'Organize schedules, coordinate with team, and manage shared access',
      actions: [
        { key: 'routines', label: 'Schedule & Appointments', icon: '📅', types: ['routine', 'appointment'], trackingType: 'task' },
        { key: 'notes', label: 'Team Notes', icon: '📋', types: ['caregiver_note'], trackingType: 'task' },
        { key: 'access', label: 'Share Access', icon: '👥', types: ['access_management'], trackingType: 'task' },
      ],
    },
  ];

  const therapistGroups = [
    {
      id: 'professional_tools',
      title: 'Professional Tools',
      icon: '🩺',
      color: theme.palette.secondary.main, // Themed color (was slate blue)
      tooltip: 'Clinical assessment tools and professional documentation',
      actions: [
        { key: 'professional_note', label: 'Clinical Notes', icon: '📝', trackingType: 'task' },
        { key: 'timeline', label: 'View Timeline', icon: '📈', trackingType: 'task' },
        { key: 'report', label: 'Generate Report', icon: '📊', trackingType: 'task' },
      ],
    },
  ];

  if (userRole === USER_ROLES.THERAPIST) {
    return therapistGroups;
  }
  
  return parentGroups;
};
