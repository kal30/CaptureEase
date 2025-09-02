import { onSnapshot, query, where, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// Store for active follow-up listeners
const activeListeners = new Map();

const cleanupAllListeners = () => {
  activeListeners.forEach((unsubscribe, childId) => {
    try {
      unsubscribe();
    } catch (error) {
      console.error(`Error cleaning up listener for child ${childId}:`, error);
    }
  });
  activeListeners.clear();
};

// Listen for incidents that need follow-up
export const listenForFollowUps = (childrenIds, onFollowUpNeeded) => {
  cleanupAllListeners();

  childrenIds.forEach((childId) => {
    const q = query(
      collection(db, 'incidents'),
      where('childId', '==', childId),
      where('followUpScheduled', '==', true),
      where('followUpCompleted', '==', false)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        snapshot.docs.forEach((doc) => {
          const incident = { id: doc.id, ...doc.data() };

          const followUpTime = incident.followUpTime?.toDate?.() || new Date(incident.followUpTime);
          const now = new Date();

          if (now >= followUpTime) {
            const enhancedIncident = {
              ...incident,
              currentFollowUpIndex: incident.nextFollowUpIndex || 0,
              totalFollowUps: incident.followUpTimes?.length || 1,
              isMultiStage: (incident.followUpTimes?.length || 0) > 1,
              followUpDescription:
                incident.followUpDescription || `Check on ${incident.customIncidentName || 'incident'}`,
            };
            onFollowUpNeeded(enhancedIncident);
          }
        });
      },
      (error) => {
        console.error('Error listening for follow-ups:', error);
      }
    );

    activeListeners.set(childId, unsubscribe);
  });

  return () => cleanupAllListeners();
};

// Manual check for overdue follow-ups
export const checkOverdueFollowUps = async (childrenIds) => {
  const overdueIncidents = [];

  for (const childId of childrenIds) {
    try {
      const q = query(
        collection(db, 'incidents'),
        where('childId', '==', childId),
        where('followUpScheduled', '==', true),
        where('followUpCompleted', '==', false)
      );

      const snapshot = await getDocs(q);

      snapshot.docs.forEach((doc) => {
        const incident = { id: doc.id, ...doc.data() };
        const followUpTime = incident.followUpTime?.toDate?.() || new Date(incident.followUpTime);
        const now = new Date();

        if (now >= followUpTime) {
          const enhancedIncident = {
            ...incident,
            currentFollowUpIndex: incident.nextFollowUpIndex || 0,
            totalFollowUps: incident.followUpTimes?.length || 1,
            isMultiStage: (incident.followUpTimes?.length || 0) > 1,
            followUpDescription:
              incident.followUpDescription || `Check on ${incident.customIncidentName || 'incident'}`,
          };
          overdueIncidents.push(enhancedIncident);
        }
      });
    } catch (error) {
      console.error(`Error checking follow-ups for child ${childId}:`, error);
    }
  }

  return overdueIncidents;
};

