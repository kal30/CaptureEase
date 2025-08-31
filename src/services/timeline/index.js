import { getIncidents, getFollowUpResponses } from './incidentDataService';
import { getJournalEntries, getDailyLogEntries } from './journalDataService';
import { getDailyHabits } from './habitDataService';

/**
 * Main Timeline Service - Orchestrates data fetching from all timeline sources
 * This is the refactored version of unifiedTimelineService.js broken into modules
 */

/**
 * Get all timeline data for a specific child and date
 * Combines incidents, follow-ups, journal entries, and daily habits
 * @param {string} childId - Child ID
 * @param {Date} selectedDate - Date to fetch data for
 * @returns {Promise<Object>} - Object containing all timeline data arrays
 */
export const getTimelineData = async (childId, selectedDate) => {
  try {
    // Fetch all data sources in parallel for better performance
    const [
      incidents,
      followUpResponses, 
      journalEntries,
      dailyLogEntries,
      dailyHabits
    ] = await Promise.all([
      getIncidents(childId, selectedDate),
      getFollowUpResponses(childId, selectedDate),
      getJournalEntries(childId, selectedDate),
      getDailyLogEntries(childId, selectedDate),
      getDailyHabits(childId, selectedDate)
    ]);

    return {
      incidents,
      followUpResponses,
      journalEntries,
      dailyLogEntries,
      dailyHabits,
      totalEntries: incidents.length + followUpResponses.length + journalEntries.length + dailyLogEntries.length + dailyHabits.length
    };
  } catch (error) {
    console.error('Error fetching timeline data:', error);
    return {
      incidents: [],
      followUpResponses: [],
      journalEntries: [],
      dailyLogEntries: [],
      dailyHabits: [],
      totalEntries: 0
    };
  }
};

/**
 * Get combined and sorted timeline entries for display
 * @param {string} childId - Child ID
 * @param {Date} selectedDate - Date to fetch data for
 * @returns {Promise<Array>} - Sorted array of all timeline entries
 */
export const getCombinedTimelineEntries = async (childId, selectedDate) => {
  try {
    const data = await getTimelineData(childId, selectedDate);
    
    // Combine all entries
    const allEntries = [
      ...data.incidents,
      ...data.followUpResponses,
      ...data.journalEntries,
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
export { getIncidents, getFollowUpResponses } from './incidentDataService';
export { getJournalEntries, getDailyLogEntries } from './journalDataService';
export { getDailyHabits } from './habitDataService';
export { getDayDateRange } from './dateUtils';