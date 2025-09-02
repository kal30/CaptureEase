import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore';
import { db } from '../../firebase';

// Record a follow-up response and update scheduling state transactionally
export const recordFollowUpResponse = async (
  incidentId,
  effectiveness,
  followUpNotes = '',
  responseIndex = 0
) => {
  try {
    const incidentRef = doc(db, 'incidents', incidentId);

    const result = await runTransaction(db, async (tx) => {
      const snap = await tx.get(incidentRef);
      if (!snap.exists()) throw new Error('Incident not found');

      const incident = snap.data() || {};
      const followUpTimes = Array.isArray(incident.followUpTimes)
        ? incident.followUpTimes
        : [];

      const currentIndex = Number.isInteger(responseIndex)
        ? responseIndex
        : (incident.nextFollowUpIndex ?? 0);

      const responses = Array.isArray(incident.followUpResponses)
        ? [...incident.followUpResponses]
        : [];

      const newResponse = {
        effectiveness,
        notes: followUpNotes,
        timestamp: new Date(),
        responseIndex: currentIndex,
        intervalMinutes: followUpTimes?.[currentIndex]?.intervalMinutes || 0,
      };

      responses.push(newResponse);

      const nextIndex = currentIndex + 1;
      const hasMoreFollowUps = followUpTimes && nextIndex < followUpTimes.length;

      const updateData = {
        followUpResponses: responses,
        lastFollowUpResponse: newResponse,
        lastFollowUpTimestamp: serverTimestamp(),
        ...(hasMoreFollowUps
          ? {
              followUpTime: followUpTimes[nextIndex]?.timestamp || null,
              nextFollowUpIndex: nextIndex,
              followUpDescription: followUpTimes[nextIndex]?.description || null,
            }
          : {
              followUpCompleted: true,
            }),
      };

      tx.update(incidentRef, updateData);

      return {
        hasMoreFollowUps,
        nextFollowUpTime: hasMoreFollowUps ? followUpTimes[nextIndex]?.timestamp || null : null,
        nextFollowUpDescription: hasMoreFollowUps ? followUpTimes[nextIndex]?.description || null : null,
        totalResponses: responses.length,
        totalFollowUps: followUpTimes?.length || 1,
      };
    });

    if (!result.hasMoreFollowUps) {
      try {
        const { cancelFollowUpNotifications } = await import('../../followUpService');
        cancelFollowUpNotifications(incidentId);
      } catch (error) {
        console.error('Error cancelling notifications:', error);
      }
    }

    return result;
  } catch (error) {
    console.error('Error recording follow-up response:', error);
    throw error;
  }
};

// Summarize follow-up progress for an incident
export const getFollowUpSummary = async (incidentId) => {
  try {
    const incidentDoc = await getDocs(
      query(collection(db, 'incidents'), where('__name__', '==', incidentId))
    );
    if (incidentDoc.empty) return null;
    const incident = incidentDoc.docs[0].data();
    const responses = incident.followUpResponses || [];

    return {
      totalScheduled: incident.followUpTimes?.length || 0,
      totalResponses: responses.length,
      completed: incident.followUpCompleted || false,
      responses: responses.map((r) => ({
        effectiveness: r.effectiveness,
        notes: r.notes,
        intervalMinutes: r.intervalMinutes,
        timestamp: r.timestamp,
      })),
      finalEffectiveness: incident.effectiveness,
      nextFollowUpDue: incident.followUpCompleted ? null : incident.followUpTime,
    };
  } catch (error) {
    console.error('Error getting follow-up summary:', error);
    return null;
  }
};

// Force-complete all remaining follow-ups and cancel notifications
export const forceCompleteFollowUp = async (incidentId) => {
  try {
    const incidentRef = doc(db, 'incidents', incidentId);
    await updateDoc(incidentRef, {
      followUpCompleted: true,
      followUpTime: null,
      nextFollowUpIndex: null,
      followUpDescription: null,
    });

    try {
      const { cancelFollowUpNotifications } = await import('../../followUpService');
      cancelFollowUpNotifications(incidentId);
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  } catch (error) {
    console.error('Error force completing follow-up:', error);
    throw error;
  }
};

// Query incidents that still need follow-up (scheduled and not completed, with remaining stages)
export const getIncidentsPendingFollowUp = async (childId) => {
  try {
    const q = query(
      collection(db, 'incidents'),
      where('childId', '==', childId),
      where('followUpScheduled', '==', true),
      where('followUpCompleted', '==', false)
    );
    const querySnapshot = await getDocs(q);
    const incidents = querySnapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((incident) => {
        if (!incident.followUpTime) return false;
        if (incident.followUpTimes && incident.followUpTimes.length > 0) {
          const currentIndex = incident.nextFollowUpIndex || 0;
          const hasMoreStages = currentIndex < incident.followUpTimes.length;
          if (!hasMoreStages) return false;
        }
        return true;
      });
    return incidents;
  } catch (error) {
    console.error('Error fetching incidents pending follow-up:', error);
    throw error;
  }
};

