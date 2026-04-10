import { useState, useEffect, useMemo } from 'react';
import { 
  withTimelinePermissions,
  getCareOwnerTimelineView 
} from '../services/timeline/timelinePermissionService';
import { useRole } from '../contexts/RoleContext';
import { USER_ROLES } from '../constants/roles';
import { CATEGORY_COLORS } from '../constants/categoryColors';
import { getCustomCategories, getIncidentTypeConfig } from '../services/incidentService';
import { HABIT_TYPES } from '../constants/habitTypes';
import { LOG_TYPES, getLogTypeByEntry, getTimelineMetaForCategory, SPECIAL_FILTER_TYPES } from '../constants/logTypeRegistry';
import { dedupeTimelineEntries } from '../services/timeline/timelineDeduping';

const HABIT_CATEGORY_ICON_MAP = {
  mood: '🙂',
  sleep: '😴',
  nutrition: '🍎',
  progress: '📈',
  diaper: '🚽',
  bathroom: '🚽',
  medication: '💊',
  other: '📝',
};

const getEntryUser = (entry) => ({
  loggedByUser: entry.loggedBy?.name || entry.authorName || entry.authorEmail || null,
  userRole: entry.loggedBy?.role || entry.authorRole || null,
  userId: entry.loggedBy?.id || entry.authorId || entry.createdBy || null,
});

const getQuickJournalTitle = (entry, categoryMeta) => {
  const text = (entry.title || entry.text || '').trim();
  if (!text) {
    return categoryMeta.titlePrefix;
  }

  const firstLine = text.split('\n')[0].trim();
  if (!firstLine) {
    return categoryMeta.titlePrefix;
  }

  return firstLine.length > 60 ? `${firstLine.slice(0, 57)}...` : firstLine;
};

const getQuickNoteMeta = (entry) => {
  if (entry.importantMoment) {
    return {
      type: 'importantMoment',
      timelineType: 'importantMoment',
      titlePrefix: SPECIAL_FILTER_TYPES.importantMoment.titlePrefix,
      color: CATEGORY_COLORS.importantMoment.dot,
      icon: SPECIAL_FILTER_TYPES.importantMoment.icon,
    };
  }

  return getTimelineMetaForCategory(entry.category, { importantMoment: !!entry.importantMoment });
};

/**
 * useUnifiedTimelineData - Hook to fetch and combine all timeline data for a specific day
 * Combines incidents, journal entries, daily logs, and follow-ups
 * 
 * @param {string} childId - Child ID
 * @param {Date} selectedDate - Date to fetch data for
 * @param {Object} filters - Active filters (entryTypes, userRoles, etc.)
 * @returns {Object} - { entries, loading, error, summary }
 */
export { useUnifiedTimelineData as default, useUnifiedTimelineData } from "../features/timeline/useUnifiedTimelineData";
