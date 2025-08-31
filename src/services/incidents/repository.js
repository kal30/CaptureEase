import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { uploadIncidentMedia } from '../../components/Dashboard/Incidents/Media/mediaUploadService';
import { calculateFollowUpTimes } from './followUpScheduler';
import { writeBatch } from 'firebase/firestore';

// Enhanced incident creation with smart follow-up scheduling
export const createIncidentWithSmartFollowUp = async (
  childId,
  incidentData,
  scheduleFollowUp = true,
  childName = 'child'
) => {
  try {
    let followUpData = {
      followUpScheduled: false,
      followUpTime: null,
      followUpTimes: [],
      nextFollowUpIndex: 0,
    };

    if (scheduleFollowUp && incidentData.remedy && incidentData.remedy.trim()) {
      const followUpSchedule = calculateFollowUpTimes(
        incidentData.type,
        incidentData.severity,
        incidentData.remedy,
        incidentData.customIncidentName
      );

      followUpData = {
        followUpScheduled: true,
        followUpTime: followUpSchedule.nextFollowUp.timestamp,
        followUpTimes: followUpSchedule.times,
        nextFollowUpIndex: 0,
        totalFollowUps: followUpSchedule.totalFollowUps,
        followUpDescription: followUpSchedule.nextFollowUp.description,
      };
    }

    const docData = {
      childId,
      type: incidentData.type,
      customIncidentName: incidentData.customIncidentName || '',
      severity: incidentData.severity,
      remedy: incidentData.remedy,
      customRemedy: incidentData.customRemedy || '',
      notes: incidentData.notes || '',
      timestamp: incidentData.incidentDateTime || serverTimestamp(),
      entryDate: incidentData.incidentDateTime
        ? incidentData.incidentDateTime.toDateString()
        : new Date().toDateString(),
      authorId: incidentData.authorId,
      authorName: incidentData.authorName,
      authorEmail: incidentData.authorEmail,
      ...followUpData,
      effectiveness: null,
      followUpCompleted: false,
      followUpResponses: [],
      mediaUrls: [],
      hasMedia: !!(incidentData.mediaFile || incidentData.audioBlob),
    };

    const docRef = await addDoc(collection(db, 'incidents'), docData);

    if (incidentData.mediaFile || incidentData.audioBlob) {
      try {
        const mediaUrls = await uploadIncidentMedia(
          incidentData.mediaFile,
          incidentData.audioBlob,
          docRef.id
        );

        if (mediaUrls.length > 0) {
          await updateDoc(doc(db, 'incidents', docRef.id), {
            mediaUrls,
          });
        }
      } catch (mediaError) {
        console.error('Media upload failed, but incident was saved:', mediaError);
      }
    }

    if (followUpData.followUpScheduled) {
      try {
        const { scheduleAllFollowUpNotifications, requestNotificationPermission } = await import(
          '../followUpService'
        );

        const hasPermission = await requestNotificationPermission();

        if (hasPermission) {
          const incidentForNotification = {
            id: docRef.id,
            ...docData,
            followUpTimes: followUpData.followUpTimes,
          };

          scheduleAllFollowUpNotifications(incidentForNotification, childName);
        }
      } catch (error) {
        console.error('Error scheduling notifications:', error);
      }
    }

    return {
      id: docRef.id,
      followUpScheduled: followUpData.followUpScheduled,
      nextFollowUpTime: followUpData.followUpTime,
      followUpDescription: followUpData.followUpDescription,
    };
  } catch (error) {
    console.error('Error creating incident with smart follow-up:', error);
    throw error;
  }
};

