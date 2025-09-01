import React from 'react';
import { Box, Chip, Typography } from '@mui/material';

/**
 * TimelineMetrics - Displays activity metrics and streaks
 * Extracted from TimelineWidget for better organization
 * 
 * @param {Object} props
 * @param {Object} props.timeline - Timeline data with metrics
 * @param {Object} props.metrics - Activity metrics (todayCount, weekCount, totalCount)
 */
const TimelineMetrics = ({ timeline = {}, metrics = {} }) => {
  const mostActiveType = timeline.getMostActiveType ? timeline.getMostActiveType() : null;
  const streak = timeline.getActivityStreak ? timeline.getActivityStreak() : 0;
  const {
    todayCount = 0,
    weekCount = 0,
    totalCount = 0
  } = metrics;

  return (
    <Box className="timeline-widget__metrics" sx={{ mb: 2 }}>
      {/* Activity Counts - Only show chips with counts > 0 */}
      <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
        {todayCount > 0 && (
          <Chip
            label={`${todayCount} today`}
            size="small"
            variant="outlined"
            color="primary"
            sx={{ fontSize: '0.75rem' }}
          />
        )}
        {weekCount > 0 && (
          <Chip
            label={`${weekCount} this week`}
            size="small"
            variant="outlined"
            color="secondary"
            sx={{ fontSize: '0.75rem' }}
          />
        )}
        {totalCount > 0 && (
          <Chip
            label={`${totalCount} total`}
            size="small"
            variant="outlined"
            color="info"
            sx={{ fontSize: '0.75rem' }}
          />
        )}
      </Box>

      {/* Activity Insights */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {mostActiveType && (
          <Chip
            label={`Most: ${mostActiveType}`}
            size="small"
            color="success"
            variant="filled"
            sx={{ fontSize: '0.7rem', height: 20 }}
          />
        )}
        {streak > 1 && (
          <Chip
            label={`${streak} day streak!`}
            size="small"
            color="warning"
            variant="filled"
            sx={{ fontSize: '0.7rem', height: 20 }}
          />
        )}
      </Box>

      {/* Summary Text */}
      {todayCount > 0 && (
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}
        >
          Great job tracking activities today!
        </Typography>
      )}
    </Box>
  );
};

export default TimelineMetrics;