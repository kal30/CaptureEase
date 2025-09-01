import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { getDayDateRange, isWithinDateRange } from './dateUtils';
import { calculateTimeElapsed } from '../../utils/incidentGrouping';

/**
 * Get incidents for a specific child and date
 * @param {string} childId - Child ID
 * @param {Date} selectedDate - Date to fetch incidents for
 * @returns {Promise<Array>} - Array of incident objects
 */
export const getIncidents = async (childId, selectedDate) => {
  try {
    const { start, end } = getDayDateRange(selectedDate);
    
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
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(doc.data().createdAt),
        timelineType: 'incident', // Keep timeline type separate from incident type
        collection: 'incidents'
      }));
      
    } catch (indexError) {
      if (indexError.message.includes('index')) {
        console.warn('🔥 Index missing for incidents, using fallback query');
        
        // Fallback: get all incidents for child and filter by date
        const fallbackQuery = query(
          collection(db, 'incidents'),
          where('childId', '==', childId),
          orderBy('timestamp', 'desc')
        );
        
        const snapshot = await getDocs(fallbackQuery);
        return snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date(doc.data().createdAt),
            timelineType: 'incident', // Keep timeline type separate from incident type
            collection: 'incidents'
          }))
          .filter(incident => isWithinDateRange(incident.timestamp, start, end));
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
 * Get grouped incidents with their follow-ups for timeline display
 * This combines incidents and their follow-up responses into grouped entries
 * @param {string} childId - Child ID
 * @param {Date} selectedDate - Date to fetch data for
 * @returns {Promise<Array>} - Array of grouped incident objects with follow-ups
 */
export const getGroupedIncidents = async (childId, selectedDate) => {
  try {
    // Get all incidents for the day
    const incidentsForDay = await getIncidents(childId, selectedDate);
    
    // Transform incidents to show their embedded follow-ups
    const groupedIncidents = incidentsForDay.map(incident => {
      const followUpResponses = incident.followUpResponses || [];
      
      // If incident has follow-ups, mark it as grouped and transform follow-ups
      if (followUpResponses.length > 0) {
        const transformedFollowUps = followUpResponses.map((response, index) => ({
          id: `${incident.id}-followup-${index}`,
          effectiveness: response.effectiveness,
          notes: response.notes,
          timestamp: response.timestamp?.toDate ? response.timestamp.toDate() : new Date(response.timestamp),
          intervalMinutes: response.intervalMinutes || 0,
          responseIndex: response.responseIndex || index,
          timeElapsed: calculateTimeElapsed(incident.timestamp, response.timestamp?.toDate ? response.timestamp.toDate() : new Date(response.timestamp))
        }));
        
        return {
          ...incident,
          isGroupedIncident: true,
          followUps: transformedFollowUps,
          totalFollowUps: transformedFollowUps.length
        };
      }
      
      return incident;
    });
    
    return groupedIncidents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (error) {
    console.error('Error fetching grouped incidents:', error);
    return [];
  }
};

