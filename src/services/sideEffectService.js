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

// Add a new side effect for a medication
export const addSideEffect = async (sideEffectData) => {
  try {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) {
      throw new Error("You must be signed in to add a side effect.");
    }

    const docRef = await addDoc(collection(db, "sideEffects"), {
      ...sideEffectData,
      childId: sideEffectData.childId,
      createdBy: sideEffectData.createdBy || currentUserId,
      createdAt: sideEffectData.createdAt || serverTimestamp(),
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding side effect: ", e);
    throw e;
  }
};

// Fetch all side effects for a specific medication
export const fetchSideEffects = async (childId, medicationId) => {
  try {
    const q = query(
      collection(db, "sideEffects"),
      where("childId", "==", childId),
      where("medicationId", "==", medicationId)
    );
    const querySnapshot = await getDocs(q);
    const sideEffects = [];
    querySnapshot.forEach((doc) => {
      sideEffects.push({ id: doc.id, ...doc.data() });
    });
    return sideEffects;
  } catch (e) {
    console.error("Error fetching side effects: ", e);
    throw e;
  }
};

// Update an existing side effect
export const updateSideEffect = async (sideEffectId, updatedData) => {
  try {
    const sideEffectRef = doc(db, "sideEffects", sideEffectId);
    await updateDoc(sideEffectRef, {
      ...updatedData,
      createdBy: updatedData.createdBy || auth.currentUser?.uid,
      createdAt: updatedData.createdAt || serverTimestamp(),
    });
  } catch (e) {
    console.error("Error updating side effect: ", e);
    throw e;
  }
};

// Delete a side effect
export const deleteSideEffect = async (sideEffectId) => {
  try {
    await deleteDoc(doc(db, "sideEffects", sideEffectId));
  } catch (e) {
    console.error("Error deleting side effect: ", e);
    throw e;
  }
};
