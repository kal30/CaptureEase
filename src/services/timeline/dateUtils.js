/**
 * Date utilities for timeline services
 */

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