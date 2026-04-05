import { auth, db } from "./firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

// Add a new medication for a child
export const addMedication = async (medicationData) => {
  try {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) {
      throw new Error("You must be signed in to add a medication.");
    }

    const docRef = await addDoc(collection(db, "medications"), {
      ...medicationData,
      createdBy: medicationData.createdBy || currentUserId,
      createdAt: medicationData.createdAt || serverTimestamp(),
      isArchived: medicationData.isArchived ?? false,
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding medication: ", e);
    throw e;
  }
};

// Fetch all medications for a specific child
export const fetchMedications = async (childId, includeArchived = false) => {
  try {
    let q = query(
      collection(db, "medications"),
      where("childId", "==", childId)
    );

    if (!includeArchived) {
      q = query(q, where("isArchived", "==", false));
    }

    const querySnapshot = await getDocs(q);
    const medications = [];
    querySnapshot.forEach((doc) => {
      medications.push({ id: doc.id, ...doc.data() });
    });
    return medications;
  } catch (e) {
    console.error("Error fetching medications: ", e);
    throw e;
  }
};

// Update an existing medication
export const updateMedication = async (medicationId, updatedData) => {
  try {
    const medicationRef = doc(db, "medications", medicationId);
    await updateDoc(medicationRef, updatedData);
  } catch (e) {
    console.error("Error updating medication: ", e);
    throw e;
  }
};

// Delete a medication
export const deleteMedication = async (medicationId) => {
  try {
    await deleteDoc(doc(db, "medications", medicationId));
  } catch (e) {
    console.error("Error deleting medication: ", e);
    throw e;
  }
};
