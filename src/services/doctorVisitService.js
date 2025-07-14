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

// Add a new doctor visit for a child
export const addDoctorVisit = async (visitData) => {
  try {
    const docRef = await addDoc(collection(db, "doctorVisits"), visitData);
    return docRef.id;
  } catch (e) {
    console.error("Error adding doctor visit: ", e);
    throw e;
  }
};

// Fetch all doctor visits for a specific child
export const fetchDoctorVisits = async (childId) => {
  try {
    const q = query(
      collection(db, "doctorVisits"),
      where("childId", "==", childId)
    );
    const querySnapshot = await getDocs(q);
    const visits = [];
    querySnapshot.forEach((doc) => {
      visits.push({ id: doc.id, ...doc.data() });
    });
    return visits;
  } catch (e) {
    console.error("Error fetching doctor visits: ", e);
    throw e;
  }
};

// Update an existing doctor visit
export const updateDoctorVisit = async (visitId, updatedData) => {
  try {
    const visitRef = doc(db, "doctorVisits", visitId);
    await updateDoc(visitRef, updatedData);
  } catch (e) {
    console.error("Error updating doctor visit: ", e);
    throw e;
  }
};

// Delete a doctor visit
export const deleteDoctorVisit = async (visitId) => {
  try {
    await deleteDoc(doc(db, "doctorVisits", visitId));
  } catch (e) {
    console.error("Error deleting doctor visit: ", e);
    throw e;
  }
};
