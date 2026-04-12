import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase';
import { getDayDateRange, isWithinDateRange } from './dateUtils';
import { getLogTypeByEntry, getTimelineMetaForCategory } from '../../constants/logTypeRegistry';
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
  const notesText = data.notes || data.sleepDetails?.notes || data.bathroomDetails?.notes || data.content || null;

  return {
    id: doc.id,
    ...data,
    timestamp: data.timestamp?.toDate() || new Date(data.createdAt),
    category: categoryType.category,
    type: categoryMeta.type,
    timelineType: categoryMeta.timelineType,
    collection: 'dailyLogs',
    title: buildDailyLogTitle(data, categoryMeta),
    titlePrefix: categoryMeta.titlePrefix,
    label: categoryMeta.label,
    icon: categoryMeta.icon,
    color: categoryMeta.color,
    content: notesText,
    notes: notesText,
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
        where('timestamp', '>=', start),
        where('timestamp', '<=', end)
      );

      const snapshot = await getDocs(dailyLogQuery);
      return dedupeTimelineEntries(
        snapshot.docs
          .map(mapDailyLogEntry)
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
            .filter((entry) => isWithinDateRange(entry.timestamp, start, end))
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
