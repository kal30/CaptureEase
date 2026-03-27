import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { getDayDateRange, isWithinDateRange } from './dateUtils';

const JOURNAL_CATEGORY_META = {
  behavior: { type: 'behavior', timelineType: 'behavior', titlePrefix: 'Behavior', color: '#D32F2F' },
  health: { type: 'health', timelineType: 'health', titlePrefix: 'Health', color: '#00796B' },
  mood: { type: 'mood', timelineType: 'mood', titlePrefix: 'Mood', color: '#F57F17' },
  sleep: { type: 'sleep', timelineType: 'sleep', titlePrefix: 'Sleep', color: '#1A237E' },
  food: { type: 'food', timelineType: 'food', titlePrefix: 'Food', color: '#E65100' },
  milestone: { type: 'milestone', timelineType: 'milestone', titlePrefix: 'Win', color: '#2E7D32' },
  log: { type: 'journal', timelineType: 'journal', titlePrefix: 'Daily Log' }
};

const mapJournalEntry = (doc) => {
  const data = doc.data();
  const categoryMeta = JOURNAL_CATEGORY_META[data.category] || JOURNAL_CATEGORY_META.log;

  return {
    id: doc.id,
    ...data,
    timestamp: data.timestamp?.toDate() || new Date(data.createdAt),
    type: categoryMeta.type,
    timelineType: categoryMeta.timelineType,
    collection: 'dailyLogs',
    titlePrefix: categoryMeta.titlePrefix,
    color: categoryMeta.color
  };
};

/**
 * Get journal entries (daily logs) for a specific child and date
 * @param {string} childId - Child ID
 * @param {Date} selectedDate - Date to fetch journals for
 * @returns {Promise<Array>} - Array of journal entry objects
 */
export const getJournalEntries = async (childId, selectedDate) => {
  try {
    const { start, end } = getDayDateRange(selectedDate);
    
    // Try the full query first, fallback if index missing
    try {
      const dailyLogQuery = query(
        collection(db, 'dailyLogs'),
        where('childId', '==', childId),
        where('status', '==', 'active'),
        where('timestamp', '>=', start),
        where('timestamp', '<=', end)
      );
      
      const snapshot = await getDocs(dailyLogQuery);
      return snapshot.docs
        .map(mapJournalEntry)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
    } catch (indexError) {
      if (indexError.message.includes('index')) {
        console.warn('🔥 Index missing for journals, using fallback query');
        
        // Fallback: get all journals for child and filter by date
        const fallbackQuery = query(
          collection(db, 'dailyLogs'),
          where('childId', '==', childId),
          where('status', '==', 'active')
        );
        
        const snapshot = await getDocs(fallbackQuery);
        return snapshot.docs
          .map(mapJournalEntry)
          .filter(entry => isWithinDateRange(entry.timestamp, start, end))
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
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
 * This handles the old structure where some journal data might be in different collections
 * @param {string} childId - Child ID
 * @param {Date} selectedDate - Date to fetch daily logs for
 * @returns {Promise<Array>} - Array of daily log objects
 */
export const getDailyLogEntries = async (childId, selectedDate) => {
  try {
    const { start, end } = getDayDateRange(selectedDate);
    
    // Fetch only from dailyLogs collection (progressNotes is legacy/unused)
    const collections = ['dailyLogs'];
    const allEntries = [];
    
    for (const collectionName of collections) {
      try {
        const entriesQuery = query(
          collection(db, collectionName),
          where('childId', '==', childId),
          where('timestamp', '>=', start),
          where('timestamp', '<=', end),
          orderBy('timestamp', 'desc')
        );
        
        const snapshot = await getDocs(entriesQuery);
        const entries = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(doc.data().createdAt),
          type: 'dailyLog',
          collection: collectionName
        }));
        
        allEntries.push(...entries);
      } catch (error) {
        // If index missing, try fallback for this collection
        if (error.message.includes('index')) {
          console.warn(`🔥 Index missing for ${collectionName}, using fallback`);
          
          const fallbackQuery = query(
            collection(db, collectionName),
            where('childId', '==', childId),
            orderBy('timestamp', 'desc')
          );
          
          const snapshot = await getDocs(fallbackQuery);
          const filteredEntries = snapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data(),
              timestamp: doc.data().timestamp?.toDate() || new Date(doc.data().createdAt),
              type: 'dailyLog',
              collection: collectionName
            }))
            .filter(entry => isWithinDateRange(entry.timestamp, start, end));
          
          allEntries.push(...filteredEntries);
        }
      }
    }
    
    return allEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (error) {
    console.error('Error fetching daily log entries:', error);
    return [];
  }
};
