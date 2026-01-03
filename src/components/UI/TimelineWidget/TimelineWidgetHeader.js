import React from 'react';
import {
  Box,
  Button,
  Chip,
  Typography
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { TimelineFilters } from '../../Timeline';

const TimelineWidgetHeader = ({
  loggedToday,
  lastEntry,
  daysLoggedThisWeek,
  expanded,
  showUnifiedLog,
  selectedDate,
  filters,
  onFiltersChange,
  onDateChange,
  onToggleExpanded,
  onAddLog,
  formatTimeAgo
}) => {
  const theme = useTheme();
  const statusColor = loggedToday ? theme.palette.success.main : theme.palette.warning.main;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: { xs: 1.5, md: 2 },
        cursor: 'pointer'
      }}
      onClick={onToggleExpanded}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 0.75, sm: 1 },
            p: { xs: 0.75, sm: 1 },
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: 2,
              flexWrap: 'wrap'
            }}
          >
            <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: 'text.primary', fontSize: { xs: '0.95rem', md: '1rem' } }}
                    >
                      Daily log
                    </Typography>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.6,
                        px: 1,
                        py: 0.25,
                        borderRadius: 999,
                        border: '1px solid',
                        borderColor: alpha(statusColor, 0.3),
                        bgcolor: alpha(statusColor, 0.12),
                        color: statusColor,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        letterSpacing: '0.01em'
                      }}
                    >
                      <Box
                        sx={{
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          bgcolor: statusColor
                        }}
                      />
                      {loggedToday ? 'Logged today' : 'Not logged today'}
                </Box>
              </Box>
            </Box>
            <Button
              size="small"
              variant="contained"
              onClick={(event) => {
                event.stopPropagation();
                onAddLog();
              }}
              sx={{
                textTransform: 'none',
                alignSelf: { xs: 'stretch', sm: 'center' },
                px: 2
              }}
            >
              {loggedToday ? 'Add another log' : 'Add today\'s log'}
            </Button>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: 1.5,
              flexWrap: 'wrap'
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {lastEntry ? `Last log ${formatTimeAgo(lastEntry.timestamp)}` : 'No logs yet'}
            </Typography>
            <Chip
              label={`${daysLoggedThisWeek} day${daysLoggedThisWeek === 1 ? '' : 's'} logged this week`}
              size="small"
              variant="outlined"
            />
          </Box>

          {showUnifiedLog && expanded && (
            <Box
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <TimelineFilters
                filters={filters}
                onFiltersChange={onFiltersChange}
                selectedDate={selectedDate}
                onDateChange={onDateChange}
                summary={{}}
                compact={true}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default TimelineWidgetHeader;
