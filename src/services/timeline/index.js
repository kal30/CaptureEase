import { getIncidents, getGroupedIncidents } from './incidentDataService';
import { getDailyLogEntries } from './dailyLogDataService';
import { getDailyHabits } from './habitDataService';

/**
 * Main Timeline Service - Orchestrates data fetching from all timeline sources
 * This is the refactored version of unifiedTimelineService.js broken into modules
 */

/**
 * Get grouped timeline data for a specific child and date
 * Uses grouped incidents that combine incidents with their follow-ups
 * @param {string} childId - Child ID
 * @param {Date} selectedDate - Date to fetch data for
 * @returns {Promise<Object>} - Object containing all timeline data arrays
 */
export const getTimelineData = async (childId, selectedDate) => {
  try {
    const [
      groupedIncidents,
      dailyLogEntries,
      dailyHabits
    ] = await Promise.all([
      getGroupedIncidents(childId, selectedDate),
      getDailyLogEntries(childId, selectedDate),
      getDailyHabits(childId, selectedDate)
    ]);

    return {
      incidents: groupedIncidents, // Now contains grouped incidents with follow-ups
      dailyLogEntries,
      dailyHabits,
      therapyNotes: [],
      totalEntries: groupedIncidents.length + dailyLogEntries.length + dailyHabits.length
    };
  } catch (error) {
    console.error('Error fetching timeline data:', error);
    return {
      incidents: [],
      dailyLogEntries: [],
      dailyHabits: [],
      therapyNotes: [],
      totalEntries: 0
    };
  }
};


/**
 * Get combined and sorted timeline entries for display
 * Now uses grouped incidents (incidents contain their follow-ups)
 * @param {string} childId - Child ID
 * @param {Date} selectedDate - Date to fetch data for
 * @returns {Promise<Array>} - Sorted array of all timeline entries
 */
export const getCombinedTimelineEntries = async (childId, selectedDate) => {
  try {
    const data = await getTimelineData(childId, selectedDate);
    
    const allEntries = [
      ...data.incidents,
      ...data.dailyLogEntries,
      ...data.dailyHabits
    ];
    
    // Sort by timestamp (newest first)
    return allEntries.sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error getting combined timeline entries:', error);
    return [];
  }
};

// Re-export individual services for direct use if needed
export { getIncidents, getGroupedIncidents } from './incidentDataService';
export { getDailyLogEntries } from './dailyLogDataService';
export { getDailyHabits } from './habitDataService';
export { getDayDateRange } from './dateUtils';
