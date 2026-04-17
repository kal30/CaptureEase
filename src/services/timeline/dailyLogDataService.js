import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase';
import { getDayDateRange, isWithinDateRange, isTimelineEntryOnDate } from './dateUtils';
import { getLogTypeByEntry, getTimelineMetaForCategory, isBehaviorIncidentEntry, LOG_TYPES } from '../../constants/logTypeRegistry';
import { dedupeTimelineEntries } from './timelineDeduping';

const buildDailyLogTitle = (data, categoryMeta) => {
  if ((data.category === 'mood' || data.logCategory === 'mood' || data.actionType === 'mood') && (
    data.moodValue
    || data.value
    || data.data?.level
    || data.title
  )) {
    return String(
      data.moodValue
      || data.value
      || data.data?.level
      || data.title
    ).trim();
  }

  if ((data.category === 'medication' || data.logCategory === 'medication') && (
    data.medicationName
    || data.medicationDetails?.medicationName
    || data.medicationDetails?.name
  )) {
    return String(
      data.medicationName
      || data.medicationDetails?.medicationName
      || data.medicationDetails?.name
    ).trim();
  }

  if (data.titlePrefix?.trim()) {
    return data.titlePrefix.trim();
  }

  if (data.title?.trim()) {
    return data.title.trim();
  }

  if (Array.isArray(data.tags) && data.tags.length > 0) {
    return `${categoryMeta.titlePrefix}: #${data.tags[0]}`;
  }

  const noteText = (data.text || data.note || data.content || '').trim();
  if (!noteText) {
    return categoryMeta.titlePrefix;
  }

  const firstLine = noteText.split('\n')[0].trim();
  if (!firstLine) {
    return categoryMeta.titlePrefix;
  }

  return firstLine.length > 60 ? `${firstLine.slice(0, 57)}...` : firstLine;
};

