import React from "react";
import {
  Box,
  Typography,
  Stack,
  CircularProgress,
  Alert,
  Skeleton,
  Avatar,
  IconButton,
  TextField,
  Button,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import { doc, updateDoc } from 'firebase/firestore';
import { getEntryTypeMeta, mapLegacyType, ENTRY_TYPE } from "../../constants/timeline";
import { getLogTypeByCategory, getLogTypeByEntry } from "../../constants/logTypeRegistry";

import TimelineFilters from "./TimelineFilters";
import { useUnifiedTimelineData } from "../../hooks/useUnifiedTimelineData";
import { useRole } from "../../contexts/RoleContext";
import { USER_ROLES } from "../../constants/roles";
import IncidentDetails from "./parts/IncidentDetails";
import GroupedIncidentDetails from "./parts/GroupedIncidentDetails";
import DailyHabitDetails from "./parts/DailyHabitDetails";
// DailyNoteDetails removed - no longer used (legacy progressNotes)
import DailyLogDetails from "./parts/DailyLogDetails";
import TherapyNoteDetails from "./parts/TherapyNoteDetails";
import EntryHeader from "./parts/EntryHeader";
import TimelineItem from "./parts/TimelineItem";
import { CATEGORY_COLORS } from "../../constants/categoryColors";
import { trackRenderDebug, useMountDebug } from "../../utils/renderDebug";
import { auth, db } from "../../services/firebase";
import colors from "../../assets/theme/colors";

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
  streakLabel = '',
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
      const habitColor = entry.categoryColor || colors.app.timeline.dailyHabit;
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
  const [entryMenuAnchor, setEntryMenuAnchor] = React.useState(null);
  const [entryMenuEntry, setEntryMenuEntry] = React.useState(null);
  const [localEntryUpdates, setLocalEntryUpdates] = React.useState({});
  const [deletedEntryIds, setDeletedEntryIds] = React.useState({});
  const currentUser = auth.currentUser;

  const extractTags = React.useCallback((inputText = '') => {
    const tagRegex = /#(\w+)/g;
    const matches = [...inputText.matchAll(tagRegex)];
    return matches.map((match) => match[1]);
  }, []);

  const handleStartEdit = React.useCallback((entry) => {
    setEditingEntryId(entry.id);
    setEditText(entry.text || '');
  }, []);

  const handleEntryMenuOpen = React.useCallback((event, entry) => {
    setEntryMenuAnchor(event.currentTarget);
    setEntryMenuEntry(entry);
  }, []);

  const handleEntryMenuClose = React.useCallback(() => {
    setEntryMenuAnchor(null);
    setEntryMenuEntry(null);
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
    const entryLabel = entry.collection === 'incidents'
      ? (entry.incidentCategoryLabel || defaultEntryLabel)
      : entry.collection === 'dailyCare'
        ? (entry.categoryLabel || defaultEntryLabel)
        : entry.collection === 'dailyLogs'
          ? (entry.titlePrefix
            || entry.title
            || entry.label
            || entry.categoryLabel
            || categoryMeta?.trackLabel
            || categoryMeta?.displayLabel
            || defaultEntryLabel)
          : (entry.title || defaultEntryLabel);
    const timelineColors = resolveCategoryColor(entry);
    const entryColor = timelineColors.dot;
    const entryIcon = entry.collection === 'incidents'
      ? (entry.incidentCategoryIcon || meta.icon)
      : entry.collection === 'dailyCare'
        ? (entry.categoryIcon || meta.icon)
        : (entry.categoryIcon || meta.icon);

    const labelTextColor = getContrastText(entryColor);

    return { entryType, meta, entryLabel, timelineColors, entryColor, entryIcon, labelTextColor };
  }, [getContrastText, resolveCategoryColor]);

  const renderEntryBody = React.useCallback((entry, entryType) => {
    if (entryType === ENTRY_TYPE.INCIDENT) {
      return entry.isGroupedIncident
        ? <GroupedIncidentDetails entry={entry} />
        : <IncidentDetails entry={entry} />;
    }
    if (entryType === ENTRY_TYPE.DAILY_HABIT) {
      return <DailyHabitDetails entry={entry} />;
    }
    if (entry.collection === 'dailyLogs') {
      return <DailyLogDetails entry={entry} />;
    }
    if (entryType === ENTRY_TYPE.THERAPY_NOTE) {
      return <TherapyNoteDetails entry={entry} />;
    }
    return null;
  }, []);

  const getMobileEntrySummary = React.useCallback((entry, entryType) => {
    if (entryType === ENTRY_TYPE.INCIDENT) {
      return entry.summary || entry.description || entry.notes || entry.remedy || null;
    }

    if (entryType === ENTRY_TYPE.DAILY_HABIT) {
      return entry.notes || entry.summary || entry.valueLabel || entry.label || null;
    }

    if (entryType === ENTRY_TYPE.THERAPY_NOTE) {
      return entry.summary || entry.note || entry.notes || entry.content || null;
    }

    if ([ENTRY_TYPE.DAILY_LOG, ENTRY_TYPE.IMPORTANT_MOMENT, ENTRY_TYPE.BEHAVIOR, ENTRY_TYPE.HEALTH, ENTRY_TYPE.MOOD, ENTRY_TYPE.SLEEP, ENTRY_TYPE.FOOD, ENTRY_TYPE.BATHROOM, ENTRY_TYPE.MILESTONE].includes(entryType)) {
      const primary = entry.text || entry.summary || entry.content || entry.title || null;
      const noteBits = [entry.notes, entry.bathroomDetails?.notes].filter(Boolean);
      if (primary && noteBits.length) {
        return `${primary} — ${noteBits.join(' — ')}`;
      }
      return primary || noteBits.join(' — ') || null;
    }

    return entry.text || entry.summary || entry.notes || entry.content || null;
  }, []);

  const getMobileEntryAttachment = React.useCallback((entry, entryType) => {
    const inferTypeFromUrl = (url = '') => {
      const lower = String(url).toLowerCase();
      if (lower.match(/\.(mp4|webm|mov|m4v)(\?|$)/)) return 'video';
      if (lower.match(/\.(mp3|wav|m4a|ogg)(\?|$)/)) return 'audio';
      return 'image';
    };

    const normalizeAttachment = (value, fallbackType = 'image') => {
      if (!value) return null;
      if (typeof value === 'string') {
        return {
          url: value,
          type: inferTypeFromUrl(value) || fallbackType,
          filename: 'Attachment',
        };
      }

      if (value && typeof value === 'object') {
        const url = value.url || value.downloadURL || value.mediaURL || '';
        if (!url) return null;
        const mimeType = value.mimeType || '';
        const type = value?.type
          || (mimeType.startsWith('video/')
            ? 'video'
            : mimeType.startsWith('audio/')
              ? 'audio'
              : inferTypeFromUrl(url) || fallbackType);
        return {
          url,
          type,
          filename: value.filename || value.name || 'Attachment',
        };
      }

      return null;
    };

    if (entryType === ENTRY_TYPE.INCIDENT) {
      return normalizeAttachment(entry.mediaURL || entry.mediaAttachments?.[0], 'image');
    }

    if (entryType === ENTRY_TYPE.DAILY_HABIT) {
      return normalizeAttachment(entry.mediaUrls?.[0], 'image');
    }

    if ([ENTRY_TYPE.DAILY_LOG, ENTRY_TYPE.IMPORTANT_MOMENT, ENTRY_TYPE.BEHAVIOR, ENTRY_TYPE.HEALTH, ENTRY_TYPE.MOOD, ENTRY_TYPE.SLEEP, ENTRY_TYPE.FOOD, ENTRY_TYPE.MILESTONE].includes(entryType)) {
      return normalizeAttachment(entry.mediaURL || entry.mediaUrls?.[0] || entry.mediaAttachments?.[0], 'image');
    }

    return null;
  }, []);

  const getMobileEntryMeta = React.useCallback((entry, entryType) => {
    if (entryType === ENTRY_TYPE.INCIDENT) {
      const meta = [];
      if (entry.severity) {
        meta.push(`Severity ${entry.severity}/10`);
      }
      if (entry.duration) {
        meta.push(`Lasted ${entry.duration}`);
      }
      if (entry.mediaURL || entry.mediaAttachments?.length > 0) {
        meta.push('Media attached');
      }
      return meta.join(' • ') || null;
    }

    if (entryType === ENTRY_TYPE.DAILY_HABIT) {
      const meta = [];
      if (entry.level) {
        meta.push(`Level ${entry.level}/10`);
      }
      if (entry.mediaUrls?.length > 0) {
        meta.push(`${entry.mediaUrls.length} attachment${entry.mediaUrls.length > 1 ? 's' : ''}`);
      }
      return meta.join(' • ') || null;
    }

    if ([ENTRY_TYPE.JOURNAL, ENTRY_TYPE.IMPORTANT_MOMENT, ENTRY_TYPE.BEHAVIOR, ENTRY_TYPE.HEALTH, ENTRY_TYPE.MOOD, ENTRY_TYPE.SLEEP, ENTRY_TYPE.FOOD, ENTRY_TYPE.MILESTONE].includes(entryType)) {
      const meta = [];
      if (entry.tags?.length > 0) {
        meta.push(`#${entry.tags[0]}`);
      }
      if (entry.mediaURL || entry.mediaUrls?.length > 0 || entry.mediaAttachments?.length > 0 || entry.voiceMemoURL) {
        meta.push('Media attached');
      }
      return meta.join(' • ') || null;
    }

    return null;
  }, []);

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
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Typography>
            {streakLabel ? (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.6,
                  px: 1.15,
                  py: 0.7,
                  borderRadius: '9999px',
                  bgcolor: colors.landing.sageLight,
                  border: `1px solid ${colors.landing.borderLight}`,
                  color: colors.landing.heroText,
                  whiteSpace: 'nowrap',
                }}
              >
                <Typography sx={{ fontSize: '0.82rem', lineHeight: 1 }}>
                  🔥
                </Typography>
                <Typography sx={{ fontSize: '0.76rem', fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1 }}>
                  {streakLabel}
                </Typography>
              </Box>
            ) : null}
          </Box>
          
          {/* Basic Summary */}
          <Typography variant="body2" color="text.secondary">
            {summary.totalEntries} entries
            {summary.lastActivityTime && ` • Last activity at ${summary.lastActivityTime}`}
          </Typography>

          {/* Care Owner Enhanced Summary */}
          {userRole === USER_ROLES.CARE_OWNER && summary.roleBreakdown && (
            <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }} color="primary">
                👑 Team Contributions Today
              </Typography>
              <Typography variant="body2" color="text.secondary">
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

      {/* Timeline Content */}
      {visibleEntries.length === 0 ? (
        // Empty state
        mobileTimeLayout ? (
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
            <Typography variant="body1" sx={{ fontWeight: 700, mb: 0.25, color: colors.landing.heroText, textAlign: 'center' }}>
              {childDisplayName}&apos;s day is a blank canvas!
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.76rem",
                lineHeight: 1.45,
                color: colors.landing.textMuted,
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
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '9999px',
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.landing.sageLight,
                color: colors.brand.ink,
                border: `1px solid ${colors.landing.borderLight}`,
                boxShadow: `0 8px 18px ${colors.landing.shadowSoft}`,
                mb: 0.75,
              }}
            >
              <FavoriteBorderOutlinedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 700,
                mb: 0.5,
                color: colors.landing.heroText,
                fontSize: '1.05rem',
                lineHeight: 1.25,
                textAlign: 'center',
              }}
            >
              {childDisplayName}&apos;s day is a blank canvas!
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.76rem",
                lineHeight: 1.45,
                color: colors.landing.textMuted,
                maxWidth: 250,
                mx: "auto",
                textAlign: 'center',
              }}
            >
              Whenever you're ready, use the buttons above to record a moment.
            </Typography>
          </Box>
        )
      ) : (
        // Vertical Timeline with color-coded dots
        mobileTimeLayout ? (
          <Box
            sx={{
              mt: 2,
              minHeight: mobileTimelineMinHeight,
              px: { xs: 0, md: 0.5 },
              backgroundColor: colors.app.cards.background,
              borderRadius: '14px',
            }}
          >
              <Stack spacing={1.25} role="list">
                {visibleEntries.map((entry, entryIndex) => {
                  if (!entry) {
                    return null;
                  }

                const timestamp = new Date(entry.timestamp);
                const timeString = timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const presentation = getEntryPresentation(entry);
                const canEditDesktopEntry = entry.collection === 'dailyLogs'
                  && ((entry.createdBy || entry.userId || entry.authorId) === currentUser?.uid);
                const mobileAttachment = getMobileEntryAttachment(entry, presentation.entryType);
                const mobileMeta = getMobileEntryMeta(entry, presentation.entryType);
                const canEditMobileEntry = entry.collection === 'dailyLogs'
                  && ((entry.createdBy || entry.userId || entry.authorId) === currentUser?.uid);
                const isEditingMobileEntry = editingEntryId === entry.id;
                const loggerInitials = entry.loggedByUser
                  ? String(entry.loggedByUser)
                      .split(/[\s@._-]+/)
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0]?.toUpperCase())
                      .join('')
                      .slice(0, 2)
                  : null;

                return (
                  <Box
                    key={`${entry.type}-${entry.id}-${entryIndex}`}
                    id={`timeline-entry-${entry.id}`}
                    data-entry-id={entry.id}
                    role="listitem"
                    aria-label={`${presentation.entryLabel} at ${timeString}`}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '22px minmax(0, 1fr)', md: '26px minmax(0, 1fr)' },
                      alignItems: 'start',
                      columnGap: { xs: 0.65, md: 0.9 },
                      position: 'relative',
                      backgroundColor: colors.app.cards.background,
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        minHeight: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        backgroundColor: 'transparent',
                        width: 20,
                        justifySelf: 'center',
                      }}
                    >
                      {entryIndex !== visibleEntries.length - 1 ? (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 18,
                            bottom: -24,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '1px',
                            backgroundColor: colors.app.text.darkNeutral,
                          }}
                        />
                      ) : null}
                      <Box
                        sx={{
                          mt: 0.1,
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          backgroundColor: colors.app.cards.background,
                          border: '2px solid',
                          borderColor: presentation.entryColor,
                          boxShadow: `0 2px 6px ${colors.app.cards.shadowPanel}`,
                          zIndex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.72rem',
                          lineHeight: 1,
                        }}
                      >
                        {presentation.entryIcon}
                      </Box>
                    </Box>

                    <Box
                        sx={{
                          px: 1.1,
                          py: 1.05,
                          backgroundColor: colors.app.cards.background,
                          border: `1px solid ${colors.app.cards.border}`,
                          borderRadius: { xs: 0.5, md: 0.7 },
                          boxShadow: `0 1px 2px ${colors.app.cards.shadowSoft}`,
                          display: 'flex',
                          flexDirection: 'column',
                        gap: 0.85,
                      }}
                      >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                          gap: 0.75,
                      }}
                      id={`timeline-entry-${entry.id}`}
                      data-entry-id={entry.id}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0, flexWrap: 'wrap' }}>
                          <Box
                            sx={{
                              px: 1.1,
                              py: 0.44,
                              borderRadius: 0.35,
                              bgcolor: presentation.entryColor,
                              color: presentation.labelTextColor,
                              fontSize: '0.84rem',
                              fontWeight: 800,
                              lineHeight: 1.1,
                              display: 'inline-flex',
                              alignItems: 'center',
                              alignSelf: 'flex-start',
                            }}
                          >
                            {presentation.entryLabel}
                          </Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.secondary',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              lineHeight: 1.1,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {timeString}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, flexShrink: 0 }}>
                          {canEditMobileEntry ? (
                            <IconButton
                              size="small"
                              onClick={(event) => handleEntryMenuOpen(event, entry)}
                              disabled={Boolean(actionLoadingId)}
                              sx={{
                                width: 26,
                                height: 26,
                                borderRadius: 0.35,
                                color: 'text.secondary',
                                backgroundColor: colors.app.cards.shadowPanel,
                              }}
                            >
                              <MoreVertIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          ) : null}
                          {loggerInitials ? (
                            <Avatar
                              sx={{
                                width: 24,
                                height: 24,
                                flexShrink: 0,
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                bgcolor: colors.app.cards.background,
                                color: 'text.secondary',
                                border: `1px solid ${colors.app.cards.border}`,
                              }}
                              title={entry.loggedByUser}
                            >
                              {loggerInitials}
                            </Avatar>
                          ) : null}
                        </Box>
                      </Box>

                      {isEditingMobileEntry ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                          <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            value={editText}
                            onChange={(event) => setEditText(event.target.value)}
                            size="small"
                          />
                          <Box sx={{ display: 'flex', gap: 0.6 }}>
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<SaveIcon />}
                              onClick={() => handleSaveEdit(entry)}
                              disabled={actionLoadingId === entry.id || !editText.trim()}
                              sx={{ textTransform: 'none' }}
                            >
                              Save
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<CloseIcon />}
                              onClick={handleCancelEdit}
                              disabled={actionLoadingId === entry.id}
                              sx={{ textTransform: 'none' }}
                            >
                              Cancel
                            </Button>
                          </Box>
                        </Box>
                      ) : getMobileEntrySummary(entry, presentation.entryType) ? (
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.primary',
                            fontSize: '0.94rem',
                            lineHeight: 1.35,
                            wordBreak: 'break-word',
                          }}
                        >
                          {getMobileEntrySummary(entry, presentation.entryType)}
                        </Typography>
                      ) : null}

                      {mobileAttachment && !isEditingMobileEntry ? (
                            <Box
                              sx={{
                                width: { xs: 136, md: 176 },
                                maxWidth: '100%',
                                borderRadius: 1,
                                overflow: 'hidden',
                            border: `1px solid ${colors.app.cards.border}`,
                            backgroundColor: colors.app.cards.shadowPanel,
                          }}
                        >
                          {mobileAttachment.type === 'video' ? (
                            <Box
                              component="video"
                              controls
                              src={mobileAttachment.url}
                              sx={{
                                display: 'block',
                                width: '100%',
                                height: { xs: 102, md: 132 },
                                objectFit: 'cover',
                                bgcolor: colors.app.text.darkNeutral,
                              }}
                            />
                          ) : mobileAttachment.type === 'audio' ? (
                            <Box sx={{ p: 1 }}>
                              <audio controls src={mobileAttachment.url} style={{ width: '100%' }} />
                            </Box>
                          ) : (
                            <Box
                              component="img"
                              src={mobileAttachment.url}
                              alt={mobileAttachment.filename || presentation.entryLabel}
                              sx={{
                                display: 'block',
                                width: '100%',
                                height: { xs: 102, md: 132 },
                                objectFit: 'cover',
                              }}
                              loading="lazy"
                              referrerPolicy="no-referrer"
                            />
                          )}
                          {mobileAttachment.filename ? (
                            <Box
                              sx={{
                                px: 1,
                                py: 0.45,
                                borderTop: `1px solid ${colors.app.cards.border}`,
                                bgcolor: colors.app.cards.shadowPanel,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  color: 'text.secondary',
                                  fontSize: '0.68rem',
                                  lineHeight: 1.2,
                                  display: 'block',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {mobileAttachment.filename}
                              </Typography>
                            </Box>
                          ) : null}
                        </Box>
                      ) : null}

                      {mobileMeta && !isEditingMobileEntry ? (
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            fontSize: '0.72rem',
                            lineHeight: 1.3,
                          }}
                        >
                          {mobileMeta}
                        </Typography>
                      ) : null}
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        ) : (
          <Box
            sx={{
              position: "relative",
              mt: 2,
              minHeight: mobileTimelineMinHeight,
            }}
          >
            <Box
              sx={{
                maxHeight: { xs: 360, md: 520 },
                overflowY: 'auto',
                pr: 0.5,
                '&::-webkit-scrollbar': {
                  width: 8,
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: colors.app.cards.shadowHover,
                  borderRadius: 999,
                },
              }}
            >
              <Stack spacing={0} role="list">
                {visibleEntries.map((entry, entryIndex) => {
                  if (!entry) {
                    return null;
                  }

                  const timestamp = new Date(entry.timestamp);
                  const timeString = timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const presentation = getEntryPresentation(entry);
                  const canEditDesktopEntry = entry.collection === 'dailyLogs'
                    && ((entry.createdBy || entry.userId || entry.authorId) === currentUser?.uid);

                  return (
                    <TimelineItem
                      key={`${entry.type}-${entry.id}-${entryIndex}`}
                      entryId={entry.id}
                      color={presentation.entryColor}
                      icon={presentation.entryIcon}
                      ariaLabel={`${presentation.entryLabel} at ${timeString}`}
                      isFirst={entryIndex === 0}
                      isLast={entryIndex === visibleEntries.length - 1}
                      hideAnchor={false}
                      neutralRail={false}
                      cardBackground={colors.app.cards.background}
                      cardBorderColor={presentation.timelineColors.border}
                      cardAccentColor={null}
                    >
                      <EntryHeader
                        entryLabel={presentation.entryLabel}
                        timeString={timeString}
                        entryColor={presentation.entryColor}
                        labelBackground={presentation.entryColor}
                        labelTextColor={presentation.labelTextColor}
                        loggedByUser={entry.loggedByUser}
                        showActions={canEditDesktopEntry}
                        onOpenActionsMenu={(event) => handleEntryMenuOpen(event, entry)}
                        actionMenuDisabled={Boolean(actionLoadingId)}
                      />
                      {renderEntryBody(entry, presentation.entryType)}
                    </TimelineItem>
                  );
                })}
              </Stack>
            </Box>
          </Box>
        )
      )}

      <Menu
        anchorEl={entryMenuAnchor}
        open={Boolean(entryMenuAnchor)}
        onClose={handleEntryMenuClose}
        onClick={handleEntryMenuClose}
      >
        <MenuItem
          onClick={() => entryMenuEntry && handleStartEdit(entryMenuEntry)}
          disabled={!entryMenuEntry || Boolean(actionLoadingId)}
        >
          <EditIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => entryMenuEntry && handleDeleteEntry(entryMenuEntry)}
          disabled={!entryMenuEntry || Boolean(actionLoadingId)}
          sx={{ color: colors.semantic?.error || '#EF4444' }}
        >
          <DeleteIcon sx={{ fontSize: 16, mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UnifiedTimeline;
