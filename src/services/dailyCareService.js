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

const parseTime = (timeValue) => {
  if (!timeValue) return null;
  const [hours, minutes] = String(timeValue).split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return { hours, minutes };
};

const formatLocalDateKey = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '';
  }

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
};

const buildSleepTimestamp = (anchorDate, bedtime) => {
  const baseDate = anchorDate instanceof Date && !Number.isNaN(anchorDate.getTime())
    ? new Date(anchorDate)
    : new Date();
  const bed = parseTime(bedtime);
  if (!bed) {
    return baseDate;
  }

  const timestamp = new Date(baseDate);
  timestamp.setHours(bed.hours, bed.minutes, 0, 0);
  return timestamp;
};

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

const resolveTimestamp = (value) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (value?.toDate && typeof value.toDate === 'function') {
    const date = value.toDate();
    if (date instanceof Date && !Number.isNaN(date.getTime())) {
      return date;
    }
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return new Date();
};

const formatTimeLabel = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
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
    const resolvedTimestamp = resolveTimestamp(entryData.timestamp);
    
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
      timestamp: resolvedTimestamp,
      date: resolvedTimestamp.toDateString(), // For daily tracking
      
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
        recordedAt: resolvedTimestamp,
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

      window.dispatchEvent(new CustomEvent('captureez:daily-care-saved', {
        detail: {
          childId,
          actionType,
          timestamp: resolvedTimestamp,
          title: getActionTitle(actionType),
          message: `${getActionTitle(actionType)} logged at ${formatTimeLabel(resolvedTimestamp)}`,
        },
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
      const anchorDate = data?.anchorDate || data?.localDate || data?.nightOf || data?.date;
      const resolvedAnchorDate = anchorDate instanceof Date
        ? anchorDate
        : typeof anchorDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(anchorDate)
          ? new Date(`${anchorDate}T00:00:00`)
          : (entryData.timestamp ? new Date(entryData.timestamp) : new Date());
      const sleepTimestamp = buildSleepTimestamp(resolvedAnchorDate, data?.bedtime);
      const localDate = formatLocalDateKey(resolvedAnchorDate);
      const localTime = data?.bedtime || null;
      const timeZoneOffsetMinutes = -sleepTimestamp.getTimezoneOffset();
      const timeZoneName = Intl.DateTimeFormat().resolvedOptions().timeZone || null;

      await addDoc(collection(db, "dailyLogs"), {
        childId,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        text: sleepText,
        status: 'active',
        category: 'sleep',
        tags: ['sleep'],
        timestamp: sleepTimestamp,
        recordedAt: sleepTimestamp,
        timestampUtc: sleepTimestamp.toISOString(),
        timestampSource: 'sleep-anchor',
        entryDate: sleepTimestamp.toDateString(),
        anchorDate: localDate,
        localDate,
        localTime,
        timeZoneOffsetMinutes,
        timeZoneName,
        authorId: currentUser.uid,
        authorName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
        authorEmail: currentUser.email,
        source: 'sleep_log',
        sleepDetails: {
          anchorDate: localDate,
          localDate,
          localTime,
          bedtime: data?.bedtime || null,
          wakeTime: data?.wakeTime || null,
          durationHours: data?.sleepDuration || null,
          disturbances: Array.isArray(data?.sleepIssues) ? data.sleepIssues : (data?.sleepIssues ? [data.sleepIssues] : []),
          quality: data?.sleepQuality || null,
          notes: data?.notes || null,
          timeZoneOffsetMinutes,
          timeZoneName,
          timestampSource: 'sleep-anchor',
          startUtc: sleepTimestamp.toISOString(),
        }
      });
    }
    
    // Also save to child's timeline for historical tracking
    if (actionType !== 'sleep') {
      await addDoc(collection(db, "children", childId, "timeline"), {
        type: `daily_${actionType}`,
        title: getActionTitle(actionType),
        data: data,
        timestamp: resolvedTimestamp,
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
