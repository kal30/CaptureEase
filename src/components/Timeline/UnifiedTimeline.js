import React from "react";
import {
  Box,
  Typography,
  Stack,
  CircularProgress,
  Alert,
  Skeleton,
} from "@mui/material";
import { getEntryTypeMeta, mapLegacyType, ENTRY_TYPE } from "../../constants/timeline";
import { useTheme } from "@mui/material/styles";

import TimelineFilters from "./TimelineFilters";
import { useUnifiedTimelineData } from "../../hooks/useUnifiedTimelineData";
import { useRole } from "../../contexts/RoleContext";
import { USER_ROLES } from "../../constants/roles";
import IncidentDetails from "./parts/IncidentDetails";
import GroupedIncidentDetails from "./parts/GroupedIncidentDetails";
import DailyHabitDetails from "./parts/DailyHabitDetails";
// DailyNoteDetails removed - no longer used (legacy progressNotes)
import JournalDetails from "./parts/JournalDetails";
import TherapyNoteDetails from "./parts/TherapyNoteDetails";
import EntryHeader from "./parts/EntryHeader";
import TimelineItem from "./parts/TimelineItem";
import { CATEGORY_COLORS } from "../../constants/categoryColors";

/**
 * UnifiedTimeline - Main unified timeline component
 * Combines incidents, daily logs, journal entries, and follow-ups for a single day
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
}) => {
  const resolveCategoryColor = (entry) => {
    if (entry.isImportantMoment) {
      return CATEGORY_COLORS.importantMoment;
    }

    const categoryKey = CATEGORY_COLORS[entry.category]
      ? entry.category
      : CATEGORY_COLORS[entry.type]
        ? entry.type
        : 'log';

    return CATEGORY_COLORS[categoryKey];
  };

  const { getUserRoleForChild } = useRole();
  const theme = useTheme();

  // Get user role for this child
  const userRole = getUserRoleForChild(child?.id);

  // Fetch unified timeline data
  const { entries, loading, error, summary } = useUnifiedTimelineData(
    child?.id,
    selectedDate,
    filters
  );
  const mobileTimelineMinHeight = { xs: 300, md: 'auto' };

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
          gap: 1.1,
          pt: 1,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
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
              height={92}
              sx={{ flex: 1, borderRadius: 2 }}
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
        />
      )}

      {/* Day Summary Header */}
      {showDaySummary && summary && entries.length > 0 && (
        <Box
          sx={{
            mb: 2,
            p: 2,
            bgcolor: "background.default",
            borderRadius: 1,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Typography>
          
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
      {entries.length === 0 ? (
        // Empty state
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
            py: 3.5,
            px: 2,
            borderRadius: 2,
            cursor: onEmptyStateClick ? "pointer" : "default",
            transition: "background-color 0.2s ease, box-shadow 0.2s ease",
            "&:hover": onEmptyStateClick
              ? {
                  backgroundColor: "action.hover",
                  boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)",
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
              borderRadius: 2,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(148, 163, 184, 0.12)",
              color: "text.disabled",
              mb: 1,
              fontSize: "1.35rem",
              fontWeight: 700,
            }}
          >
            +
          </Box>
          <Typography variant="body1" sx={{ fontWeight: 700 }} color="text.secondary" gutterBottom>
            No entries yet today
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.78rem" }}>
            {Object.keys(filters).length > 0
              ? "Try adjusting your filters or select a different date"
              : "Tap to log something"}
          </Typography>
        </Box>
      ) : (
        // Vertical Timeline with color-coded dots
        <Box
          sx={{
            position: "relative",
            mt: 2,
            minHeight: mobileTimelineMinHeight,
            maxHeight: { xs: 420, md: 520 },
            overflowY: 'auto',
            pr: 0.5,
            '&::-webkit-scrollbar': {
              width: 8,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(148, 163, 184, 0.45)',
              borderRadius: 999,
            },
          }}
        >
          {/* Timeline Entries */}
          <Stack spacing={0} role="list">
            {entries.map((entry, entryIndex) => {

              const timestamp = new Date(entry.timestamp);
              const timeString = timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              // Determine timeline type purely based on collection
              let typeForTimeline;
              if (entry.collection === 'incidents') {
                typeForTimeline = 'incident';
              } else if (entry.collection === 'dailyCare') {
                typeForTimeline = 'dailyHabit';
              } else if (entry.collection === 'dailyLogs') {
                typeForTimeline = entry.timelineType || entry.type || 'journal';
              } else if (entry.collection === 'therapyNotes') {
                typeForTimeline = 'therapyNote';
              } else {
                // Fallback to existing logic for backward compatibility
                typeForTimeline = entry.timelineType || entry.type;
              }
              const entryType = mapLegacyType(typeForTimeline);
              const meta = getEntryTypeMeta(typeForTimeline);
              const defaultEntryLabel = meta.label.replace(/s$/, '');
              const entryLabel = entry.collection === 'dailyLogs'
                ? (entry.title || defaultEntryLabel)
                : defaultEntryLabel;
              const entryColor = resolveCategoryColor(entry).dot;
              const timelineColors = resolveCategoryColor(entry);

              return (
                <TimelineItem
                  key={`${entry.type}-${entry.id}-${entryIndex}`}
                  color={entryColor}
                  icon={entry.isImportantMoment ? '⭐' : meta.icon}
                  ariaLabel={`${entryLabel} at ${timeString}`}
                  isFirst={entryIndex === 0}
                  isLast={entryIndex === entries.length - 1}
                  cardBackground={entry.isImportantMoment ? CATEGORY_COLORS.importantMoment.bg : '#ffffff'}
                  cardBorderColor={entry.isImportantMoment ? CATEGORY_COLORS.importantMoment.border : 'rgba(148, 163, 184, 0.18)'}
                >
                  <EntryHeader
                    entryLabel={entryLabel}
                    timeString={timeString}
                    entryColor={entryColor}
                    loggedByUser={entry.loggedByUser}
                    badgeLabel={entry.isImportantMoment ? '⭐ Important' : null}
                    badgeBg={entry.isImportantMoment ? timelineColors.bg : null}
                    badgeColor={entry.isImportantMoment ? timelineColors.text : null}
                  />

                      {entryType === ENTRY_TYPE.INCIDENT && (
                        entry.isGroupedIncident 
                          ? <GroupedIncidentDetails entry={entry} />
                          : <IncidentDetails entry={entry} />
                      )}
                      {entryType === ENTRY_TYPE.DAILY_HABIT && (<DailyHabitDetails entry={entry} />)}
                      {/* DAILY_NOTE removed - was only used for legacy progressNotes */}
                      {[ENTRY_TYPE.JOURNAL, ENTRY_TYPE.IMPORTANT_MOMENT, ENTRY_TYPE.BEHAVIOR, ENTRY_TYPE.HEALTH, ENTRY_TYPE.MOOD, ENTRY_TYPE.SLEEP, ENTRY_TYPE.FOOD, ENTRY_TYPE.MILESTONE].includes(entryType) && (
                        <JournalDetails entry={entry} />
                      )}
                      {entryType === ENTRY_TYPE.THERAPY_NOTE && (<TherapyNoteDetails entry={entry} />)}

                </TimelineItem>
              );
            })}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default UnifiedTimeline;
