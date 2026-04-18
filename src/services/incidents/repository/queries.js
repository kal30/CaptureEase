import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { getCalendarDateKey } from '../../../utils/calendarDateKey';

const normalizeIncidentDate = (incident = {}) => (
  incident.timestamp?.toDate?.()
  || incident.timestamp
  || incident.createdAt?.toDate?.()
  || incident.createdAt
  || incident.entryDate
  || null
);

export const getIncidents = async (childId, startDate = null, endDate = null) => {
  try {
    const q = query(
      collection(db, 'incidents'),
      where('childId', '==', childId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .map((d) => ({
        id: d.id,
        ...d.data(),
        timestamp: normalizeIncidentDate(d.data()),
      }))
      .filter((incident) => {
        const incidentDate = normalizeIncidentDate(incident);
        if (!incidentDate) {
          return false;
        }

        if (startDate && getCalendarDateKey(incidentDate) < getCalendarDateKey(startDate)) {
          return false;
        }

        if (endDate && getCalendarDateKey(incidentDate) > getCalendarDateKey(endDate)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const aDate = normalizeIncidentDate(a);
        const bDate = normalizeIncidentDate(b);
        return (bDate?.getTime?.() || 0) - (aDate?.getTime?.() || 0);
      });
  } catch (error) {
    console.error('Error fetching incidents:', error);
    throw error;
  }
};
