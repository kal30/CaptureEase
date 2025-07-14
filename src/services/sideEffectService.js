import { db } from "./firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

// Add a new side effect for a medication
export const addSideEffect = async (sideEffectData) => {
  try {
    const docRef = await addDoc(collection(db, "sideEffects"), sideEffectData);
    return docRef.id;
  } catch (e) {
    console.error("Error adding side effect: ", e);
    throw e;
  }
};

// Fetch all side effects for a specific medication
export const fetchSideEffects = async (medicationId) => {
  try {
    const q = query(
      collection(db, "sideEffects"),
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
    await updateDoc(sideEffectRef, updatedData);
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
