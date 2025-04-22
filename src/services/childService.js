import { db } from "./firebase"; // Import initialized Firestore
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";

// Fetch all children
export const getChildren = async () => {
  const snapshot = await getDocs(collection(db, "children"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const fetchChildName = async (childId) => {
  const childRef = doc(db, "children", childId);
  const childSnap = await getDoc(childRef);

  if (childSnap.exists()) {
    return childSnap.data().name; // Return the child's name
  } else {
    throw new Error("No such document!"); // Handle the case where the document doesn't exist
  }
};

// Add a new child
export const addChild = async (childData) => {
  const docRef = await addDoc(collection(db, "children"), childData);
  return docRef.id;
};

// Update child's caregiver
export const assignCaregiver = async (childId, caregiverData) => {
  const childRef = doc(db, "children", childId);
  await updateDoc(childRef, { caregiver: caregiverData });
};
