import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Button,
  Divider,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  FileDownload as ExportIcon,
  Refresh as RefreshIcon,
  CalendarMonth as CalendarIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { getTimelineEntries, filterTimelineEntries, exportTimelineData } from '../../services/timelineService';
import TimelineEntry from '../../components/Timeline/TimelineEntry';
import TimelineFilters from '../../components/Timeline/TimelineFilters';
import PrintableTimelineCalendar from '../../components/Timeline/PrintableTimelineCalendar';
import DayDetailModal from '../../components/Timeline/DayDetailModal';

const TimelineTab = ({ childId }) => {
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    types: [],
    startDate: null,
    endDate: null,
    searchText: '',
    author: ''
  });
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'timeline'
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDayEntries, setSelectedDayEntries] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const theme = useTheme();

  useEffect(() => {
    if (!childId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = getTimelineEntries(childId, (timelineEntries) => {
      setEntries(timelineEntries);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [childId]);

  // Apply filters whenever entries or filters change
  useEffect(() => {
    const filtered = filterTimelineEntries(entries, filters);
    setFilteredEntries(filtered);
  }, [entries, filters]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleExport = (format = 'json') => {
    try {
      const exportData = exportTimelineData(filteredEntries, format);
      const blob = new Blob([exportData], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `timeline-${childId}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      setError('Failed to export timeline data');
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    // The useEffect will automatically refetch when loading changes
  };

  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  const handleDayClick = (day, dayEntries) => {
    setSelectedDay(day);
    setSelectedDayEntries(dayEntries);
  };

  const handleCloseDayModal = () => {
    setSelectedDay(null);
    setSelectedDayEntries(null);
  };

  if (!childId) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No child selected. Please select a child from the dashboard.
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mb: 3 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {viewMode === 'calendar' ? 'Calendar View' : 'Timeline'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {viewMode === 'calendar' 
              ? 'Visual overview of activities and patterns' 
              : 'Chronological view of all activities and progress'
            }
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* View Mode Toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                color: 'text.primary',
                borderColor: 'divider',
                '&.Mui-selected': {
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark
                  }
                }
              }
            }}
          >
            <ToggleButton value="calendar" aria-label="calendar view">
              <CalendarIcon sx={{ mr: 1 }} />
              Calendar
            </ToggleButton>
            <ToggleButton value="timeline" aria-label="timeline view">
              <TimelineIcon sx={{ mr: 1 }} />
              Timeline
            </ToggleButton>
          </ToggleButtonGroup>
          
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading}
              sx={{
                bgcolor: theme.palette.success.main,
                color: 'white',
                '&:hover': {
                  bgcolor: theme.palette.success.dark
                },
                '&:disabled': {
                  bgcolor: 'action.disabled',
                  color: 'action.disabled'
                }
              }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<ExportIcon />}
              onClick={() => handleExport('csv')}
              disabled={loading || filteredEntries.length === 0}
              sx={{
                bgcolor: theme.palette.success.main,
                color: 'white',
                '&:hover': {
                  bgcolor: theme.palette.success.dark
                },
                '&:disabled': {
                  bgcolor: 'action.disabled',
                  color: 'action.disabled'
                }
              }}
            >
              Export
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Filters - Only show for timeline view */}
      {viewMode === 'timeline' && (
        <TimelineFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          totalEntries={entries.length}
          filteredEntries={filteredEntries.length}
        />
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Content */}
      {!loading && (
        <>
          {entries.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 6,
                textAlign: 'center',
                bgcolor: alpha(theme.palette.background.default, 0.5),
                border: `1px dashed ${theme.palette.divider}`,
                borderRadius: 2
              }}
            >
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No timeline entries yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start adding daily notes, progress updates, or mood logs to see them here.
              </Typography>
              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => {
                  // You can add navigation logic here to go to a specific tab
                  // For now, we'll just suggest they use other tabs
                }}
              >
                Add Your First Entry
              </Button>
            </Paper>
          ) : (
            <>
              {/* Calendar View */}
              {viewMode === 'calendar' && (
                <PrintableTimelineCalendar
                  entries={entries}
                  onDayClick={handleDayClick}
                  filters={filters}
                />
              )}

              {/* Timeline View */}
              {viewMode === 'timeline' && (
                <>
                  {filteredEntries.length === 0 ? (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 6,
                        textAlign: 'center',
                        bgcolor: alpha(theme.palette.background.default, 0.5),
                        border: `1px dashed ${theme.palette.divider}`,
                        borderRadius: 2
                      }}
                    >
                      <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        No entries match your filters
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Try adjusting your filters to see more entries.
                      </Typography>
                    </Paper>
                  ) : (
                    <Box sx={{ position: 'relative' }}>
                      {/* Timeline Entries */}
                      {filteredEntries.map((entry, index) => (
                        <TimelineEntry
                          key={`${entry.type}-${entry.id}`}
                          entry={entry}
                          isFirst={index === 0}
                          isLast={index === filteredEntries.length - 1}
                        />
                      ))}

                      {/* End of Timeline Marker */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 4, mb: 2 }}>
                        <Divider sx={{ flex: 1, borderColor: alpha(theme.palette.divider, 0.3) }} />
                        <Typography 
                          variant="caption" 
                          color="text.secondary" 
                          sx={{ 
                            px: 2, 
                            py: 1, 
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            border: `1px solid ${alpha(theme.palette.divider, 0.3)}`
                          }}
                        >
                          End of timeline
                        </Typography>
                        <Divider sx={{ flex: 1, borderColor: alpha(theme.palette.divider, 0.3) }} />
                      </Box>
                    </Box>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}

      {/* Day Detail Modal */}
      <DayDetailModal
        open={!!selectedDay}
        onClose={handleCloseDayModal}
        day={selectedDay}
        dayEntries={selectedDayEntries}
        currentDate={currentDate}
      />
    </Box>
  );
};

export default TimelineTab;