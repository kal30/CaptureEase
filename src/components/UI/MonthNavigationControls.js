import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

/**
 * MonthNavigationControls - Clean navigation component for month switching
 * KISS principle: Single responsibility - just navigation UI
 * 
 * @param {Object} props
 * @param {Date} props.currentMonth - Currently displayed month
 * @param {function} props.onPreviousMonth - Handler for previous month
 * @param {function} props.onNextMonth - Handler for next month  
 * @param {boolean} props.showControls - Whether to show arrow controls (desktop)
 */
const MonthNavigationControls = ({
  currentMonth,
  onPreviousMonth,
  onNextMonth,
  showControls = true
}) => {
  
  const monthName = currentMonth.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  // Don't render anything if controls are hidden (mobile)
  if (!showControls) {
    return (
      <Typography 
        variant="h6" 
        sx={{ 
          textAlign: 'center',
          mb: 1,
          fontSize: { xs: '1.1rem', md: '1rem' },
          fontWeight: 600,
          color: 'text.primary'
        }}
      >
        {monthName}
      </Typography>
    );
  }

  // Desktop: Show arrows with month name
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 1
      }}
    >
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onPreviousMonth();
        }}
        sx={{ 
          width: 32, 
          height: 32,
          '&:hover': {
            bgcolor: 'action.hover'
          }
        }}
        aria-label="Previous month"
      >
        <ChevronLeft fontSize="small" />
      </IconButton>

      <Typography 
        variant="h6" 
        sx={{ 
          fontSize: { xs: '1.1rem', md: '1rem' },
          fontWeight: 600,
          color: 'text.primary',
          flex: 1,
          textAlign: 'center'
        }}
      >
        {monthName}
      </Typography>

      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onNextMonth();
        }}
        sx={{ 
          width: 32, 
          height: 32,
          '&:hover': {
            bgcolor: 'action.hover'
          }
        }}
        aria-label="Next month"
      >
        <ChevronRight fontSize="small" />
      </IconButton>
    </Box>
  );
};

export default MonthNavigationControls;