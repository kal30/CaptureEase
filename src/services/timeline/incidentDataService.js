import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { getDayDateRange, isWithinDateRange } from './dateUtils';

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
        type: 'incident',
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
            type: 'incident',
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
 * Get follow-up responses from completed incidents
 * Follow-ups are stored within incident documents, not as separate documents
 * @param {string} childId - Child ID
 * @param {Date} selectedDate - Date to fetch follow-ups for
 * @returns {Promise<Array>} - Array of follow-up response objects
 */
export const getFollowUpResponses = async (childId, selectedDate) => {
  try {
    const { start, end } = getDayDateRange(selectedDate);
    
    // Get all incidents for child that have any follow-up responses
    // (Not just completed ones, so we can show partial follow-up progress)
    const incidentsQuery = query(
      collection(db, 'incidents'),
      where('childId', '==', childId)
    );
    
    const snapshot = await getDocs(incidentsQuery);
    const followUpResponses = [];
    
    snapshot.docs.forEach(doc => {
      const incident = doc.data();
      const responses = incident.followUpResponses || [];
      
      // Skip incidents that don't have any follow-up responses yet
      if (!responses || responses.length === 0) return;
      
      responses.forEach((response, index) => {
        const responseTimestamp = response.timestamp?.toDate ? 
          response.timestamp.toDate() : 
          new Date(response.timestamp);
        
        // Only include responses that fall within the selected date
        if (isWithinDateRange(responseTimestamp, start, end)) {
          followUpResponses.push({
            id: `${doc.id}-followup-${index}`,
            incidentId: doc.id,
            incidentType: incident.type,
            customIncidentName: incident.customIncidentName,
            originalSeverity: incident.severity,
            effectiveness: response.effectiveness,
            notes: response.notes,
            timestamp: responseTimestamp,
            intervalMinutes: response.intervalMinutes,
            responseIndex: response.responseIndex || index,
            type: 'followUp',
            collection: 'followUpResponses',
            childId: childId // Ensure childId is set
          });
        }
      });
    });
    
    return followUpResponses.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (error) {
    console.error('Error fetching follow-up responses:', error);
    return [];
  }
};