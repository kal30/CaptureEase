import React from "react";
import {
  Box,
  Typography,
  Stack,
  CircularProgress,
  Alert,
  Skeleton,
} from "@mui/material";
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import { doc, updateDoc } from 'firebase/firestore';
import { getEntryTypeMeta, mapLegacyType } from "../../constants/timeline";
import { getLogTypeByCategory, getLogTypeByEntry, isBehaviorIncidentEntry, LOG_TYPES } from "../../constants/logTypeRegistry";

import TimelineFilters from "./TimelineFilters";
import { useUnifiedTimelineData } from "../../hooks/useUnifiedTimelineData";
import { useRole } from "../../contexts/RoleContext";
import { USER_ROLES } from "../../constants/roles";
import UnifiedTimelineEntry from "./UnifiedTimelineEntry";
import { CATEGORY_COLORS } from "../../constants/categoryColors";
import { trackRenderDebug, useMountDebug } from "../../utils/renderDebug";
import { auth, db } from "../../services/firebase";
import { getTimelineEntryDate } from "../../services/timeline/dateUtils";
import { buildDailyInsight } from "./utils/dailyInsight";
import colors from "../../assets/theme/colors";

const TEXT_PRIMARY = '#1F2937';
const TEXT_SECONDARY = '#4B5563';
const TEXT_MUTED = '#9CA3AF';

/**
 * UnifiedTimeline - Main unified timeline component
 * Combines incidents, daily logs, daily habits, and follow-ups for a single day
 *
 * @param {Object} props
 * @param {Object} props.child - Child object
 * @param {Date} props.selectedDate - Date to show timeline for
 * @param {Object} props.filters - Active filters for timeline
 * @param {Function} props.onFiltersChange - Callback when filters change
 * @param {boolean} props.showFilters - Whether to show filter controls
 */
