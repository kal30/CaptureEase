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

/**
 * Habit Service - Comprehensive daily habit tracking with rich data
 * Integrates with existing timeline and daily care systems
 * Supports: mood, sleep, nutrition, progress, and custom habits
 */

// Map our habit types to existing Firebase collections
const HABIT_COLLECTION_MAP = {
  mood: 'moodLogs',
  sleep: 'sleepLogs', 
  nutrition: 'foodLogs',
  progress: 'progressNotes',
  other: 'customHabits' // New collection for custom habits
};

/**
 * Save a habit entry with rich data (level, notes, media)
 * @param {Object} habitEntry - The habit entry data
 * @param {string} habitEntry.childId - Child ID
 * @param {string} habitEntry.categoryId - Habit category ID (mood, sleep, etc.)
 * @param {string} habitEntry.categoryLabel - Display label
 * @param {number} habitEntry.level - 1-10 scale value
 * @param {Date} habitEntry.date - Entry date
 * @param {string} habitEntry.notes - Rich text notes
 * @param {File} habitEntry.mediaFile - Optional media attachment
 * @param {Blob} habitEntry.audioBlob - Optional audio recording
 * @param {Date} habitEntry.timestamp - Entry timestamp
 * @param {Object} habitEntry.customHabit - Custom habit data (if applicable)
 */
export const saveHabitEntry = async (habitEntry) => {
  try {
    const { 
      childId, 
      categoryId, 
      categoryLabel, 
      level, 
      date, 
      notes, 
      mediaFile, 
      audioBlob, 
      timestamp,
      customHabit
    } = habitEntry;

    // Get the appropriate collection name
    const collectionName = HABIT_COLLECTION_MAP[categoryId] || 'customHabits';
    
    // Create the base entry
    const entry = {
      categoryId,
      categoryLabel,
      level,
      date: date.toDateString(), // For daily queries
      notes: notes || '',
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp(),
      // Legacy compatibility fields
      ...(categoryId === 'mood' && { mood: level }),
      ...(categoryId === 'sleep' && { sleepQuality: level, sleepHours: level }),
      ...(categoryId === 'nutrition' && { nutritionLevel: level }),
      ...(categoryId === 'progress' && { progressLevel: level }),
      // Custom habit data
      ...(customHabit && { customHabit })
    };

    // TODO: Handle media uploads to Firebase Storage
    if (mediaFile) {
      // entry.mediaUrl = await uploadMediaFile(mediaFile, childId);
      console.log('Media file upload not yet implemented:', mediaFile.name);
    }

    if (audioBlob) {
      // entry.audioUrl = await uploadAudioBlob(audioBlob, childId);
      console.log('Audio blob upload not yet implemented');
    }

    // Save to child-specific collection
    const docRef = await addDoc(
      collection(db, "children", childId, collectionName), 
      entry
    );

    // Also save to dailyCare for compatibility with existing dashboard
    await saveToDailyCare(childId, categoryId, level, timestamp);

    console.log(`Habit entry (${categoryLabel}) saved successfully with ID:`, docRef.id);
    return docRef.id;

  } catch (error) {
    console.error(`Error saving habit entry:`, error);
    throw error;
  }
};

/**
 * Save to daily care for dashboard compatibility
 */
const saveToDailyCare = async (childId, categoryId, level, timestamp) => {
  try {
    // Map habit categories to daily care action types
    const actionTypeMap = {
      mood: 'mood',
      sleep: 'sleep', 
      nutrition: 'food_health',
      progress: 'mood', // Map progress to mood for now
      other: 'mood' // Map custom to mood for now
    };

    const actionType = actionTypeMap[categoryId];
    if (!actionType) return;

    const entry = {
      childId,
      actionType,
      data: { level, source: 'habits' },
      completedBy: 'current_user', // TODO: Get actual user ID
      timestamp: serverTimestamp(),
      date: new Date().toDateString()
    };

    await addDoc(collection(db, "dailyCare"), entry);
  } catch (error) {
    console.error('Error saving to daily care:', error);
    // Don't throw - this is just for compatibility
  }
};

