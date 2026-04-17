import { db } from "./firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const buildMoodDocId = (childId, date = new Date()) => {
  const calendarDate = date instanceof Date ? date : new Date(date);
  const year = calendarDate.getFullYear();
  const month = String(calendarDate.getMonth() + 1).padStart(2, '0');
  const day = String(calendarDate.getDate()).padStart(2, '0');

  return `mood_${childId}_${year}-${month}-${day}`;
};

export const logMood = async (childId, mood) => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated to log mood');
    }

    const now = new Date();
    const moodDocId = buildMoodDocId(childId, now);

    // Use a deterministic per-day document so rapid taps update the current mood
    await setDoc(doc(db, "dailyCare", moodDocId), {
      // Required fields for Firestore rules
      childId,
      createdBy: currentUser.uid,
      createdAt: serverTimestamp(),
      type: 'mood',
      value: mood,
      
      // DailyCare standard fields
      actionType: 'mood',
      data: { 
        level: mood,
        value: mood,
        source: 'moodService'
      },
      completedBy: currentUser.uid,
      timestamp: serverTimestamp(),
      date: now.toDateString(),
      moodDateKey: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
      moodDocId,
      
      // Status for soft delete system
      status: 'active'
    }, { merge: true });
    
    console.log("Mood logged successfully to dailyCare collection");
  } catch (error) {
    console.error("Error logging mood: ", error);
    throw error;
  }
};
