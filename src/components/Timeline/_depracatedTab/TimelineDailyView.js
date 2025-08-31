import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Tabs,
  Tab,
  Paper,
  Divider
} from '@mui/material';
import { Timeline as TimelineIcon, ViewDay as DayViewIcon, ViewList as ListViewIcon } from '@mui/icons-material';
import DailyLogEntry from '../../UI/DailyLogEntry';
import MiniCalendar from '../../UI/MiniCalendar';

const TimelineDailyView = ({
  viewMode,
  onViewModeChange,
  selectedDate,
  onDayClick,
  dailyLog,
  entries = []
}) => {

  const renderDailyLogEntries = () => {
    if (!dailyLog?.hasEntries) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <TimelineIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No activity for {selectedDate.toLocaleDateString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select a different date or start logging activities
          </Typography>
        </Box>
      );
    }

    return (
      <Stack spacing={1} sx={{ maxHeight: 400, overflowY: 'auto' }}>
        <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            {selectedDate.toDateString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {dailyLog.summary?.totalEntries || 0} activities logged
            {dailyLog.summary?.mood && ` • Overall mood: ${dailyLog.summary.mood}`}
          </Typography>
        </Box>

        {dailyLog.entriesByTimeGroup?.map((group) => (
          <Box key={group.period}>
            <Typography 
              variant="caption" 
              sx={{ 
                fontWeight: 600, 
                color: 'primary.main',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                mb: 1,
                display: 'block'
              }}
            >
              {group.period}
            </Typography>
            
            <Stack spacing={0.5} sx={{ ml: 1, mb: 2 }}>
              {group.entries.map((entry, index) => (
                <DailyLogEntry
                  key={`${entry.id || entry.type}-${index}`}
                  entry={entry}
                  showTimestamp
                  compact
                />
              ))}
            </Stack>

            {group !== dailyLog.entriesByTimeGroup[dailyLog.entriesByTimeGroup.length - 1] && (
              <Divider sx={{ my: 1 }} />
            )}
          </Box>
        ))}
      </Stack>
    );
  };

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Tabs
          value={viewMode}
          onChange={onViewModeChange}
          variant="fullWidth"
          sx={{ 
            '& .MuiTab-root': { 
              minHeight: 36, 
              fontSize: '0.75rem',
              py: 0.5
            }
          }}
        >
          <Tab
            value="recent"
            label="Recent Activity"
            icon={<ListViewIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            sx={{ gap: 0.5 }}
          />
          <Tab
            value="daily"
            label="Daily View"
            icon={<DayViewIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            sx={{ gap: 0.5 }}
          />
        </Tabs>
      </Box>

      {viewMode === 'daily' ? (
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 2, sm: 2, md: 3 }, 
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'flex-start' }
        }}>
          <Box sx={{ 
            flex: { xs: 'none', md: '0 0 280px' },
            order: { xs: 2, md: 1 }
          }}>
            <Paper elevation={0} sx={{ p: 1, border: '1px solid', borderColor: 'divider' }}>
              <MiniCalendar
                entries={entries}
                onDayClick={onDayClick}
                selectedDate={selectedDate}
                showActivityIndicators
                compact
              />
            </Paper>
          </Box>

          <Box sx={{ 
            flex: 1,
            order: { xs: 1, md: 2 },
            minHeight: { xs: 200, md: 300 }
          }}>
            {renderDailyLogEntries()}
          </Box>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Recent entries view
        </Typography>
      )}
    </>
  );
};

export default TimelineDailyView;
