import { db } from './firebase';  // Import initialized Firestore
import { collection, getDocs, addDoc } from 'firebase/firestore';

// Fetch all caregivers
export const getCaregivers = async () => {
  const snapshot = await getDocs(collection(db, 'caregivers'));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Add a new caregiver
export const addCaregiver = async (caregiverData) => {
  const docRef = await addDoc(collection(db, 'caregivers'), caregiverData);
  return docRef.id;
};