// Get custom categories for a child
export const getCustomCategories = async (childId) => {
  try {
    const q = query(
      collection(db, 'children', childId, 'customIncidentCategories'),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const categories = {};

    querySnapshot.docs.forEach((d) => {
      categories[d.data().key] = {
        id: d.id,
        ...d.data(),
      };
    });

    return categories;
  } catch (error) {
    console.error('Error fetching custom categories:', error);
    return {};
  }
};

export const addIncident = async (childId, incidentData) => {
  try {
    const docData = {
      childId,
      type: incidentData.type,
      customIncidentName: incidentData.customIncidentName || '',
      severity: incidentData.severity,
      remedy: incidentData.remedy,
      customRemedy: incidentData.customRemedy || '',
      notes: incidentData.notes || '',
      timestamp: incidentData.incidentDateTime || serverTimestamp(),
      entryDate: incidentData.incidentDateTime
        ? incidentData.incidentDateTime.toDateString()
        : new Date().toDateString(),
      authorId: incidentData.authorId,
      authorName: incidentData.authorName,
      authorEmail: incidentData.authorEmail,
      followUpScheduled: incidentData.followUpScheduled || false,
      followUpTime: incidentData.followUpTime || null,
      effectiveness: null,
      followUpCompleted: false,
    };
    const docRef = await addDoc(collection(db, 'incidents'), docData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding incident:', error);
    throw error;
  }
};

export const updateIncidentEffectiveness = async (
  incidentId,
  effectiveness,
  followUpNotes = ''
) => {
  try {
    const incidentRef = doc(db, 'incidents', incidentId);
    await updateDoc(incidentRef, {
      effectiveness,
      followUpNotes,
      followUpCompleted: true,
      followUpTimestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating incident effectiveness:', error);
    throw error;
  }
};

export const recordFollowUpResponse = async (
  incidentId,
  effectiveness,
  followUpNotes = '',
  responseIndex = 0
) => {
  try {
    const incidentRef = doc(db, 'incidents', incidentId);
    const incidentDoc = await getDoc(incidentRef);
    if (!incidentDoc.exists()) throw new Error('Incident not found');

    const incident = incidentDoc.data();
    const responses = incident.followUpResponses || [];
    const newResponse = {
      effectiveness,
      notes: followUpNotes,
      timestamp: new Date(),
      responseIndex,
      intervalMinutes: incident.followUpTimes?.[responseIndex]?.intervalMinutes || 0,
    };
    responses.push(newResponse);

    const nextIndex = responseIndex + 1;
    const hasMoreFollowUps = incident.followUpTimes && nextIndex < incident.followUpTimes.length;

    const updateData = {
      followUpResponses: responses,
      lastFollowUpResponse: newResponse,
      lastFollowUpTimestamp: serverTimestamp(),
      ...(hasMoreFollowUps
        ? {
            followUpTime: incident.followUpTimes[nextIndex].timestamp,
            nextFollowUpIndex: nextIndex,
            followUpDescription: incident.followUpTimes[nextIndex].description,
          }
        : {
            followUpCompleted: true,
            effectiveness,
            followUpNotes,
          }),
    };

    await updateDoc(incidentRef, updateData);

    if (!hasMoreFollowUps) {
      try {
        const { cancelFollowUpNotifications } = await import('../followUpService');
        cancelFollowUpNotifications(incidentId);
      } catch (error) {
        console.error('Error cancelling notifications:', error);
      }
    }

    return {
      hasMoreFollowUps,
      nextFollowUpTime: hasMoreFollowUps ? incident.followUpTimes[nextIndex].timestamp : null,
      nextFollowUpDescription: hasMoreFollowUps ? incident.followUpTimes[nextIndex].description : null,
      totalResponses: responses.length,
      totalFollowUps: incident.followUpTimes?.length || 1,
    };
  } catch (error) {
    console.error('Error recording follow-up response:', error);
    throw error;
  }
};

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

export const getIncidents = async (childId, startDate = null, endDate = null) => {
  try {
    let q = query(
      collection(db, 'incidents'),
      where('childId', '==', childId),
      orderBy('timestamp', 'desc')
    );
    if (startDate) q = query(q, where('timestamp', '>=', startDate));
    if (endDate) q = query(q, where('timestamp', '<=', endDate));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error fetching incidents:', error);
    throw error;
  }
};

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

