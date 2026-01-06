import { useMemo } from 'react';

const getEntryDate = (entry) => entry.timestamp?.toDate?.() || new Date(entry.timestamp);

const getEntryTags = (entry) => {
  const tags = [
    ...(entry?.tags || []),
    ...(entry?.ai?.tags || []),
    ...(entry?.originalData?.tags || []),
    ...(entry?.originalData?.ai?.tags || [])
  ];
  return Array.from(new Set(tags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean)));
};

const getPeriodLabel = (date) => {
  const hour = date.getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 24) return 'evening';
  return 'night';
};

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
    let importantCountThisWeek = 0;
    const tagCounts = new Map();

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
        const noteType = entry?.meta?.noteType || entry?.originalData?.meta?.noteType;
        if (noteType === 'important') {
          importantCountThisWeek += 1;
        }
        getEntryTags(entry).forEach((tag) => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      }
    });

    const topTag = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    let patternSummary = null;
    if (topTag) {
      const periodCounts = new Map();
      entries.forEach((entry) => {
        const entryDate = getEntryDate(entry);
        if (entryDate < weekAgo) return;
        if (!getEntryTags(entry).includes(topTag)) return;
        const period = getPeriodLabel(entryDate);
        periodCounts.set(period, (periodCounts.get(period) || 0) + 1);
      });
      const topPeriod = Array.from(periodCounts.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0];
      patternSummary = topPeriod
        ? `Most #${topTag} logs happen in the ${topPeriod}`
        : `#${topTag} shows up most often this week`;
    }

    return {
      lastEntry: latestEntry,
      loggedToday: hasLoggedToday,
      daysLoggedThisWeek: uniqueDays.size,
      importantCountThisWeek,
      patternSummary
    };
  }, [entries]);

export default useTimelineWidgetSummary;
