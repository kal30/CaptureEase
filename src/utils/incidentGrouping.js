/**
 * Incident Grouping Utilities - KISS approach
 * Simple, focused functions for grouping incidents with follow-ups
 */

/**
 * Calculate time elapsed between two dates
 * @param {Date} startTime - Original incident time
 * @param {Date} followUpTime - Follow-up response time
 * @returns {string} - Human readable time elapsed
 */
export const calculateTimeElapsed = (startTime, followUpTime) => {
  const diffMs = followUpTime - startTime;
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  
  if (diffMinutes < 60) {
    return `${diffMinutes}min later`;
  }
  if (diffHours < 24) {
    return `${diffHours}hr later`;
  }
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}day${diffDays > 1 ? 's' : ''} later`;
};

/**
 * Create a grouped incident entry with its follow-ups
 * @param {Object} incident - Original incident
 * @param {Array} followUps - Array of follow-up responses for this incident
 * @returns {Object} - Grouped incident with follow-ups
 */
export const createIncidentGroup = (incident, followUps) => {
  const sortedFollowUps = followUps
    .map(followUp => ({
      ...followUp,
      timeElapsed: calculateTimeElapsed(incident.timestamp, followUp.timestamp),
      isFollowUp: true,
      parentIncidentId: incident.id
    }))
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  return {
    ...incident,
    isGroupedIncident: true,
    followUps: sortedFollowUps,
    totalFollowUps: sortedFollowUps.length
  };
};

/**
 * Group timeline entries - incidents with their follow-ups
 * @param {Array} incidents - Array of incident entries
 * @param {Array} followUps - Array of follow-up entries
 * @returns {Array} - Array of grouped incident entries
 */
export const groupIncidentsWithFollowUps = (incidents, followUps) => {
  // Create a map of incident ID to follow-ups
  const followUpMap = followUps.reduce((map, followUp) => {
    const incidentId = followUp.incidentId;
    if (!map[incidentId]) {
      map[incidentId] = [];
    }
    map[incidentId].push(followUp);
    return map;
  }, {});

  // Group incidents with their follow-ups
  return incidents.map(incident => {
    const incidentFollowUps = followUpMap[incident.id] || [];
    return createIncidentGroup(incident, incidentFollowUps);
  });
};

/**
 * Get effectiveness display info
 * @param {string} effectiveness - Effectiveness rating ('not_effective', 'somewhat', 'completely')
 * @returns {Object} - Display info with emoji and color
 */
export const getEffectivenessDisplay = (effectiveness) => {
  const effectivenessMap = {
    'not_effective': { stars: '😔', color: '#f44336', label: 'Not Effective' },
    'somewhat': { stars: '😐', color: '#ff9800', label: 'Somewhat Effective' },
    'completely': { stars: '😊', color: '#4caf50', label: 'Completely Effective' }
  };
  
  return effectivenessMap[effectiveness] || 
         { stars: '❓', color: '#666', label: 'Invalid effectiveness value' };
};