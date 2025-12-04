import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Stack,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

import EventTimelineItem from './EventTimelineItem';
import TimeGroupHeader from './TimeGroupHeader';
import { groupEventsByDay, groupEventsByPeriod } from '../../utils/timelineUtils';

/**
 * EventTimeline - Main component for displaying Events in chronological order
 *
 * Features:
 * - Shows Events from all sources (SMS, WhatsApp, web) with source indicators
 * - Display classifier tags/buckets when available
 * - Chronological ordering with time-based grouping
 * - Source filtering and search capabilities
 * - Responsive design with timeline visualizations
 *
 * @param {Object} props
 * @param {Array} props.events - Array of Event objects to display
 * @param {boolean} props.loading - Whether events are loading
 * @param {Error} props.error - Error state if events failed to load
 * @param {Object} props.currentChild - Current child object
 * @param {Object} props.filters - Active filters
 * @param {Function} props.onRefresh - Callback to refresh events
 * @param {Function} props.onNotification - Callback to show notifications
 */
const EventTimeline = ({
  events = [],
  loading = false,
  error = null,
  currentChild,
  filters = {},
  onRefresh,
  onNotification
}) => {
  const theme = useTheme();

  // Group events by day for better organization
  const groupedEvents = useMemo(() => {
    if (!events.length) return [];

    // First group by day
    const dayGroups = groupEventsByDay(events);

    // Then group each day's events by time period (morning/afternoon/evening)
    return dayGroups.map(dayGroup => ({
      ...dayGroup,
      periodGroups: groupEventsByPeriod(dayGroup.events)
    }));
  }, [events]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const total = events.length;
    const sources = [...new Set(events.map(e => e.source))];
    const buckets = [...new Set(events.flatMap(e => e.buckets || []))];

    const sourceCounts = sources.reduce((acc, source) => {
      acc[source] = events.filter(e => e.source === source).length;
      return acc;
    }, {});

    return {
      total,
      sources,
      buckets,
      sourceCounts,
      dateRange: events.length > 0 ? {
        start: new Date(Math.min(...events.map(e => new Date(e.timestamp)))),
        end: new Date(Math.max(...events.map(e => new Date(e.timestamp))))
      } : null
    };
  }, [events]);

  // Handle refresh
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
      onNotification?.('Timeline refreshed', 'success');
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
        <CircularProgress size={48} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading events...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <IconButton size="small" onClick={handleRefresh}>
            <RefreshIcon />
          </IconButton>
        }
      >
        Failed to load events: {error.message}
      </Alert>
    );
  }

  // Empty state
  if (events.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <EventIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No events found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {Object.keys(filters).some(k => filters[k]?.length > 0 || filters[k])
            ? 'Try adjusting your filters to see more events'
            : `No events have been recorded for ${currentChild?.name || 'this child'} yet`
          }
        </Typography>
        {onRefresh && (
          <IconButton onClick={handleRefresh} size="large">
            <RefreshIcon />
          </IconButton>
        )}
      </Box>
    );
  }

  return (
    <Box>
      {/* Summary Header */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Event Timeline
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {summary.total} events
              {summary.dateRange && (
                <> from {summary.dateRange.start.toLocaleDateString()} to {summary.dateRange.end.toLocaleDateString()}</>
              )}
            </Typography>
          </Box>

          <Tooltip title="Refresh timeline">
            <IconButton onClick={handleRefresh} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Source Summary */}
        {summary.sources.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
              SOURCES
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {summary.sources.map(source => (
                <Chip
                  key={source}
                  label={`${source}: ${summary.sourceCounts[source]}`}
                  size="small"
                  variant="outlined"
                  icon={getSourceIcon(source)}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Bucket Summary */}
        {summary.buckets.length > 0 && (
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
              CATEGORIES
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {summary.buckets.slice(0, 10).map(bucket => (
                <Chip
                  key={bucket}
                  label={bucket}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              ))}
              {summary.buckets.length > 10 && (
                <Chip
                  label={`+${summary.buckets.length - 10} more`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        )}
      </Paper>

      {/* Timeline Content */}
      <Box sx={{ position: 'relative' }}>
        {/* Main timeline line */}
        <Box
          sx={{
            position: 'absolute',
            left: 20,
            top: 0,
            bottom: 0,
            width: 2,
            bgcolor: 'divider',
            zIndex: 1,
          }}
        />

        {/* Day Groups */}
        <Stack spacing={4}>
          {groupedEvents.map((dayGroup, dayIndex) => (
            <Box key={dayGroup.date.toISOString().split('T')[0]}>
              {/* Day Header */}
              <TimeGroupHeader
                date={dayGroup.date}
                count={dayGroup.events.length}
                isToday={isToday(dayGroup.date)}
              />

              {/* Period Groups within the day */}
              <Stack spacing={2} sx={{ mt: 2 }}>
                {dayGroup.periodGroups.map((periodGroup, periodIndex) => (
                  <Box key={periodGroup.period}>
                    {/* Period Header (Morning/Afternoon/Evening) */}
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: 'text.secondary',
                        display: 'block',
                        ml: 6,
                        mb: 1
                      }}
                    >
                      {periodGroup.label} • {periodGroup.events.length} event{periodGroup.events.length !== 1 ? 's' : ''}
                    </Typography>

                    {/* Events in this period */}
                    <Stack spacing={1}>
                      {periodGroup.events.map((event, eventIndex) => (
                        <EventTimelineItem
                          key={`${event.id}-${eventIndex}`}
                          event={event}
                          isLast={
                            dayIndex === groupedEvents.length - 1 &&
                            periodIndex === dayGroup.periodGroups.length - 1 &&
                            eventIndex === periodGroup.events.length - 1
                          }
                        />
                      ))}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

// Helper function to get source icon
const getSourceIcon = (source) => {
  switch (source?.toLowerCase()) {
    case 'sms':
      return '💬';
    case 'whatsapp':
      return '💚';
    case 'web':
      return '🌐';
    case 'email':
      return '📧';
    default:
      return '📱';
  }
};

// Helper function to check if date is today
const isToday = (date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export default EventTimeline;