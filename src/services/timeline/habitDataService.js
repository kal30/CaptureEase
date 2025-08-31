import { getDayDateRange, isWithinDateRange } from './dateUtils';
import { getHabitEntries } from '../habitService';

/**
 * Get daily habit entries for a specific child and date
 * This fetches from mood, sleep, food, and custom habit logs
 * @param {string} childId - Child ID
 * @param {Date} selectedDate - Date to fetch habits for
 * @returns {Promise<Array>} - Array of habit entry objects
 */
export const getDailyHabits = async (childId, selectedDate) => {
  try {
    const { start, end } = getDayDateRange(selectedDate);
    
    // Use the existing habitService to get all habit entries
    const habitEntries = await getHabitEntries(childId, start, end);
    
    // Transform the data to match timeline format and ensure childId is set
    return habitEntries.map(entry => ({
      ...entry,
      childId: childId, // Ensure childId is explicitly set
      type: 'dailyHabit',
      timestamp: entry.timestamp?.toDate ? entry.timestamp.toDate() : new Date(entry.timestamp)
    }));
    
  } catch (error) {
    console.error('Error fetching daily habits:', error);
    return [];
  }
};