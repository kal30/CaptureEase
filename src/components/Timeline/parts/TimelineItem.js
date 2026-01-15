import React from 'react';
import { Box } from '@mui/material';

const TimelineItem = ({ color, icon, children, ariaLabel, compact = false }) => (
  <Box
    sx={{
      position: 'relative',
      pb: 0.5,
      '&:hover .timeline-entry-actions': {
        opacity: 1,
        pointerEvents: 'auto'
      },
      '&:focus-within .timeline-entry-actions': {
        opacity: 1,
        pointerEvents: 'auto'
      }
    }}
    role="listitem"
    aria-label={ariaLabel}
  >
    <Box
      sx={{
        position: 'absolute',
        left: compact ? 9 : 12,
        top: compact ? 2 : 0,
        width: compact ? 14 : 18,
        height: compact ? 14 : 18,
        borderRadius: '50%',
        bgcolor: color,
        border: '3px solid',
        borderColor: 'background.paper',
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: compact ? '0.6rem' : '0.7rem',
      }}
    >
      {icon || '●'}
    </Box>

    <Box
      sx={{
        ml: compact ? 5 : 6,
        px: compact ? 0.75 : 1.25,
        pt: compact ? 0.5 : 1,
        pb: compact ? 0.5 : 0.75,
        bgcolor: 'background.paper',
        borderRadius: 0,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      {children}
    </Box>
  </Box>
);

export default React.memo(TimelineItem);
