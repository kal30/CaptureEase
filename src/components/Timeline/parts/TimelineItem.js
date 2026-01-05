import React from 'react';
import { Box } from '@mui/material';

const TimelineItem = ({ color, icon, children, ariaLabel }) => (
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
        left: 12,
        top: 0,
        width: 18,
        height: 18,
        borderRadius: '50%',
        bgcolor: color,
        border: '3px solid',
        borderColor: 'background.paper',
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.7rem',
      }}
    >
      {icon || '●'}
    </Box>

    <Box
      sx={{
        ml: 6,
        px: 1.25,
        pt: 1,
        pb: 0.75,
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
