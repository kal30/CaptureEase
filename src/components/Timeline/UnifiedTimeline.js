import React from "react";
import {
  Box,
  Typography,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Timeline as TimelineIcon } from "@mui/icons-material";
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
  showFilters = true,
  showDaySummary = true,
}) => {
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

  // Note: entries are already pre-filtered; grouping by period is optional and not used here.


  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
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
        <Box sx={{ textAlign: "center", py: 6 }}>
          <TimelineIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No activity for {selectedDate.toLocaleDateString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {Object.keys(filters).length > 0
              ? "Try adjusting your filters or select a different date"
              : "Start logging activities to see them here"}
          </Typography>
        </Box>
      ) : (
        // Vertical Timeline with color-coded dots
        <Box
          sx={{
            position: "relative",
            mt: 2,
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
              const entryColor = entry.color || theme.palette.timeline.entries?.[meta.key] || theme.palette.primary.main;

              return (
                <TimelineItem
                  key={`${entry.type}-${entry.id}-${entryIndex}`}
                  color={entryColor}
                  icon={meta.icon}
                  ariaLabel={`${entryLabel} at ${timeString}`}
                  isFirst={entryIndex === 0}
                  isLast={entryIndex === entries.length - 1}
                >
                  <EntryHeader
                    entryLabel={entryLabel}
                    timeString={timeString}
                    entryColor={entryColor}
                    loggedByUser={entry.loggedByUser}
                  />

                      {entryType === ENTRY_TYPE.INCIDENT && (
                        entry.isGroupedIncident 
                          ? <GroupedIncidentDetails entry={entry} />
                          : <IncidentDetails entry={entry} />
                      )}
                      {entryType === ENTRY_TYPE.DAILY_HABIT && (<DailyHabitDetails entry={entry} />)}
                      {/* DAILY_NOTE removed - was only used for legacy progressNotes */}
                      {[ENTRY_TYPE.JOURNAL, ENTRY_TYPE.BEHAVIOR, ENTRY_TYPE.HEALTH, ENTRY_TYPE.MOOD, ENTRY_TYPE.SLEEP, ENTRY_TYPE.FOOD, ENTRY_TYPE.MILESTONE].includes(entryType) && (
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
