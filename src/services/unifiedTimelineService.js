import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Unified Timeline Service - Fetches data from all sources for timeline
 * Combines incidents, journal entries, daily logs, and follow-ups
 */

/**
 * Get date range for a specific day
 * @param {Date} date - Target date
 * @returns {Object} - { start: Date, end: Date }
 */
const getDayDateRange = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
};

/**
 * Get incidents for a specific child and date
 * @param {string} childId - Child ID
 * @param {Date} selectedDate - Date to fetch incidents for
 * @returns {Promise<Array>} - Array of incident objects
 */
export const getIncidents = async (childId, selectedDate) => {
  try {
    const { start, end } = getDayDateRange(selectedDate);
    
    console.log('Fetching incidents for:', {
      childId,
      selectedDate: selectedDate.toDateString(),
      dateRange: { start: start.toISOString(), end: end.toISOString() }
    });
    
    // Try the full query first, fallback if index missing
    try {
      const incidentsQuery = query(
        collection(db, 'incidents'),
        where('childId', '==', childId),
        where('timestamp', '>=', start),
        where('timestamp', '<=', end),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(incidentsQuery);
      const incidents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(doc.data().createdAt)
      }));
      
      console.log('Found incidents:', incidents.length, incidents);
      return incidents;
      
    } catch (indexError) {
      if (indexError.message.includes('index')) {
        console.warn('🔥 Index missing for incidents, using fallback query');
        
        // Fallback: Query by childId only, then filter client-side
        const fallbackQuery = query(
          collection(db, 'incidents'),
          where('childId', '==', childId)
        );
        
        const snapshot = await getDocs(fallbackQuery);
        const allIncidents = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(doc.data().createdAt)
        }));
        
        // Filter client-side by date range
        const filteredIncidents = allIncidents.filter(entry => {
          const entryDate = entry.timestamp;
          return entryDate >= start && entryDate <= end;
        }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        console.log('Found incidents (fallback):', filteredIncidents.length, filteredIncidents);
        return filteredIncidents;
      } else {
        throw indexError;
      }
    }
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return [];
  }
};

/**
 * Get journal entries for a specific child and date
 * @param {string} childId - Child ID
 * @param {Date} selectedDate - Date to fetch journal entries for
 * @returns {Promise<Array>} - Array of journal entry objects
 */
export const getJournalEntries = async (childId, selectedDate) => {
  try {
    const { start, end } = getDayDateRange(selectedDate);
    
    console.log('Fetching journal entries for:', {
      childId,
      selectedDate: selectedDate.toDateString(),
      dateRange: { start: start.toISOString(), end: end.toISOString() }
    });
    
    // Try the full query first, fallback if index missing
    // NOTE: Progress notes are stored as subcollections under each child
    try {
      const progressNotesQuery = query(
        collection(db, 'children', childId, 'progressNotes'),
        where('date', '>=', start),
        where('date', '<=', end),
        orderBy('date', 'desc')
      );

      const snapshot = await getDocs(progressNotesQuery);
      const progressNotes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().date?.toDate() || doc.data().timestamp?.toDate() || new Date(doc.data().createdAt)
      }));
      
      console.log('Found progress notes:', progressNotes.length, progressNotes);
      return progressNotes;
      
    } catch (indexError) {
      if (indexError.message.includes('index')) {
        console.warn('🔥 Index missing for progress notes, using fallback query');
        
        // Fallback: Query subcollection without date filter
        const fallbackQuery = query(
          collection(db, 'children', childId, 'progressNotes')
        );
        
        const snapshot = await getDocs(fallbackQuery);
        const allProgressNotes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().date?.toDate() || doc.data().timestamp?.toDate() || new Date(doc.data().createdAt)
        }));
        
        // Filter client-side by date range
        const filteredProgressNotes = allProgressNotes.filter(entry => {
          const entryDate = entry.timestamp;
          return entryDate >= start && entryDate <= end;
        }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        console.log('Found progress notes (fallback):', filteredProgressNotes.length, filteredProgressNotes);
        return filteredProgressNotes;
      } else {
        throw indexError;
      }
    }
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return [];
  }
};

/**
 * Get daily log entries for a specific child and date
 * @param {string} childId - Child ID
 * @param {Date} selectedDate - Date to fetch daily logs for
 * @returns {Promise<Array>} - Array of daily log objects
 */
