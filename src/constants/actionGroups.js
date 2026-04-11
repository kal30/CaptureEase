import { getIncidentDisplayInfo, getMessagesDisplayInfo } from './uiDisplayConstants';
import { USER_ROLES } from './roles';

/**
 * Configuration for dashboard action groups.
 * @param {import('@mui/material').Theme} theme - The MUI theme object.
 * @returns {function(string): Array<object>} A function that takes a user role and returns the appropriate action groups.
 */
export const getActionGroups = (theme) => (userRole) => {
  // Get centralized display info
  const incidentDisplay = getIncidentDisplayInfo();
  const messagesDisplay = getMessagesDisplayInfo();
  
  // USER_ROLES imported from constants/roles.js

  const parentGroups = [
    {
      id: 'daily_progress_timeline',
      title: 'Daily Progress & Timeline',
      icon: '📊',
      color: theme.palette.primary.main, // Primary themed color for prominence
      tooltip: 'View daily progress, timeline overview, and track patterns over time',
      actions: [
        { key: 'timeline', label: 'View Timeline', icon: '📈', types: ['timeline_view'], trackingType: 'view', description: 'See daily activity timeline' },
        { key: 'progress', label: 'Progress Review', icon: '📊', types: ['progress_note'], trackingType: 'task', description: 'Review developmental progress' },
        { key: 'daily_summary', label: 'Therapy Prep', icon: '📋', types: ['daily_summary'], trackingType: 'view', description: 'Prepare notes for therapy and specialist visits' },
      ],
    },
    {
      id: 'daily_care',
      title: 'Daily Care',
      icon: '💜',
      color: theme.palette.dailyCare.primary, // Themed color
      tooltip: `Essential daily tracking with notes, ${incidentDisplay.pluralLabelLowercase}, health and safety`,
      actions: [
        { key: 'dailyLog', label: 'Daily Log', icon: '💬', types: ['daily_log_entry'], trackingType: 'daily', description: 'Free-form notes and thoughts' },
        { key: 'incident', label: `Log ${incidentDisplay.label}`, icon: incidentDisplay.emoji, types: ['incident_log'], trackingType: 'task' },
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
        { key: 'behavior_sensory', label: 'Behavior & Sensory', icon: '🧠', types: ['behavior', 'sensory_log'], trackingType: 'task' },
      ],
    },
    {
      id: 'planning_reminders',
      title: 'Planning & Reminders',
      icon: '🌸',
      color: theme.palette.calendar.accent, // Themed color (was coral pink)
      tooltip: 'Organize schedules, coordinate with team, and manage shared access',
      actions: [
        { key: 'messages', label: messagesDisplay.label, icon: messagesDisplay.emoji, types: ['messages'], trackingType: 'navigation', description: messagesDisplay.description },
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
