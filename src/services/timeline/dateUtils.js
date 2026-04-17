/**
 * Date utilities for timeline services
 */

import { getCalendarDateKey } from '../../utils/calendarDateKey';

const coerceCalendarDate = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value?.toDate === 'function') {
    const resolved = value.toDate();
    return resolved instanceof Date && !Number.isNaN(resolved.getTime()) ? resolved : null;
  }

  if (typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Get date range for a specific day
 * @param {Date} date - Target date
 * @returns {Object} - { start: Date, end: Date }
 */
export const getDayDateRange = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
};

/**
 * Check if a timestamp falls within a date range
 * @param {Date|Object} timestamp - Timestamp to check (Date or Firestore timestamp)
 * @param {Date} start - Start of range
 * @param {Date} end - End of range
 * @returns {boolean}
 */
export const isWithinDateRange = (timestamp, start, end) => {
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  return date >= start && date <= end;
};

const normalizeEntrySource = (entry = {}) => entry?.originalData || entry?.rawData || entry;

export const getTimelineEntryDate = (entry) => {
  const source = normalizeEntrySource(entry);
  const sleepDetails = source?.sleepDetails || entry?.sleepDetails || {};
  const isSleepEntry = source?.category === 'sleep'
    || source?.source === 'sleep_log'
    || source?.type === 'sleep'
    || source?.timelineType === 'sleep'
    || source?.timestampSource === 'sleep-anchor'
    || entry?.timestampSource === 'sleep-anchor'
    || Boolean(sleepDetails.bedtime || sleepDetails.wakeTime || sleepDetails.durationHours);

  const candidates = isSleepEntry
    ? [
        sleepDetails.anchorDate,
        sleepDetails.localDate,
        source?.anchorDate,
        source?.localDate,
        source?.entryDate,
      ]
    : [];

  candidates.push(
    source?.timestamp?.toDate?.(),
    source?.timestamp,
    source?.createdAt?.toDate?.(),
    source?.createdAt,
    source?.date?.toDate?.(),
    source?.date,
    entry?.timestamp?.toDate?.(),
    entry?.timestamp,
    entry?.createdAt?.toDate?.(),
    entry?.createdAt,
    entry?.date?.toDate?.(),
    entry?.date,
  );

  for (const candidate of candidates) {
    const date = coerceCalendarDate(candidate);
    if (date) {
      return date;
    }
  }

  return null;
};

export const getTimelineEntryDateKey = (entry) => {
  const date = getTimelineEntryDate(entry);
  if (!date) {
    return '';
  }

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
};

export const isTimelineEntryOnDate = (entry, selectedDate) => {
  const entryDateKey = getTimelineEntryDateKey(entry);
  const selectedDateKey = getCalendarDateKey(selectedDate);
  return Boolean(entryDateKey && selectedDateKey && entryDateKey === selectedDateKey);
};