export const getDailyLogEntries = async (childId, selectedDate) => {
  try {
    const { start, end } = getDayDateRange(selectedDate);
    
    console.log('Fetching daily log entries for:', {
      childId,
      selectedDate: selectedDate.toDateString(),
      dateRange: { start: start.toISOString(), end: end.toISOString() }
    });
    
    // Try the full query first, fallback if index missing
    // NOTE: Daily logs are stored in the top-level dailyLogs collection (DailyLogFeed)
    try {
      const dailyLogQuery = query(
        collection(db, 'dailyLogs'),
        where('childId', '==', childId),
        where('timestamp', '>=', start),
        where('timestamp', '<=', end),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(dailyLogQuery);
      const dailyLogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(doc.data().createdAt)
      }));
      
      console.log('Found daily log entries:', dailyLogs.length, dailyLogs);
      
      // Additional debugging: show raw document data
      snapshot.docs.forEach((doc, index) => {
        console.log(`Daily log ${index + 1} raw data:`, doc.data());
      });
      
      return dailyLogs;
      
    } catch (indexError) {
      if (indexError.message.includes('index')) {
        console.warn('🔥 Index missing for daily logs, using fallback query');
        
        // Fallback: Query top-level collection without date filter
        const fallbackQuery = query(
          collection(db, 'dailyLogs'),
          where('childId', '==', childId)
        );
        
        const snapshot = await getDocs(fallbackQuery);
        const allDailyLogs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(doc.data().createdAt)
        }));
        
        // Filter client-side by date range
        const filteredDailyLogs = allDailyLogs.filter(entry => {
          const entryDate = entry.timestamp;
          return entryDate >= start && entryDate <= end;
        }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        console.log('Found daily log entries (fallback):', filteredDailyLogs.length, filteredDailyLogs);
        
        // Additional debugging: show raw document data
        filteredDailyLogs.forEach((entry, index) => {
          console.log(`Daily log ${index + 1} raw data (fallback):`, entry);
        });
        
        return filteredDailyLogs;
      } else {
        throw indexError;
      }
    }
  } catch (error) {
    console.error('Error fetching daily log entries:', error);
    return [];
  }
};

/**
 * Get follow-up responses for a specific child and date
 * @param {string} childId - Child ID
 * @param {Date} selectedDate - Date to fetch follow-ups for
 * @returns {Promise<Array>} - Array of follow-up objects
 */
export const getFollowUpResponses = async (childId, selectedDate) => {
  try {
    const { start, end } = getDayDateRange(selectedDate);
    
    console.log('Fetching follow-up responses for:', {
      childId,
      selectedDate: selectedDate.toDateString(),
      dateRange: { start: start.toISOString(), end: end.toISOString() }
    });

    // Try the full query first, fallback to simpler queries if index missing
    try {
      const followUpQuery = query(
        collection(db, 'followUpResponses'),
        where('childId', '==', childId),
        where('timestamp', '>=', start),
        where('timestamp', '<=', end),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(followUpQuery);
      const followUps = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(doc.data().createdAt)
      }));
      
      console.log('Found follow-up responses:', followUps.length, followUps);
      return followUps;
      
    } catch (indexError) {
      if (indexError.message.includes('index')) {
        console.warn('🔥 Index missing for follow-ups, using fallback query');
        
        // Fallback: Query by childId only, then filter client-side
        const fallbackQuery = query(
          collection(db, 'followUpResponses'),
          where('childId', '==', childId)
        );
        
        const snapshot = await getDocs(fallbackQuery);
        const allFollowUps = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(doc.data().createdAt)
        }));
        
        // Filter client-side by date range
        const filteredFollowUps = allFollowUps.filter(entry => {
          const entryDate = entry.timestamp;
          return entryDate >= start && entryDate <= end;
        }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        console.log('Found follow-up responses (fallback):', filteredFollowUps.length, filteredFollowUps);
        return filteredFollowUps;
      } else {
        throw indexError;
      }
    }
  } catch (error) {
    console.error('Error fetching follow-up responses:', error);
    return [];
  }
};

/**
 * Get all timeline data for a specific child and date
 * @param {string} childId - Child ID
 * @param {Date} selectedDate - Date to fetch data for
 * @returns {Promise<Object>} - Object with all timeline data types
 */
export const getAllTimelineData = async (childId, selectedDate) => {
  try {
    // Fetch all data types in parallel
    const [incidents, journals, dailyLogs, followUps] = await Promise.all([
      getIncidents(childId, selectedDate),
      getJournalEntries(childId, selectedDate),
      getDailyLogEntries(childId, selectedDate),
      getFollowUpResponses(childId, selectedDate)
    ]);

    return {
      incidents,
      journals,
      dailyLogs,
      followUps,
      totalEntries: incidents.length + journals.length + dailyLogs.length + followUps.length
    };
  } catch (error) {
    console.error('Error fetching all timeline data:', error);
    throw error;
  }
};

/**
 * Get timeline data summary for a date range
 * Useful for showing activity indicators on calendar
 * @param {string} childId - Child ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} - Summary data by date
 */
export const getTimelineDataSummary = async (childId, startDate, endDate) => {
  try {
    // This would be implemented to get summary data for calendar indicators
    // For now, return empty object
    return {};
  } catch (error) {
    console.error('Error fetching timeline data summary:', error);
    return {};
  }
};

const unifiedTimelineService = {
  getIncidents,
  getJournalEntries,
  getDailyLogEntries,
  getFollowUpResponses,
  getAllTimelineData,
  getTimelineDataSummary
};

export default unifiedTimelineService;