import React, { useState } from "react";
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
import IncidentDetails from "./parts/IncidentDetails";
import GroupedIncidentDetails from "./parts/GroupedIncidentDetails";
import DailyHabitDetails from "./parts/DailyHabitDetails";
import DailyNoteDetails from "./parts/DailyNoteDetails";
import JournalDetails from "./parts/JournalDetails";
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
}) => {
  const theme = useTheme();

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
      {summary && entries.length > 0 && (
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
          <Typography variant="body2" color="text.secondary">
            {summary.totalEntries} total activities
            {summary.incidentCount > 0 && ` • ${summary.incidentCount} incidents`}
            {summary.journalCount > 0 && ` • ${summary.journalCount} journal entries`}
            {summary.dailyLogCount > 0 && ` • ${summary.dailyLogCount} daily habits`}
            {summary.lastActivityTime && ` • Last activity at ${summary.lastActivityTime}`}
          </Typography>
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
        <Box sx={{ position: "relative", mt: 2 }}>
          {/* Vertical Timeline Line */}
          <Box
            sx={{
              position: "absolute",
              left: 20,
              top: 0,
              bottom: 0,
              width: 2,
              bgcolor: "divider",
              zIndex: 1,
            }}
          />

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
                typeForTimeline = 'journal';
              } else {
                // Fallback to existing logic for backward compatibility
                typeForTimeline = entry.timelineType || entry.type;
              }
              const entryType = mapLegacyType(typeForTimeline);
              const meta = getEntryTypeMeta(typeForTimeline);
              const entryLabel = meta.label.replace(/s$/, '');
              const entryColor = theme.palette.timeline.entries[meta.key] || theme.palette.primary.main;

              return (
                <TimelineItem
                  key={`${entry.type}-${entry.id}-${entryIndex}`}
                  color={entryColor}
                  icon={meta.icon}
                  ariaLabel={`${entryLabel} at ${timeString}`}
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
                      {entryType === ENTRY_TYPE.DAILY_NOTE && (<DailyNoteDetails entry={entry} />)}
                      {entryType === ENTRY_TYPE.JOURNAL && (<JournalDetails entry={entry} />)}

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
