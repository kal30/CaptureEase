import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  updateDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from "firebase/firestore";

// Save a daily care entry
export const saveDailyCareEntry = async (entryData) => {
  try {
    const { childId, actionType, data, completedBy } = entryData;
    
    // Create the entry document
    const entry = {
      childId,
      actionType,
      data,
      completedBy,
      timestamp: serverTimestamp(),
      date: new Date().toDateString(), // For daily tracking
      createdAt: serverTimestamp(),
    };

    // Save to daily care collection
    const docRef = await addDoc(collection(db, "dailyCare"), entry);
    
    // Also save to child's timeline for historical tracking
    await addDoc(collection(db, "children", childId, "timeline"), {
      type: `daily_${actionType}`,
      title: getActionTitle(actionType),
      data: data,
      timestamp: serverTimestamp(),
      category: 'daily_care',
      importance: 'normal',
    });

    console.log(`${actionType} entry saved successfully with ID:`, docRef.id);
    return docRef.id;
  } catch (error) {
    console.error(`Error saving daily care entry:`, error);
    throw error;
  }
};

// Get today's completion status for a child
export const getTodayCompletionStatus = async (childId) => {
  try {
    const today = new Date().toDateString();
    const q = query(
      collection(db, "dailyCare"),
      where("childId", "==", childId),
      where("date", "==", today)
    );

    const querySnapshot = await getDocs(q);
    const completedActions = {};

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      completedActions[data.actionType] = true;
    });

    return completedActions;
  } catch (error) {
    console.error("Error getting today's completion status:", error);
    throw error;
  }
};

// Get recent daily care entries for a child
export const getRecentDailyCareEntries = async (childId, days = 7) => {
  try {
    const q = query(
      collection(db, "dailyCare"),
      where("childId", "==", childId),
      orderBy("timestamp", "desc"),
      limit(days * 5) // Roughly 5 entries per day max
    );

    const querySnapshot = await getDocs(q);
    const entries = [];

    querySnapshot.forEach((doc) => {
      entries.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return entries;
  } catch (error) {
    console.error("Error getting recent daily care entries:", error);
    throw error;
  }
};

// Get completion statistics for a date range
export const getCompletionStats = async (childId, startDate, endDate) => {
  try {
    const q = query(
      collection(db, "dailyCare"),
      where("childId", "==", childId),
      where("timestamp", ">=", startDate),
      where("timestamp", "<=", endDate)
    );

    const querySnapshot = await getDocs(q);
    const stats = {
      mood: 0,
      sleep: 0,
      energy: 0,
      food_health: 0,
      safety: 0,
      totalDays: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)),
    };

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (stats[data.actionType] !== undefined) {
        stats[data.actionType]++;
      }
    });

    // Calculate completion rates
    stats.completionRates = {};
    Object.keys(stats).forEach(key => {
      if (key !== 'totalDays' && key !== 'completionRates') {
        stats.completionRates[key] = Math.round((stats[key] / stats.totalDays) * 100);
      }
    });

    return stats;
  } catch (error) {
    console.error("Error getting completion stats:", error);
    throw error;
  }
};

// Helper function to get action titles
const getActionTitle = (actionType) => {
  const titles = {
    mood: 'Mood Check',
    sleep: 'Sleep Quality',
    energy: 'Energy Level',
    food_health: 'Food & Medicine',
    safety: 'Safety Check',
  };
  return titles[actionType] || actionType;
};

// Update an existing daily care entry
export const updateDailyCareEntry = async (entryId, updateData) => {
  try {
    const docRef = doc(db, "dailyCare", entryId);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });

    console.log("Daily care entry updated successfully");
    return true;
  } catch (error) {
    console.error("Error updating daily care entry:", error);
    throw error;
  }
};