/**
 * Get habit entries for a child within a date range
 * @param {string} childId - Child ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {string[]} categories - Optional category filter
 */
export const getHabitEntries = async (childId, startDate, endDate, categories = []) => {
  try {
    const allEntries = [];
    const collectionsToQuery = categories.length > 0 
      ? categories.map(cat => HABIT_COLLECTION_MAP[cat]).filter(Boolean)
      : Object.values(HABIT_COLLECTION_MAP);

    // Query each collection
    for (const collectionName of collectionsToQuery) {
      const q = query(
        collection(db, "children", childId, collectionName),
        where("timestamp", ">=", startDate),
        where("timestamp", "<=", endDate),
        orderBy("timestamp", "desc")
      );

      const querySnapshot = await getDocs(q);
      
      querySnapshot.forEach((doc) => {
        allEntries.push({
          id: doc.id,
          collection: collectionName,
          childId: childId, // Explicitly add the childId since it's from subcollection
          ...doc.data()
        });
      });
    }

    // Sort by timestamp
    return allEntries.sort((a, b) => {
      const aTime = a.timestamp?.toDate?.() || new Date(a.timestamp);
      const bTime = b.timestamp?.toDate?.() || new Date(b.timestamp);
      return bTime - aTime;
    });

  } catch (error) {
    console.error("Error getting habit entries:", error);
    throw error;
  }
};

/**
 * Get today's habit completion status
 * @param {string} childId - Child ID
 */
export const getTodayHabitStatus = async (childId) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const entries = await getHabitEntries(childId, startOfDay, endOfDay);
    
    const status = {};
    entries.forEach(entry => {
      if (entry.categoryId) {
        status[entry.categoryId] = true;
      }
    });

    return status;
  } catch (error) {
    console.error("Error getting today's habit status:", error);
    throw error;
  }
};

/**
 * Save or update a custom habit for a child
 * @param {string} childId - Child ID
 * @param {Object} customHabit - Custom habit data
 */
export const saveCustomHabit = async (childId, customHabit) => {
  try {
    const habit = {
      ...customHabit,
      childId,
      createdAt: serverTimestamp(),
      active: true
    };

    const docRef = await addDoc(
      collection(db, "children", childId, "customHabits"), 
      habit
    );

    console.log("Custom habit saved successfully with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error saving custom habit:", error);
    throw error;
  }
};

/**
 * Get custom habits for a child
 * @param {string} childId - Child ID
 */
export const getCustomHabits = async (childId) => {
  try {
    const q = query(
      collection(db, "children", childId, "customHabits"),
      where("active", "==", true),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const habits = [];

    querySnapshot.forEach((doc) => {
      habits.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return habits;
  } catch (error) {
    console.error("Error getting custom habits:", error);
    throw error;
  }
};

/**
 * Get habit analytics for a child
 * @param {string} childId - Child ID  
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 */
export const getHabitAnalytics = async (childId, startDate, endDate) => {
  try {
    const entries = await getHabitEntries(childId, startDate, endDate);
    
    const analytics = {
      totalEntries: entries.length,
      averageLevels: {},
      completionDays: {},
      trends: {}
    };

    // Calculate averages and completion rates by category
    const categoryData = {};
    entries.forEach(entry => {
      const category = entry.categoryId;
      if (!categoryData[category]) {
        categoryData[category] = { levels: [], dates: new Set() };
      }
      
      if (entry.level) {
        categoryData[category].levels.push(entry.level);
      }
      
      if (entry.date) {
        categoryData[category].dates.add(entry.date);
      }
    });

    // Process analytics
    Object.keys(categoryData).forEach(category => {
      const data = categoryData[category];
      
      // Average level
      if (data.levels.length > 0) {
        analytics.averageLevels[category] = 
          Math.round(data.levels.reduce((a, b) => a + b, 0) / data.levels.length * 10) / 10;
      }
      
      // Completion days
      analytics.completionDays[category] = data.dates.size;
    });

    return analytics;
  } catch (error) {
    console.error("Error getting habit analytics:", error);
    throw error;
  }
};