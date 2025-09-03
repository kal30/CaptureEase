import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { getIncidentDisplayInfo } from '../../constants/uiDisplayConstants';

/**
 * TimeGroupHeader - Header for time period groups (Morning, Afternoon, Evening)
 * Shows group name, entry count, and optional summary
 * 
 * @param {Object} props
 * @param {string} props.label - Display label with emoji (e.g., "🌅 Morning")
 * @param {string} props.period - Time period identifier ('morning', 'afternoon', 'evening')
 * @param {number} props.entryCount - Number of entries in this time period
 * @param {Object} props.summary - Optional summary data for this time period
 */
const TimeGroupHeader = ({ 
  label, 
  period, 
  entryCount = 0, 
  summary 
}) => {
  // Get centralized display info
  const incidentDisplay = getIncidentDisplayInfo();
  
  // Get time period color
  const getTimeColor = (period) => {
    switch (period) {
      case 'morning': return 'info.main';
      case 'afternoon': return 'warning.main';
      case 'evening': return 'secondary.main';
      default: return 'text.secondary';
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1, 
      mb: 1,
      pb: 0.5,
      borderBottom: '2px solid',
      borderBottomColor: getTimeColor(period),
      position: 'sticky',
      top: 0,
      bgcolor: 'background.paper',
      zIndex: 1
    }}>
      <Typography 
        variant="subtitle2" 
        sx={{ 
          fontWeight: 700,
          color: getTimeColor(period),
          fontSize: '0.875rem',
          textTransform: 'uppercase',
          letterSpacing: 0.5
        }}
      >
        {label}
      </Typography>
      
      <Chip
        label={`${entryCount} ${entryCount === 1 ? 'entry' : 'entries'}`}
        size="small"
        variant="outlined"
        sx={{
          height: 20,
          fontSize: '0.65rem',
          borderColor: getTimeColor(period),
          color: getTimeColor(period),
          '& .MuiChip-label': {
            px: 0.75
          }
        }}
      />

      {/* Optional summary indicators */}
      {summary && (
        <Box sx={{ display: 'flex', gap: 0.5, ml: 'auto' }}>
          {summary.hasIncidents && (
            <Chip
              label={incidentDisplay.pluralLabel}
              size="small"
              color="error"
              variant="filled"
              sx={{ height: 18, fontSize: '0.6rem' }}
            />
          )}
          {summary.hasJournalEntries && (
            <Chip
              label="Journal"
              size="small"
              color="info"
              variant="filled"
              sx={{ height: 18, fontSize: '0.6rem' }}
            />
          )}
          {summary.hasFollowUps && (
            <Chip
              label="Follow-ups"
              size="small"
              color="success"
              variant="filled"
              sx={{ height: 18, fontSize: '0.6rem' }}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export default TimeGroupHeader;