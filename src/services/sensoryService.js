// src/services/sensoryService.js
import { collection, addDoc, getDocs, query } from "firebase/firestore";
import { db } from "./firebase"; // Adjust the path if necessary

// Fetch all sensory options from the 'sensory_inputs' collection
export const fetchSensoryOptions = async () => {
  const sensoryOptionsQuery = query(collection(db, "sensory_inputs"));
  const querySnapshot = await getDocs(sensoryOptionsQuery);

  const sensoryOptions = querySnapshot.docs.map((doc) => doc.data().input);
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
