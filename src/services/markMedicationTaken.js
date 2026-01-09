import { db } from "./firebase";
import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

/**
 * Mark a medication as taken - Creates a log entry in the unified logs collection
 * @param {Object} params
 * @param {string} params.childId - Child document ID
 * @param {string} params.medicationId - Medication ID from child's medication registry
 * @param {string} params.medicationName - Name of the medication
 * @param {string} params.dosage - Dosage taken
 * @param {Date} [params.timeStart] - When medication was taken (defaults to now)
 * @param {string} [params.note] - Optional note
 * @param {boolean} [params.takenStatus] - Whether the medication is marked as taken
 * @returns {Promise<string>} - Log entry ID
 */
export const markMedicationTaken = async ({
  childId,
  medicationId,
  medicationName,
  dosage,
  timeStart = new Date(),
  note = "",
  takenStatus = true,
}) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not logged in");
  }

  // Create log entry
  const logData = {
    childId,
    type: "medication",
    subType: medicationName,
    timeStart: Timestamp.fromDate(timeStart),
    timeEnd: null,
    note: note || `${medicationName} ${dosage}`,
    meta: {
      dosage,
      medicationId, // Link back to medication registry
      takenStatus,
    },
    status: "active",
    createdBy: user.uid,
    createdAt: serverTimestamp(),
    updatedBy: user.uid,
    updatedAt: serverTimestamp(),
  };

  const logsRef = collection(db, "logs");
  const docRef = await addDoc(logsRef, logData);

  return docRef.id;
};
