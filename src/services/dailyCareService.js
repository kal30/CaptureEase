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
import { getAuth } from "firebase/auth";

const formatSleepIssue = (value) => {
  const issueLabels = {
    difficulty_falling_asleep: 'Hard to fall asleep',
    frequent_waking: 'Woke often',
    early_waking: 'Woke early',
    nightmares: 'Nightmares',
    night_terrors: 'Night terrors',
    none: 'No disturbances',
  };

  if (!value) return '';
  return issueLabels[value] || String(value).replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

// Save a daily care entry
export const saveDailyCareEntry = async (entryData) => {
  try {
    // Get current user for audit metadata
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated to save daily care entries');
    }

    const { childId, actionType, data, completedBy } = entryData;
    
    // Create the entry document with required immutable metadata
    const entry = {
      // Required immutable metadata for security rules
      childId,
      createdBy: currentUser.uid,
      createdAt: serverTimestamp(),
      
      // Daily care data
      actionType,
      data,
      completedBy: completedBy || currentUser.uid,
      timestamp: serverTimestamp(),
      date: new Date().toDateString(), // For daily tracking
      
      // Status for soft delete system
      status: 'active',
    };

    // Save to daily care collection
    const docRef = await addDoc(collection(db, "dailyCare"), entry);

    if (typeof window !== 'undefined') {
      const eventDetail = {
        id: docRef.id,
        ...entry,
        actionType,
        childId,
        timestamp: entry.timestamp,
        collection: 'dailyCare',
        category: 'daily_care',
        title: getActionTitle(actionType),
        activityThemeKey: data?.activityThemeKey || null,
        activityThemeColor: data?.activityThemeColor || null,
        activityThemeLabel: data?.activityThemeLabel || null,
        categoryLabel: data?.categoryLabel || null,
        categoryColor: data?.categoryColor || null,
      };

      window.dispatchEvent(new CustomEvent('captureez:timeline-entry-created', {
        detail: eventDetail,
      }));

      window.dispatchEvent(new CustomEvent('captureez:timeline-refresh', {
        detail: {
          childId,
          collection: 'dailyCare',
          entryId: docRef.id,
        },
      }));
    }

    if (actionType === 'sleep') {
      const sleepIssues = Array.isArray(data?.sleepIssues)
        ? data.sleepIssues.filter((issue) => issue && issue !== 'none')
        : data?.sleepIssues
          ? [data.sleepIssues].filter((issue) => issue && issue !== 'none')
          : [];
      const disturbanceText = sleepIssues.length > 0
        ? sleepIssues.map(formatSleepIssue).filter(Boolean).join(', ')
        : 'No disturbances';
      const sleepText = `Slept ${data?.sleepDuration || 0} hours — ${disturbanceText}`.trim();
      const sleepTimestamp = entryData.timestamp ? new Date(entryData.timestamp) : new Date();

      await addDoc(collection(db, "dailyLogs"), {
        childId,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        text: sleepText,
        status: 'active',
        category: 'sleep',
        tags: ['sleep'],
        timestamp: sleepTimestamp,
        entryDate: sleepTimestamp.toDateString(),
        authorId: currentUser.uid,
        authorName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
        authorEmail: currentUser.email,
        source: 'sleep_log',
        sleepDetails: {
          bedtime: data?.bedtime || null,
          wakeTime: data?.wakeTime || null,
          durationHours: data?.sleepDuration || null,
          disturbances: Array.isArray(data?.sleepIssues) ? data.sleepIssues : (data?.sleepIssues ? [data.sleepIssues] : []),
          quality: data?.sleepQuality || null,
          notes: data?.notes || null,
        }
      });
    }
    
    // Also save to child's timeline for historical tracking
    if (actionType !== 'sleep') {
      await addDoc(collection(db, "children", childId, "timeline"), {
        type: `daily_${actionType}`,
        title: getActionTitle(actionType),
        data: data,
        timestamp: serverTimestamp(),
        category: 'daily_care',
        importance: 'normal',
      });
    }

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
      activity: 0,
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
    activity: 'Activity Check',
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
