import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const logMood = async (childId, mood) => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated to log mood');
    }

    // Use top-level dailyCare collection instead of child subcollection
    await addDoc(collection(db, "dailyCare"), {
      // Required fields for Firestore rules
      childId,
      createdBy: currentUser.uid,
      createdAt: serverTimestamp(),
      
      // DailyCare standard fields
      actionType: 'mood',
      data: { 
        level: mood,
        source: 'moodService'
      },
      completedBy: currentUser.uid,
      timestamp: serverTimestamp(),
      date: new Date().toDateString(),
      
      // Status for soft delete system
      status: 'active'
    });
    
    console.log("Mood logged successfully to dailyCare collection");
  } catch (error) {
    console.error("Error logging mood: ", error);
    throw error;
  }
};