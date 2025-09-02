import followUpConfig from '../config/followUpSchedules.json';

/**
 * Configuration-driven Follow-up Scheduling Service
 * Makes it easy to adjust follow-up timing without code changes
 */

/**
 * Validate configuration on load
 */
const validateConfig = () => {
  const requiredTypes = ['sensory', 'behavioral', 'other'];
  const missingTypes = requiredTypes.filter(type => !followUpConfig[type]);
  
  if (missingTypes.length > 0) {
    console.error('Missing required incident types in config:', missingTypes);
  }
  
  // Validate each type has required schedules
  Object.entries(followUpConfig).forEach(([type, config]) => {
    if (!config.name || !config.schedules) {
      console.error(`Invalid config for incident type: ${type}`);
    }
  });
};

// Validate config on import
validateConfig();

/**
 * Get follow-up schedule for incident type and severity
 * @param {string} incidentType - Type of incident (sensory, behavioral, etc.)
 * @param {number} severity - Severity level 1-10
 * @param {string} remedy - Applied remedy (unused in config-driven approach)
 * @param {string} customIncidentName - Custom name for incident
 * @returns {Array} Array of intervals in minutes
 */
export const getFollowUpSchedule = (incidentType, severity, remedy = '', customIncidentName = '') => {
  // Get config for incident type, fallback to 'other'
  const typeConfig = followUpConfig[incidentType] || followUpConfig.other;
  
  // Special handling for sleep (time-based logic)
  if (incidentType === 'sleep') {
    const now = new Date();
    const currentHour = now.getHours();
    const isNightTime = currentHour >= 19 || currentHour <= 6;
    
    const scheduleKey = isNightTime ? 'night_time' : 'day_time';
    const schedule = typeConfig.schedules[scheduleKey];
    
    return {
      intervals: schedule.intervals,
      description: schedule.description
    };
  }
  
  // Severity-based logic for other incident types
  let scheduleKey;
  if (severity >= 8) {
    scheduleKey = 'severity_8_plus';
  } else if (severity >= 5) {
    scheduleKey = 'severity_5_7';
  } else {
    scheduleKey = 'severity_below_5';
  }
  
  const schedule = typeConfig.schedules[scheduleKey];
  if (!schedule) {
    console.warn(`No schedule found for ${incidentType} severity ${severity}, using default`);
    return {
      intervals: [120], // Default 2-hour follow-up
      description: 'incident follow-up'
    };
  }
  
  return {
    intervals: schedule.intervals,
    description: customIncidentName ? `${customIncidentName} (${schedule.description})` : schedule.description
  };
};

/**
 * Calculate follow-up times based on configuration
 * @param {string} incidentType - Type of incident
 * @param {number} severity - Severity level
 * @param {string} remedy - Applied remedy
 * @param {string} customIncidentName - Custom incident name
 * @returns {Object} Follow-up schedule with timestamps
 */
export const calculateFollowUpTimes = (incidentType, severity, remedy, customIncidentName = '') => {
  const { intervals, description } = getFollowUpSchedule(incidentType, severity, remedy, customIncidentName);
  
  const now = new Date();
  const followUpTimes = intervals.map((minutes) => {
    const followUpTime = new Date(now.getTime() + minutes * 60000);
    return {
      timestamp: followUpTime,
      intervalMinutes: minutes,
      description: `Check on ${customIncidentName || description}`,
    };
  });

  return {
    times: followUpTimes,
    nextFollowUp: followUpTimes[0],
    totalFollowUps: followUpTimes.length,
  };
};

/**
 * Format follow-up schedule for display
 * @param {string} incidentType - Type of incident
 * @param {number} severity - Severity level
 * @param {string} remedy - Applied remedy
 * @param {string} customIncidentName - Custom incident name
 * @returns {string} Formatted schedule string
 */
export const formatFollowUpSchedule = (incidentType, severity, remedy, customIncidentName = '') => {
  const { intervals } = getFollowUpSchedule(incidentType, severity, remedy, customIncidentName);
  
  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}min`;
    if (minutes < 1440) return `${Math.round(minutes / 60)}hr`;
    return `${Math.round(minutes / 1440)}day`;
  };

  return intervals.map(formatTime).join(', ');
};

/**
 * Get all available incident types from configuration
 * @returns {Array} Array of incident type configs
 */
export const getAvailableIncidentTypes = () => {
  return Object.entries(followUpConfig).map(([key, config]) => ({
    id: key,
    name: config.name,
    schedules: Object.keys(config.schedules)
  }));
};

/**
 * Update configuration at runtime (for admin interface later)
 * @param {string} incidentType - Type to update
 * @param {string} scheduleKey - Schedule to update
 * @param {Array} intervals - New intervals
 */
export const updateScheduleConfig = (incidentType, scheduleKey, intervals) => {
  console.warn('Runtime config updates not implemented yet - modify followUpSchedules.json');
  // TODO: Implement runtime updates when admin interface is needed
};