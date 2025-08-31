import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const logMood = async (childId, mood) => {
  try {
    await addDoc(collection(db, "children", childId, "moodLogs"), {
      childId: childId,
      mood: mood,
      timestamp: serverTimestamp(),
    });
    console.log("Mood logged successfully");
  } catch (error) {
    console.error("Error logging mood: ", error);
    throw error;
  }
};
