import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
// moved to ./repository/create
import { createIncidentWithSmartFollowUp } from './repository/create';
// import { writeBatch } from 'firebase/firestore'; // unused
import {
  recordFollowUpResponse,
  getFollowUpSummary,
  forceCompleteFollowUp,
  getIncidentsPendingFollowUp,
} from './repository/followUps';
import { getIncidents } from './repository/queries';

// re-exported at bottom

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

// Re-export moved functions to keep public API stable
export { createIncidentWithSmartFollowUp };
export { recordFollowUpResponse, getFollowUpSummary, forceCompleteFollowUp, getIncidentsPendingFollowUp, getIncidents };
