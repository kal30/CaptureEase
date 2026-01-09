import { db } from "./firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

/**
 * Medication Management Service
 * Manages daily medication registry stored in children/{childId}.medications array
 * These are the medications a child SHOULD take (reference data)
 * Actual doses taken are logged in the unified logs collection
 */

/**
 * Add a medication to a child's registry
 * @param {string} childId - Child document ID
 * @param {Object} medication - Medication details
 * @param {string} medication.name - Medication name
 * @param {string} medication.dosage - Dosage (e.g., "25 mcg")
 * @param {string} medication.frequency - Frequency (e.g., "once daily", "twice daily")
 * @param {Array<string>} medication.scheduledTimes - Times to take (e.g., ["08:00", "18:00"])
 * @param {string} [medication.notes] - Optional notes
 * @returns {Promise<string>} - Generated medication ID
 */
export const addMedication = async (childId, medication) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not logged in");
  }

  const childRef = doc(db, "children", childId);

  // Check if child exists
  const childDoc = await getDoc(childRef);
  if (!childDoc.exists()) {
    throw new Error(`Child document ${childId} not found`);
  }

  // Generate unique ID for medication
  const medicationId = `med_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const now = new Date().toISOString();
  const medicationData = {
    id: medicationId,
    name: medication.name,
    dosage: medication.dosage,
    frequency: medication.frequency,
    scheduledTimes: medication.scheduledTimes || [],
    active: true,
    startDate: now,
    endDate: null,
    notes: medication.notes || "",
    createdBy: user.uid,
    createdAt: now, // Use ISO string instead of serverTimestamp
  };

  await updateDoc(childRef, {
    medications: arrayUnion(medicationData),
    updatedBy: user.uid,
    updatedAt: serverTimestamp(),
  });

  return medicationId;
};

/**
 * Update a medication in a child's registry
 * @param {string} childId - Child document ID
 * @param {string} medicationId - Medication ID to update
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateMedication = async (childId, medicationId, updates) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not logged in");
  }

  const childRef = doc(db, "children", childId);
  const childDoc = await getDoc(childRef);

  if (!childDoc.exists()) {
    throw new Error(`Child document ${childId} not found`);
  }

  const childData = childDoc.data();
  const medications = childData.medications || [];

  // Find and update the medication
  const now = new Date().toISOString();
  const updatedMedications = medications.map(med => {
    if (med.id === medicationId) {
      return {
        ...med,
        ...updates,
        updatedBy: user.uid,
        updatedAt: now, // Use ISO string instead of serverTimestamp
      };
    }
    return med;
  });

  await updateDoc(childRef, {
    medications: updatedMedications,
    updatedBy: user.uid,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Mark a medication as inactive (discontinue)
 * @param {string} childId - Child document ID
 * @param {string} medicationId - Medication ID to discontinue
 * @returns {Promise<void>}
 */
export const discontinueMedication = async (childId, medicationId) => {
  await updateMedication(childId, medicationId, {
    active: false,
    endDate: new Date().toISOString(),
  });
};

/**
 * Remove a medication from a child's registry completely
 * @param {string} childId - Child document ID
 * @param {string} medicationId - Medication ID to remove
 * @returns {Promise<void>}
 */
export const removeMedication = async (childId, medicationId) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not logged in");
  }

  const childRef = doc(db, "children", childId);
  const childDoc = await getDoc(childRef);

  if (!childDoc.exists()) {
    throw new Error(`Child document ${childId} not found`);
  }

  const childData = childDoc.data();
  const medications = childData.medications || [];

  // Find the medication to remove
  const medicationToRemove = medications.find(med => med.id === medicationId);
  if (!medicationToRemove) {
    throw new Error(`Medication ${medicationId} not found`);
  }

  await updateDoc(childRef, {
    medications: arrayRemove(medicationToRemove),
    updatedBy: user.uid,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Get all medications for a child
 * @param {string} childId - Child document ID
 * @param {boolean} [activeOnly=true] - Whether to return only active medications
 * @returns {Promise<Array>} - Array of medications
 */
export const getMedications = async (childId, activeOnly = true) => {
  const childRef = doc(db, "children", childId);
  const childDoc = await getDoc(childRef);

  if (!childDoc.exists()) {
    throw new Error(`Child document ${childId} not found`);
  }

  const childData = childDoc.data();
  const medications = childData.medications || [];

  if (activeOnly) {
    return medications.filter(med => med.active);
  }

  return medications;
};

/**
 * Get a specific medication by ID
 * @param {string} childId - Child document ID
 * @param {string} medicationId - Medication ID
 * @returns {Promise<Object|null>} - Medication object or null if not found
 */
export const getMedicationById = async (childId, medicationId) => {
  const medications = await getMedications(childId, false); // Get all, including inactive
  return medications.find(med => med.id === medicationId) || null;
};
