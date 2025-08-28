import { useMemo } from 'react';
import { TIMELINE_TYPES } from '../services/timelineService';

/**
 * Custom hook for processing timeline data and calculating progress metrics
 * Reusable across different components that need timeline insights
 * 
 * @param {Array} entries - Array of timeline entries
 * @param {Object} dailyCareStatus - Daily care completion status from useDailyCareStatus
 * @returns {Object} Processed timeline data with progress metrics
 */
export const useTimelineProgress = (entries = [], dailyCareStatus = {}) => {
  
  const timelineMetrics = useMemo(() => {
    if (!entries.length) {
      return {
        recentEntries: [],
        todayEntries: [],
        weekEntries: [],
        typeDistribution: [],
        completionRate: dailyCareStatus.dataCompleteness || 0,
        dailyCareStatus: dailyCareStatus,
        hasActivity: false,
        metrics: {
          todayCount: 0,
          weekCount: 0,
          totalCount: 0,
          averagePerDay: 0
        }
      };
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

    // Filter entries by time periods
    const todayEntries = entries.filter(entry => {
      const entryDate = entry.timestamp?.toDate?.() || new Date(entry.timestamp);
      return entryDate >= todayStart;
    });

    const weekEntries = entries.filter(entry => {
      const entryDate = entry.timestamp?.toDate?.() || new Date(entry.timestamp);
      return entryDate >= weekAgo;
    });

    const recentEntries = entries
      .sort((a, b) => {
        const aTime = a.timestamp?.toDate?.() || new Date(a.timestamp);
        const bTime = b.timestamp?.toDate?.() || new Date(b.timestamp);
        return bTime - aTime;
      })
      .slice(0, 5);

    // Calculate type distribution for the week
    const typeDistribution = weekEntries.reduce((acc, entry) => {
      const type = entry.type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Get type configurations with theme colors
    const enrichedDistribution = Object.entries(typeDistribution).map(([type, count]) => {
      const typeConfig = Object.values(TIMELINE_TYPES).find(t => t.type === type);
      return {
        type,
        count,
        label: typeConfig?.label || type,
        icon: typeConfig?.icon || '📝',
        color: typeConfig?.color || '#9C27B0'
      };
    }).sort((a, b) => b.count - a.count);

    return {
      recentEntries,
      todayEntries,
      weekEntries,
      typeDistribution: enrichedDistribution,
      completionRate: dailyCareStatus.dataCompleteness || 0,
      dailyCareStatus: dailyCareStatus,
      hasActivity: entries.length > 0,
      metrics: {
        todayCount: todayEntries.length,
        weekCount: weekEntries.length,
        totalCount: entries.length,
        averagePerDay: Math.round(weekEntries.length / 7 * 10) / 10
      }
    };
  }, [entries, dailyCareStatus]);

  /**
   * Format time ago in a mobile-friendly way
   * @param {Date|string} timestamp 
   * @returns {string}
   */
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const entryTime = timestamp?.toDate?.() || new Date(timestamp);
    const diffMs = now - entryTime;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 7) return entryTime.toLocaleDateString();
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return 'Just now';
  };

  /**
   * Get the most active timeline type for the week
   * @returns {Object|null}
   */
  const getMostActiveType = () => {
    if (!timelineMetrics.typeDistribution.length) return null;
    return timelineMetrics.typeDistribution[0];
  };

  /**
   * Check if child has been active today
   * @returns {boolean}
   */
  const hasActivityToday = () => {
    return timelineMetrics.todayEntries.length > 0;
  };

  /**
   * Get activity streak (consecutive days with entries)
   * @returns {number}
   */
  const getActivityStreak = () => {
    if (!entries.length) return 0;
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) { // Check last 30 days
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dayStart = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const hasEntryForDay = entries.some(entry => {
        const entryDate = entry.timestamp?.toDate?.() || new Date(entry.timestamp);
        return entryDate >= dayStart && entryDate < dayEnd;
      });
      
      if (hasEntryForDay) {
        streak++;
      } else if (i > 0) { // Don't break on first day (today) if no entries
        break;
      }
    }
    
    return streak;
  };

  return {
    ...timelineMetrics,
    formatTimeAgo,
    getMostActiveType,
    hasActivityToday,
    getActivityStreak
  };
};