const UnifiedTimeline = ({
  child,
  selectedDate,
  filters = {},
  onFiltersChange,
  onEmptyStateClick,
  showFilters = true,
  showDaySummary = true,
  mobileTimeLayout = false,
  focusEntryId = null,
  calendarEntries = [],
}) => {
  useMountDebug('UnifiedTimeline');
  const getContrastText = React.useCallback((hexColor) => {
    const normalized = String(hexColor || '').replace('#', '');
    const hex = normalized.length === 3
      ? normalized.split('').map((char) => `${char}${char}`).join('')
      : normalized;

    if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
      return '#FFFFFF';
    }

    const red = parseInt(hex.slice(0, 2), 16);
    const green = parseInt(hex.slice(2, 4), 16);
    const blue = parseInt(hex.slice(4, 6), 16);
    const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

    return brightness > 160 ? '#1F2937' : '#FFFFFF';
  }, []);

  const resolveCategoryColor = React.useCallback((entry) => {
    if (entry.incidentStyle || entry.entryType === 'incident' || isBehaviorIncidentEntry(entry)) {
      const incidentColor = entry.incidentCategoryColor || LOG_TYPES.behavior.palette.dot || colors.app.timeline.incident;
      return {
        bg: colors.app.cards.background,
        text: incidentColor,
        border: colors.app.cards.border,
        dot: incidentColor,
      };
    }

    if (entry.collection === 'incidents') {
      const incidentColor = entry.incidentCategoryColor || colors.app.timeline.incident;
      return {
        bg: colors.app.cards.background,
        text: incidentColor,
        border: colors.app.cards.border,
        dot: incidentColor,
      };
    }

    if (entry.collection === 'dailyCare') {
      const habitColor = (entry.actionType === 'activity')
        ? (entry.categoryColor || entry.activityThemeColor || LOG_TYPES.activity.palette.dot)
        : (entry.categoryColor || entry.activityThemeColor || colors.app.timeline.dailyHabit);
      return {
        bg: colors.app.cards.background,
        text: habitColor,
        border: colors.app.cards.border,
        dot: habitColor,
      };
    }

    if (entry.isImportantMoment) {
      return {
        ...CATEGORY_COLORS.importantMoment,
        bg: colors.app.cards.background,
        border: colors.app.cards.border,
      };
    }

    const categoryKey = CATEGORY_COLORS[entry.category]
      ? entry.category
      : CATEGORY_COLORS[entry.type]
        ? entry.type
        : 'log';

    return {
      ...CATEGORY_COLORS[categoryKey],
      bg: colors.app.cards.background,
      border: colors.app.cards.border,
    };
  }, []);

  const { getUserRoleForChild } = useRole();

  // Get user role for this child
  const userRole = getUserRoleForChild?.(child?.id) || null;
  const childDisplayName = child?.name || 'This child';

  // Fetch unified timeline data
  const { entries, loading, error, summary } = useUnifiedTimelineData(
    child?.id,
    selectedDate,
    filters
  );
  const sharedCalendarEntries = React.useMemo(
    () => (calendarEntries.length > 0 ? calendarEntries : entries),
    [calendarEntries, entries]
  );
  trackRenderDebug('UnifiedTimeline', {
    childId: child?.id || 'none',
    loading,
    entryCount: entries.length,
    selectedDate: selectedDate?.toDateString?.() || 'n/a',
  });
  const mobileTimelineMinHeight = { xs: 220, md: 'auto' };
  const [editingEntryId, setEditingEntryId] = React.useState(null);
  const [editText, setEditText] = React.useState('');
  const [actionLoadingId, setActionLoadingId] = React.useState(null);
  const [localEntryUpdates, setLocalEntryUpdates] = React.useState({});
  const [deletedEntryIds, setDeletedEntryIds] = React.useState({});
  const extractTags = React.useCallback((inputText = '') => {
    const tagRegex = /#(\w+)/g;
    const matches = [...inputText.matchAll(tagRegex)];
    return matches.map((match) => match[1]);
  }, []);

  const handleStartEdit = React.useCallback((entry) => {
    setEditingEntryId(entry.id);
    setEditText(entry.text || '');
  }, []);

  const handleCancelEdit = React.useCallback(() => {
    setEditingEntryId(null);
    setEditText('');
  }, []);

  const handleSaveEdit = React.useCallback(async (entry) => {
    if (!editText.trim()) {
      return;
    }

    setActionLoadingId(entry.id);

    try {
      const entryRef = doc(db, 'dailyLogs', entry.id);
      const nextText = editText.trim();
      await updateDoc(entryRef, {
        text: nextText,
        tags: extractTags(nextText),
        updatedAt: new Date(),
      });
      setLocalEntryUpdates((prev) => ({
        ...prev,
        [entry.id]: {
          ...(prev[entry.id] || {}),
          text: nextText,
          tags: extractTags(nextText),
        },
      }));
      setEditingEntryId(null);
      setEditText('');
    } catch (saveError) {
      console.error('Error updating timeline entry:', saveError);
    } finally {
      setActionLoadingId(null);
    }
  }, [editText, extractTags]);

  const handleDeleteEntry = React.useCallback(async (entry) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    setActionLoadingId(entry.id);

    try {
      const entryRef = doc(db, 'dailyLogs', entry.id);
      await updateDoc(entryRef, {
        status: 'deleted',
        deletedAt: new Date(),
        deletedBy: auth.currentUser?.uid || null,
      });
      setDeletedEntryIds((prev) => ({
        ...prev,
        [entry.id]: true,
      }));
    } catch (deleteError) {
      console.error('Error deleting timeline entry:', deleteError);
    } finally {
      setActionLoadingId(null);
    }
  }, []);

  const visibleEntries = React.useMemo(() => {
    return entries
      .filter((entry) => !deletedEntryIds[entry.id])
      .map((entry) => {
        const localUpdate = localEntryUpdates[entry.id];
        return localUpdate ? { ...entry, ...localUpdate } : entry;
      });
  }, [deletedEntryIds, entries, localEntryUpdates]);

  const getEntryDate = React.useCallback((entry) => (
    getTimelineEntryDate(entry)
      || (typeof entry?.timestamp?.toDate === 'function' ? entry.timestamp.toDate() : null)
      || new Date(entry?.timestamp)
  ), []);

  const formatTimelineTime = React.useCallback((date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  }, []);

  const getMinuteKey = React.useCallback((date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}-${hour}-${minute}`;
  }, []);

  React.useEffect(() => {
    if (!focusEntryId) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      const entryElement = document.getElementById(`timeline-entry-${focusEntryId}`);
      if (entryElement) {
        entryElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });
      }
    }, 50);

    return () => window.clearTimeout(timer);
  }, [focusEntryId, visibleEntries.length]);

  const getEntryPresentation = React.useCallback((entry) => {
    let typeForTimeline;
    if (entry.collection === 'incidents') {
      typeForTimeline = 'incident';
    } else if (entry.collection === 'dailyCare') {
      typeForTimeline = 'dailyHabit';
    } else if (entry.collection === 'dailyLogs') {
      typeForTimeline = getLogTypeByEntry(entry).category || entry.category || entry.timelineType || entry.type || 'dailyLog';
    } else if (entry.collection === 'therapyNotes') {
      typeForTimeline = 'therapyNote';
    } else {
      typeForTimeline = entry.timelineType || entry.type;
    }

    const entryType = mapLegacyType(typeForTimeline);
    const meta = getEntryTypeMeta(typeForTimeline);
    const defaultEntryLabel = meta.label.replace(/s$/, '');
    const categoryMeta = entry.category ? getLogTypeByCategory(entry.category) : null;
    const isBehaviorIncident = entry.collection === 'dailyLogs'
      && isBehaviorIncidentEntry(entry);
    const isMoodEntry = entry.type === 'mood'
      || entry.timelineType === 'mood'
      || entry.category === 'mood'
      || entry.actionType === 'mood'
      || entry.logCategory === 'mood';
    const moodValue = String(
      entry.moodValue
      || entry.value
      || entry.data?.level
      || entry.title
      || entry.content
      || 'Calm'
    ).trim();
    const entryLabel = entry.collection === 'incidents'
      ? (entry.incidentCategoryLabel || defaultEntryLabel)
      : entry.collection === 'dailyCare'
        ? (isMoodEntry
          ? moodValue
          : (entry.actionType === 'activity'
            ? 'Activity'
            : (entry.categoryLabel || entry.activityThemeLabel || defaultEntryLabel)))
        : entry.collection === 'dailyLogs'
          ? (isBehaviorIncident
            ? (entry.incidentCategoryLabel || 'Behavior')
            : (isMoodEntry
              ? moodValue
              : (entry.titlePrefix
                || entry.title
                || entry.label
                || entry.categoryLabel
                || categoryMeta?.trackLabel
                || categoryMeta?.displayLabel
                || defaultEntryLabel)))
          : (entry.title || defaultEntryLabel);
    const timelineColors = resolveCategoryColor(entry);
    const entryColor = timelineColors.dot;
    const entryIcon = isBehaviorIncident
      ? (entry.incidentCategoryIcon || LOG_TYPES.behavior.icon)
      : entry.collection === 'incidents'
      ? (entry.incidentCategoryIcon || meta.icon)
      : entry.collection === 'dailyCare'
        ? (isMoodEntry
          ? (entry.moodEmoji || entry.categoryIcon || LOG_TYPES.mood.icon)
          : (entry.actionType === 'activity'
          ? (entry.categoryIcon || LOG_TYPES.activity.icon)
            : (entry.categoryIcon || meta.icon)))
        : (entry.categoryIcon || meta.icon);

    const labelTextColor = getContrastText(entryColor);

    return { entryType, meta, entryLabel, timelineColors, entryColor, entryIcon, labelTextColor };
  }, [getContrastText, resolveCategoryColor]);

  const timelineBlocks = React.useMemo(() => {
    const sortedEntries = [...visibleEntries].sort((a, b) => {
      const aDate = getEntryDate(a) || new Date(a.timestamp);
      const bDate = getEntryDate(b) || new Date(b.timestamp);
      return bDate - aDate;
    });
    const blocks = [];
    let activeBlock = null;

    sortedEntries.forEach((entry, index) => {
      const timestamp = getEntryDate(entry) || new Date(entry.timestamp);
      const presentation = getEntryPresentation(entry);
      const minuteKey = getMinuteKey(timestamp);

      const item = {
        entry,
        presentation,
        timestamp,
        key: `${entry.type}-${entry.id}-${index}`,
      };

      if (activeBlock && activeBlock.minuteKey === minuteKey) {
        activeBlock.items.push(item);
        return;
      }

      activeBlock = {
        key: `time-block-${minuteKey || index}`,
        minuteKey,
        timeLabel: formatTimelineTime(timestamp),
        items: [item],
      };

      blocks.push(activeBlock);
    });

    return blocks;
  }, [formatTimelineTime, getEntryDate, getEntryPresentation, getMinuteKey, visibleEntries]);

  const todaySummary = React.useMemo(
    () => buildDailyInsight(visibleEntries),
    [visibleEntries]
  );

  // Note: entries are already pre-filtered; grouping by period is optional and not used here.


  // Loading state
  if (loading) {
    return (
        <Box
          sx={{
            minHeight: mobileTimelineMinHeight,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            gap: 0.9,
            pt: 0.5,
          }}
        >
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.5 }}>
          <CircularProgress size={24} />
        </Box>
        {[0, 1, 2].map((item) => (
          <Box
            key={item}
            sx={{
              display: 'flex',
              gap: 1,
              alignItems: 'flex-start',
            }}
          >
            <Skeleton
              variant="circular"
              width={20}
              height={20}
              sx={{ flex: '0 0 auto', mt: 1.5 }}
            />
            <Skeleton
              variant="rounded"
              height={78}
              sx={{ flex: 1, borderRadius: 0.5 }}
            />
          </Box>
        ))}
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load timeline data: {error.message}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Filters */}
      {showFilters && (
        <TimelineFilters
          filters={filters}
          onFiltersChange={onFiltersChange}
          selectedDate={selectedDate}
          summary={summary}
          calendarEntries={sharedCalendarEntries}
          compact
          mobileLayout={mobileTimeLayout}
        />
      )}

      {/* Day Summary Header */}
      {showDaySummary && summary && visibleEntries.length > 0 && (
        <Box
          sx={{
            mb: { xs: 1.5, md: 2 },
            p: { xs: 1.5, md: 2 },
            bgcolor: "background.default",
            borderRadius: { xs: 0.35, md: 0.5 },
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
            <Typography
              gutterBottom={false}
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1rem', md: '1.25rem' },
                lineHeight: 1.25,
                mb: 0,
              }}
            >
              Timeline
            </Typography>
          </Box>
          
          {/* Basic Summary */}
          <Typography variant="body2" sx={{ color: TEXT_SECONDARY }}>
            {summary.totalEntries} entries
            {summary.lastActivityTime && ` • Last activity at ${summary.lastActivityTime}`}
          </Typography>

          {/* Care Owner Enhanced Summary */}
          {userRole === USER_ROLES.CARE_OWNER && summary.roleBreakdown && (
            <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5, color: TEXT_PRIMARY }}>
                👑 Team Contributions Today
              </Typography>
              <Typography variant="body2" sx={{ color: TEXT_SECONDARY }}>
                {summary.roleBreakdown.totalContributors} contributor{summary.roleBreakdown.totalContributors !== 1 ? 's' : ''}
                {summary.roleBreakdown.byRole[USER_ROLES.CARE_PARTNER] && 
                  ` • ${summary.roleBreakdown.byRole[USER_ROLES.CARE_PARTNER]} from Care Partners`}
                {summary.roleBreakdown.byRole[USER_ROLES.CAREGIVER] && 
                  ` • ${summary.roleBreakdown.byRole[USER_ROLES.CAREGIVER]} from Caregivers`}
                {summary.roleBreakdown.byRole[USER_ROLES.THERAPIST] && 
                  ` • ${summary.roleBreakdown.byRole[USER_ROLES.THERAPIST]} from Therapists`}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {showDaySummary && todaySummary?.bullets?.length > 0 && visibleEntries.length > 0 ? (
        <Box
          sx={{
            mt: 1.25,
            mb: 1.1,
            px: { xs: 0.25, md: 0.5 },
          }}
        >
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mb: 0.55,
              fontSize: '0.66rem',
              fontWeight: 900,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: TEXT_MUTED,
            }}
          >
            {todaySummary.title}
          </Typography>

          <Box
            sx={{
              p: { xs: 1.25, md: 1.5 },
              borderRadius: '14px',
              bgcolor: 'rgba(248, 250, 252, 0.92)',
              border: '1px solid rgba(148, 163, 184, 0.16)',
            }}
          >
            <Stack
              component="ul"
              spacing={0.55}
              sx={{
                m: 0,
                pl: 2,
                color: TEXT_PRIMARY,
              }}
            >
              {todaySummary.bullets.map((item, index) => (
                <Box
                  key={`${item.text}-${index}`}
                  component="li"
                  sx={{
                    fontSize: '0.84rem',
                    lineHeight: 1.45,
                    color: TEXT_SECONDARY,
                    fontWeight: 600,
                  }}
                >
                  {item.text}
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
      ) : null}

      {todaySummary?.bullets?.length > 0 && visibleEntries.length > 0 ? (
        <Box
          sx={{
            mt: showDaySummary ? 0 : 1.1,
            mb: 1.1,
            px: { xs: 0.25, md: 0.5 },
          }}
        >
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mb: 0.55,
              fontSize: '0.66rem',
              fontWeight: 900,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: TEXT_MUTED,
            }}
          >
            Quick take
          </Typography>

          <Box
            sx={{
              p: { xs: 1.25, md: 1.5 },
              borderRadius: '14px',
              bgcolor: 'rgba(248, 250, 252, 0.92)',
              border: '1px solid rgba(148, 163, 184, 0.16)',
            }}
          >
            <Stack
              component="ul"
              spacing={0.55}
              sx={{
                m: 0,
                pl: 2,
                color: TEXT_PRIMARY,
              }}
            >
              {todaySummary.bullets.map((item, index) => (
                <Box
                  key={`${item.text}-${index}`}
                  component="li"
                  sx={{
                    fontSize: '0.84rem',
                    lineHeight: 1.45,
                    color: TEXT_SECONDARY,
                    fontWeight: 600,
                  }}
                >
                  {item.text}
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
      ) : null}

      {/* Timeline Content */}
      {visibleEntries.length === 0 ? (
        <Box
          onClick={onEmptyStateClick}
          onKeyDown={(event) => {
            if ((event.key === "Enter" || event.key === " ") && onEmptyStateClick) {
              event.preventDefault();
              onEmptyStateClick();
            }
          }}
          role={onEmptyStateClick ? "button" : undefined}
          tabIndex={onEmptyStateClick ? 0 : undefined}
          sx={{
            minHeight: mobileTimelineMinHeight,
            textAlign: "center",
            py: { xs: 1.75, md: 2.25 },
            px: { xs: 1.5, md: 2 },
            borderRadius: '14px',
            cursor: onEmptyStateClick ? "pointer" : "default",
            transition: "background-color 0.2s ease, box-shadow 0.2s ease",
            "&:hover": onEmptyStateClick
              ? {
                  backgroundColor: "action.hover",
                  boxShadow: `0 2px 8px ${colors.app.cards.shadowPanel}`,
                }
              : undefined,
            "&:focus-visible": onEmptyStateClick
              ? {
                  outline: "2px solid",
                  outlineColor: "primary.main",
                  outlineOffset: 2,
                }
              : undefined,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            maxWidth: 520,
            mx: 'auto',
          }}
        >
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: '9999px',
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.landing.sageLight,
              color: colors.brand.ink,
              border: `1px solid ${colors.landing.borderLight}`,
              boxShadow: `0 8px 18px ${colors.landing.shadowSoft}`,
            }}
          >
            <FavoriteBorderOutlinedIcon sx={{ fontSize: 24 }} />
          </Box>
            <Typography variant="body1" sx={{ fontWeight: 700, mb: 0.25, color: TEXT_PRIMARY, textAlign: 'center' }}>
            {childDisplayName}&apos;s day is a blank canvas!
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.76rem",
              lineHeight: 1.45,
              color: TEXT_SECONDARY,
              maxWidth: 250,
              mx: "auto",
              textAlign: 'center',
            }}
          >
            Whenever you're ready, use the buttons above to record a moment.
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            mt: 1.25,
            minHeight: mobileTimelineMinHeight,
            px: { xs: 0, md: 0.5 },
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            overflow: 'visible',
          }}
        >
          <Box
            sx={{
              maxHeight: mobileTimeLayout ? 'none' : { xs: 360, md: 520 },
              overflowY: mobileTimeLayout ? 'visible' : 'auto',
              pr: mobileTimeLayout ? 0 : 0.5,
              '&::-webkit-scrollbar': mobileTimeLayout
                ? undefined
                : {
                    width: 8,
                  },
              '&::-webkit-scrollbar-thumb': mobileTimeLayout
                ? undefined
                : {
                    backgroundColor: colors.app.cards.shadowHover,
                    borderRadius: 999,
                  },
            }}
          >
            <Stack spacing={0.65} role="list">
              {timelineBlocks.map((block, blockIndex) => (
                <Box key={block.key} role="listitem" sx={{ width: '100%' }}>
                  {block.timeLabel ? (
                    <Typography
                    sx={{
                      fontSize: '0.66rem',
                      fontWeight: 900,
                      letterSpacing: '0.10em',
                      textTransform: 'uppercase',
                      color: TEXT_SECONDARY,
                      px: 0.25,
                      pb: 0.45,
                    }}
                    >
                      {block.timeLabel}
                    </Typography>
                  ) : null}

                  <Stack spacing={0.45} role="list">
                    {block.items.map((item, itemIndex) => {
                      const { entry, presentation, key } = item;
                      const isLastBlock = blockIndex === timelineBlocks.length - 1;
                      const isLastItem = itemIndex === block.items.length - 1;
                      return (
                        <UnifiedTimelineEntry
                          key={key}
                          isLast={isLastBlock && isLastItem}
                          entry={entry}
                          presentation={presentation}
                          timeString={null}
                          showActions={true}
                          onEditEntry={() => handleStartEdit(entry)}
                          onDeleteEntry={() => handleDeleteEntry(entry)}
                          actionMenuDisabled={Boolean(actionLoadingId)}
                          isEditing={editingEntryId === entry.id}
                          editText={editText}
                          onEditTextChange={setEditText}
                          onSaveEdit={() => handleSaveEdit(entry)}
                          onCancelEdit={handleCancelEdit}
                        />
                      );
                    })}
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
      )}

    </Box>
  );
};

export default UnifiedTimeline;
