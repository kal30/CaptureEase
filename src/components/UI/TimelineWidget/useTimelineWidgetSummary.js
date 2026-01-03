import { useMemo } from 'react';

const getEntryDate = (entry) => entry.timestamp?.toDate?.() || new Date(entry.timestamp);

const useTimelineWidgetSummary = (entries = []) =>
  useMemo(() => {
    if (!entries.length) {
      return { lastEntry: null, loggedToday: false, daysLoggedThisWeek: 0 };
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const uniqueDays = new Set();
    let latestEntry = null;
    let hasLoggedToday = false;

    entries.forEach((entry) => {
      const entryDate = getEntryDate(entry);
      if (!latestEntry || entryDate > getEntryDate(latestEntry)) {
        latestEntry = entry;
      }
      if (entryDate >= todayStart) {
        hasLoggedToday = true;
      }
      if (entryDate >= weekAgo) {
        uniqueDays.add(entryDate.toDateString());
      }
    });

    return {
      lastEntry: latestEntry,
      loggedToday: hasLoggedToday,
      daysLoggedThisWeek: uniqueDays.size
    };
  }, [entries]);

export default useTimelineWidgetSummary;