const mapDailyLogEntry = (doc) => {
  const data = doc.data();
  const categoryType = getLogTypeByEntry(data);
  const categoryMeta = getTimelineMetaForCategory(categoryType.category);
  const isBehaviorIncident = isBehaviorIncidentEntry(data);
  const isMoodEntry = categoryType.category === 'mood' || data.actionType === 'mood';
  const sleepDetails = data.sleepDetails || {};
  const notesText = data.notes || data.sleepDetails?.notes || data.bathroomDetails?.notes || data.incidentData?.notes || data.content || null;
  const severityLabel = data.severityLabel || data.incidentData?.severityLabel || (data.severity ? `Severity ${data.severity}` : null);
  const triggerSummary = data.triggerSummary || data.incidentData?.triggerSummary || null;
  const contextSnapshot = data.contextSnapshot || data.incidentData?.contextSnapshot || null;
  const sleepAnchorDate = sleepDetails.anchorDate || data.anchorDate || sleepDetails.localDate || data.localDate || data.entryDate || null;

  return {
    id: doc.id,
    ...data,
    timestamp: data.timestamp?.toDate() || new Date(data.createdAt),
    anchorDate: sleepAnchorDate,
    localDate: data.localDate || sleepDetails.localDate || null,
    localTime: data.localTime || sleepDetails.localTime || null,
    sleepAnchorDate,
    logCategory: categoryType.category,
    category: isMoodEntry ? 'mood' : categoryType.category,
    type: isBehaviorIncident ? 'behavior' : (isMoodEntry ? 'mood' : categoryMeta.type),
    timelineType: isBehaviorIncident ? 'incident' : (isMoodEntry ? 'mood' : categoryMeta.timelineType),
    collection: 'dailyLogs',
    title: isBehaviorIncident ? 'Behavior' : buildDailyLogTitle(data, categoryMeta),
    titlePrefix: isBehaviorIncident ? 'Behavior' : (isMoodEntry ? 'Mood' : categoryMeta.titlePrefix),
    medicationName: data.medicationName || data.medicationDetails?.medicationName || data.medicationDetails?.name || null,
    medicationScheduleDose: data.medicationScheduleDose || data.medicationDetails?.dosage || data.medicationDetails?.dose || data.dosage || data.dose || null,
    medicationScheduleUnit: data.medicationScheduleUnit || data.medicationDetails?.unit || data.unit || null,
    medicationScheduleTime: data.medicationScheduleTime || data.time || null,
    medicationCategory: data.medicationCategory || data.medicationFrequency || null,
    label: isBehaviorIncident ? LOG_TYPES.behavior.displayLabel : (isMoodEntry ? LOG_TYPES.mood.displayLabel : categoryMeta.label),
    icon: isBehaviorIncident ? LOG_TYPES.behavior.icon : (isMoodEntry ? LOG_TYPES.mood.icon : categoryMeta.icon),
    color: isBehaviorIncident ? LOG_TYPES.behavior.palette.dot : (isMoodEntry ? LOG_TYPES.mood.palette.dot : categoryMeta.color),
    content: isBehaviorIncident
      ? [
          severityLabel ? `Severity: ${severityLabel}${data.severity != null ? ` (${data.severity})` : ''}` : null,
          notesText ? `Notes: ${notesText}` : null,
          contextSnapshot?.patternInsight ? contextSnapshot.patternInsight : null,
        ].filter(Boolean).join(' • ')
      : (isMoodEntry ? (data.moodValue || data.value || data.data?.level || data.title || notesText || '') : notesText),
    notes: notesText,
    severity: data.severity,
    severityLabel,
    triggerSummary,
    remedy: data.remedy || data.incidentData?.remedy || null,
    suspectedTriggers: data.suspectedTriggers || data.incidentData?.suspectedTriggers || [],
    contextSnapshot,
    incidentData: data.incidentData || {},
    entryType: isBehaviorIncident ? 'incident' : (isMoodEntry ? 'mood' : data.entryType),
    incidentStyle: isBehaviorIncident,
    incidentCategoryId: isBehaviorIncident ? 'behavior' : (isMoodEntry ? 'mood' : data.incidentCategoryId),
    incidentCategoryLabel: isBehaviorIncident ? 'Behavior' : (isMoodEntry ? 'Mood' : data.incidentCategoryLabel),
    incidentCategoryColor: isBehaviorIncident ? categoryMeta.color : (isMoodEntry ? LOG_TYPES.mood.palette.dot : data.incidentCategoryColor),
    incidentCategoryIcon: isBehaviorIncident ? categoryMeta.icon : (isMoodEntry ? LOG_TYPES.mood.icon : data.incidentCategoryIcon),
    moodValue: isMoodEntry ? buildDailyLogTitle(data, categoryMeta) : data.moodValue || null,
  };
};

/**
 * Get daily log entries for a specific child and date
 * @param {string} childId - Child ID
 * @param {Date} selectedDate - Date to fetch logs for
 * @returns {Promise<Array>} - Array of daily log entry objects
 */
export const getDailyLogEntries = async (childId, selectedDate) => {
  try {
    const { start, end } = getDayDateRange(selectedDate);

    try {
      const dailyLogQuery = query(
        collection(db, 'dailyLogs'),
        where('childId', '==', childId),
        where('status', '==', 'active'),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(dailyLogQuery);
      return dedupeTimelineEntries(
        snapshot.docs
          .map(mapDailyLogEntry)
          .filter((entry) => isTimelineEntryOnDate(entry, selectedDate) || isWithinDateRange(entry.timestamp, start, end))
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      );
    } catch (indexError) {
      if (indexError.message.includes('index')) {
        console.warn('🔥 Index missing for daily logs, using fallback query');

        const fallbackQuery = query(
          collection(db, 'dailyLogs'),
          where('childId', '==', childId),
          where('status', '==', 'active')
        );

        const snapshot = await getDocs(fallbackQuery);
        return dedupeTimelineEntries(
          snapshot.docs
            .map(mapDailyLogEntry)
            .filter((entry) => isTimelineEntryOnDate(entry, selectedDate) || isWithinDateRange(entry.timestamp, start, end))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        );
      }

      throw indexError;
    }
  } catch (error) {
    console.error('Error fetching daily log entries:', error);
    return [];
  }
};
