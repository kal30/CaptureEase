import { getIncidents, getGroupedIncidents } from './incidentDataService';
import { getJournalEntries, getDailyLogEntries } from './journalDataService';
import { getDailyHabits } from './habitDataService';
import { getTherapyNotes } from './therapyNotesDataService';

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
    // Fetch grouped incidents and other data sources in parallel
    // Note: getJournalEntries and getDailyLogEntries both fetch from dailyLogs collection
    // so we only call getJournalEntries to avoid duplicates
    const [
      groupedIncidents,
      journalEntries,
      dailyHabits,
      therapyNotes
    ] = await Promise.all([
      getGroupedIncidents(childId, selectedDate),
      getJournalEntries(childId, selectedDate),
      getDailyHabits(childId, selectedDate),
      getTherapyNotes(childId, selectedDate)
    ]);

    return {
      incidents: groupedIncidents, // Now contains grouped incidents with follow-ups
      journalEntries,
      dailyLogEntries: [], // Empty to avoid duplicates - journalEntries contains the dailyLogs data
      dailyHabits,
      therapyNotes, // NEW: 4th timeline entry type
      totalEntries: groupedIncidents.length + journalEntries.length + dailyHabits.length + therapyNotes.length
    };
  } catch (error) {
    console.error('Error fetching timeline data:', error);
    return {
      incidents: [],
      journalEntries: [],
      dailyLogEntries: [],
      dailyHabits: [],
      therapyNotes: [], // NEW: Empty array for error case
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
    
    // Combine all entries - incidents now contain their follow-ups
    const allEntries = [
      ...data.incidents, // These are now grouped incidents with follow-ups
      ...data.journalEntries, // Contains dailyLogs data
      // ...data.dailyLogEntries, // Skip to avoid duplicates
      ...data.dailyHabits,
      ...data.therapyNotes // NEW: Include therapy notes in combined view
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
export { getJournalEntries, getDailyLogEntries } from './journalDataService';
export { getDailyHabits } from './habitDataService';
export { getTherapyNotes } from './therapyNotesDataService'; // NEW: Export therapy notes service
export { getDayDateRange } from './dateUtils';