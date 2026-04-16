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
    category: categoryType.category,
    type: isBehaviorIncident ? 'behavior' : categoryMeta.type,
    timelineType: isBehaviorIncident ? 'incident' : categoryMeta.timelineType,
    collection: 'dailyLogs',
    title: isBehaviorIncident ? 'Behavior' : buildDailyLogTitle(data, categoryMeta),
    titlePrefix: isBehaviorIncident ? 'Behavior' : categoryMeta.titlePrefix,
    label: isBehaviorIncident ? LOG_TYPES.behavior.displayLabel : categoryMeta.label,
    icon: isBehaviorIncident ? LOG_TYPES.behavior.icon : categoryMeta.icon,
    color: isBehaviorIncident ? LOG_TYPES.behavior.palette.dot : categoryMeta.color,
    content: isBehaviorIncident
      ? [
          severityLabel ? `Severity: ${severityLabel}${data.severity != null ? ` (${data.severity})` : ''}` : null,
          notesText ? `Notes: ${notesText}` : null,
          contextSnapshot?.patternInsight ? contextSnapshot.patternInsight : null,
        ].filter(Boolean).join(' • ')
      : notesText,
    notes: notesText,
    severity: data.severity,
    severityLabel,
    triggerSummary,
    remedy: data.remedy || data.incidentData?.remedy || null,
    suspectedTriggers: data.suspectedTriggers || data.incidentData?.suspectedTriggers || [],
    contextSnapshot,
    incidentData: data.incidentData || {},
    entryType: isBehaviorIncident ? 'incident' : data.entryType,
    incidentStyle: isBehaviorIncident,
    incidentCategoryId: isBehaviorIncident ? 'behavior' : data.incidentCategoryId,
    incidentCategoryLabel: isBehaviorIncident ? 'Behavior' : data.incidentCategoryLabel,
    incidentCategoryColor: isBehaviorIncident ? categoryMeta.color : data.incidentCategoryColor,
    incidentCategoryIcon: isBehaviorIncident ? categoryMeta.icon : data.incidentCategoryIcon,
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
