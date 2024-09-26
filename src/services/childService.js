import { db } from './firebase';  // Import initialized Firestore
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';

// Fetch all children
export const getChildren = async () => {
  const snapshot = await getDocs(collection(db, 'children'));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Add a new child
export const addChild = async (childData) => {
  const docRef = await addDoc(collection(db, 'children'), childData);
  return docRef.id;
};

// Update child's caregiver
export const assignCaregiver = async (childId, caregiverData) => {
  const childRef = doc(db, 'children', childId);
  await updateDoc(childRef, { caregiver: caregiverData });
};