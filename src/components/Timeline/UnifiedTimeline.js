import React from "react";
import {
  Box,
  Typography,
  Stack,
  CircularProgress,
  Alert,
  Button,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { Timeline as TimelineIcon } from "@mui/icons-material";
import { getEntryTypeMeta, mapLegacyType, ENTRY_TYPE } from "../../constants/timeline";
import { useTheme } from "@mui/material/styles";
import { getAuth } from "firebase/auth";

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
import { getIncidentDisplayInfo } from '../../constants/uiDisplayConstants';
import LogEntryActions from "./parts/LogEntryActions";
import useIsMobile from "../../hooks/useIsMobile";

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
  injectedEntries = []
}) => {
  // Get centralized display info
  const incidentDisplay = getIncidentDisplayInfo();
  const { getUserRoleForChild } = useRole();
  const theme = useTheme();
  const isMobile = useIsMobile();

  // Get user role for this child
  const userRole = getUserRoleForChild(child?.id);

  // Fetch unified timeline data
  const { entries, loading, error, summary } = useUnifiedTimelineData(
    child?.id,
    selectedDate,
    filters
  );
  const currentUserId = getAuth().currentUser?.uid;
  const [localEntries, setLocalEntries] = React.useState([]);
  const [editRequest, setEditRequest] = React.useState({ id: null, focus: null });
  const [compactMode, setCompactMode] = React.useState(false);
  const initialVisibleCount = isMobile ? 6 : 10;
  const [visibleCount, setVisibleCount] = React.useState(initialVisibleCount);

  React.useEffect(() => {
    // Merge fetched entries with injected (optimistic) entries
    const merged = [...entries];
    
    if (injectedEntries?.length > 0) {
      const existingIds = new Set(entries.map(e => e.id));
      // Only add injected entries that:
      // 1. Don't exist in fetched entries
      // 2. Match the selected date
      injectedEntries.forEach(injected => {
        const injectedDate = new Date(injected.timestamp);
        const isSameDate = injectedDate.toDateString() === selectedDate.toDateString();
        
        if (!existingIds.has(injected.id) && isSameDate) {
          // Normalize injected entry if needed to match UnifiedTimeline format
          merged.unshift(injected);
        }
      });
      
      // Re-sort descending
      merged.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
    
    setLocalEntries(merged);
  }, [entries, injectedEntries, selectedDate]);

  React.useEffect(() => {
    setVisibleCount(initialVisibleCount);
  }, [selectedDate?.toDateString?.(), entries.length, initialVisibleCount]);

  const handleLogUpdated = React.useCallback((entryId, updates) => {
    setLocalEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== entryId || entry.collection !== 'logs') {
          return entry;
        }
        const nextEntry = {
          ...entry,
          text: updates.note ?? entry.text,
          tags: updates.tags ?? entry.tags,
          meta: updates.meta ?? entry.meta
        };
        if (entry.originalData) {
          nextEntry.originalData = {
            ...entry.originalData,
            note: updates.note ?? entry.originalData.note,
            tags: updates.tags ?? entry.originalData.tags,
            meta: updates.meta ?? entry.originalData.meta
          };
        }
        return nextEntry;
      })
    );
  }, []);

  const handleEditTags = React.useCallback((entry) => {
    if (!entry?.id) return;
    setEditRequest({ id: entry.id, focus: 'tags' });
  }, []);

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
      {summary && localEntries.length > 0 && (
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
            {summary.totalEntries} total activities
            {summary.incidentCount > 0 && ` • ${summary.incidentCount} ${incidentDisplay.pluralLabelLowercase}`}
            {summary.journalCount > 0 && ` • ${summary.journalCount} journal entries`}
            {summary.dailyHabitCount > 0 && ` • ${summary.dailyHabitCount} daily habits`}
            {summary.therapyNoteCount > 0 && ` • ${summary.therapyNoteCount} therapy notes`}
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
      {localEntries.length === 0 ? (
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
              left: compactMode ? 16 : 20,
              top: 0,
              bottom: 0,
              width: 2,
              bgcolor: "divider",
              zIndex: 1,
            }}
          />

          {/* Timeline Entries */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 1,
              mb: 1,
              flexWrap: "wrap",
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={compactMode}
                  onChange={(event) => setCompactMode(event.target.checked)}
                />
              }
              label={<Typography variant="caption">Compact</Typography>}
              sx={{ m: 0 }}
            />
          </Box>
          <Stack spacing={0} role="list">
          {localEntries.slice(0, visibleCount).map((entry, entryIndex) => {

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
              } else if (entry.collection === 'therapyNotes') {
                typeForTimeline = 'therapyNote';
              } else {
                // Fallback to existing logic for backward compatibility
                typeForTimeline = entry.timelineType || entry.type;
              }
              const entryType = mapLegacyType(typeForTimeline);
              const meta = getEntryTypeMeta(typeForTimeline);
              const entryLabel = meta.label.replace(/s$/, '');
              const entryColor = theme.palette.timeline.entries[meta.key] || theme.palette.primary.main;
              const isTeamLog = entry.collection === 'logs' && currentUserId && entry.createdBy && entry.createdBy !== currentUserId;
              const entryActions = entry.collection === 'logs' ? (
                <LogEntryActions
                  entry={entry}
                  onUpdated={(updates) => handleLogUpdated(entry.id, updates)}
                  forceOpen={editRequest.id === entry.id}
                  focusField={editRequest.focus || 'note'}
                  onForceOpenHandled={() => setEditRequest({ id: null, focus: null })}
                />
              ) : null;

              return (
                <TimelineItem
                  key={`${entry.type}-${entry.id}-${entryIndex}`}
                  color={entryColor}
                  icon={meta.icon}
                  compact={compactMode}
                  ariaLabel={`${entryLabel} at ${timeString}`}
                >
                  <EntryHeader
                    entryLabel={entryLabel}
                    timeString={timeString}
                    entryColor={entryColor}
                    loggedByUser={entry.loggedByUser}
                    actions={entryActions}
                    badgeLabel={isTeamLog ? 'Team log' : null}
                  />

                      {entryType === ENTRY_TYPE.INCIDENT && (
                        entry.isGroupedIncident 
                          ? <GroupedIncidentDetails entry={entry} />
                          : <IncidentDetails entry={entry} />
                      )}
                      {entryType === ENTRY_TYPE.DAILY_HABIT && (<DailyHabitDetails entry={entry} />)}
                      {/* DAILY_NOTE removed - was only used for legacy progressNotes */}
                      {entryType === ENTRY_TYPE.JOURNAL && (
                        <JournalDetails
                          entry={entry}
                          onEditTags={entry.collection === 'logs' ? handleEditTags : null}
                        />
                      )}
                      {entryType === ENTRY_TYPE.THERAPY_NOTE && (<TherapyNoteDetails entry={entry} />)}

                </TimelineItem>
              );
            })}
          </Stack>

          {localEntries.length > visibleCount && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 1.5 }}>
              <Button
                variant="outlined"
                size="small"
                fullWidth={isMobile}
                onClick={() => setVisibleCount((prev) => prev + initialVisibleCount)}
              >
                Show {Math.min(initialVisibleCount, localEntries.length - visibleCount)} more
              </Button>
            </Box>
          )}

          {localEntries.length > initialVisibleCount && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block", textAlign: "center" }}
            >
              Showing {Math.min(visibleCount, localEntries.length)} of {localEntries.length}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default UnifiedTimeline;
