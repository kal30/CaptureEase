// src/services/sensoryService.js
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  query,
  where,
  orderBy, // Make sure to import orderBy
} from "firebase/firestore";
import { db } from "./firebase"; // Adjust the path if necessary

// Fetch all sensory options from the 'sensory_inputs' collection
export const fetchSensoryLogs = async (childId) => {
  if (!childId) throw new Error("childId is required to fetch sensory logs");

  const sensoryOptionsQuery = query(
    collection(db, "children", childId, "sensory_logs"),
    orderBy("timestamp", "desc") // Assuming you want the logs ordered by timestamp
  );
  const querySnapshot = await getDocs(sensoryOptionsQuery);

  const sensoryOptions = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return sensoryOptions;
};

// Add a new sensory log for a specific child
export const addSensoryLog = async (childId, sensoryInputs) => {
  await addDoc(collection(db, `children/${childId}/sensory_logs`), {
    sensoryInputs: sensoryInputs,
    timestamp: new Date(),
  });
};

// Add a new sensory input to the 'sensory_inputs' collection if it doesn't exist
export const addNewSensoryInput = async (input) => {
  await addDoc(collection(db, "sensory_inputs"), { input });
};

// Delete a sensory log for a specific child
export const deleteSensoryLog = async (childId, logId) => {
  const logRef = doc(db, `children/${childId}/sensory_logs`, logId);
  await deleteDoc(logRef);
};
