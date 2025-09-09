import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query,
  where,
  getDocs,
  orderBy
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

/**
 * Habit Service - Daily habit tracking using dailyCare collection
 * Consistent with other services - all data goes to top-level dailyCare collection
 * Supports: mood, sleep, nutrition, progress, and custom habits
 */

/**
 * Save a habit entry - all data goes to dailyCare collection
 * @param {Object} habitEntry - The habit entry data
 * @param {string} habitEntry.childId - Child ID
 * @param {string} habitEntry.categoryId - Habit category ID (mood, sleep, etc.)
 * @param {string} habitEntry.categoryLabel - Display label
 * @param {number} habitEntry.level - 1-10 scale value
 * @param {Date} habitEntry.date - Entry date
 * @param {string} habitEntry.notes - Rich text notes
 * @param {File} habitEntry.mediaFile - Optional media attachment
 * @param {Blob} habitEntry.audioBlob - Optional audio recording
 * @param {Object} habitEntry.customHabit - Custom habit data (if applicable)
 */
export const saveHabitEntry = async (habitEntry) => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated to save habit entries');
    }

    const { 
      childId, 
      categoryId, 
      categoryLabel, 
      level, 
      date, 
      notes, 
      mediaFile, 
      audioBlob, 
      customHabit
    } = habitEntry;

    // Map habit categories to dailyCare action types
    const actionTypeMap = {
      mood: 'mood',
      sleep: 'sleep', 
      nutrition: 'food_health',
      progress: 'energy', // Map progress to energy
      other: 'mood' // Map custom to mood
    };

    const actionType = actionTypeMap[categoryId] || 'mood';
    
    // Create the dailyCare entry with all rich data
    const entry = {
      // Required fields for Firestore rules
      childId,
      createdBy: currentUser.uid,
      createdAt: serverTimestamp(),
      
      // DailyCare standard fields
      actionType,
      data: { 
        level, 
        source: 'habits',
        categoryId,
        categoryLabel,
        notes: notes || '',
        ...(customHabit && { customHabit })
      },
      completedBy: currentUser.uid,
      timestamp: serverTimestamp(),
      date: date.toDateString(),
      
      // Status for soft delete system
      status: 'active'
    };

    // TODO: Handle media uploads to Firebase Storage
    if (mediaFile) {
      // entry.data.mediaUrl = await uploadMediaFile(mediaFile, childId);
      console.log('Media file upload not yet implemented:', mediaFile.name);
    }

    if (audioBlob) {
      // entry.data.audioUrl = await uploadAudioBlob(audioBlob, childId);
      console.log('Audio blob upload not yet implemented');
    }

    // Debug logging to see exactly what's being sent
    console.log('🔍 HabitService Debug Info:');
    console.log('  childId:', childId);
    console.log('  user?.uid:', currentUser?.uid);
    console.log('  user object:', currentUser);
    console.log('  entry being sent:', {
      ...entry,
      createdAt: '[serverTimestamp()]', // serverTimestamp shows as function, not actual value
      timestamp: '[serverTimestamp()]'
    });

    // Save to dailyCare collection (canonical store)
    const docRef = await addDoc(collection(db, "dailyCare"), entry);

    console.log(`Habit entry (${categoryLabel}) saved successfully with ID:`, docRef.id);
    return docRef.id;

  } catch (error) {
    console.error(`Error saving habit entry:`, error);
    throw error;
  }
};

/**
 * Get habit entries for a child within a date range - queries dailyCare collection
 * @param {string} childId - Child ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {string[]} categories - Optional category filter
 */
export const getHabitEntries = async (childId, startDate, endDate, categories = []) => {
  try {
    // Build query for dailyCare collection
    let q = query(
      collection(db, "dailyCare"),
      where("childId", "==", childId),
      where("timestamp", ">=", startDate),
      where("timestamp", "<=", endDate),
      orderBy("timestamp", "desc")
    );

    const querySnapshot = await getDocs(q);
    const entries = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Only include entries that came from habits and match category filter
      if (data.data?.source === 'habits') {
        if (categories.length === 0 || categories.includes(data.data?.categoryId)) {
          entries.push({
            id: doc.id,
            childId: data.childId,
            categoryId: data.data?.categoryId,
            categoryLabel: data.data?.categoryLabel,
            level: data.data?.level,
            notes: data.data?.notes,
            customHabit: data.data?.customHabit,
            ...data
          });
        }
      }
    });

    return entries;
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
    const today = new Date().toDateString();
    
    const q = query(
      collection(db, "dailyCare"),
      where("childId", "==", childId),
      where("date", "==", today)
    );

    const querySnapshot = await getDocs(q);
    const status = {};
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Only count entries from habits
      if (data.data?.source === 'habits' && data.data?.categoryId) {
        status[data.data.categoryId] = true;
      }
    });

    return status;
  } catch (error) {
    console.error("Error getting today's habit status:", error);
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