import React from 'react';
import { Box } from '@mui/material';

const TimelineItem = ({ color, icon, onClick, children, ariaLabel }) => (
  <Box sx={{ position: 'relative', pb: 3 }} role="listitem" aria-label={ariaLabel}>
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
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': { bgcolor: 'action.hover', transform: 'translateY(-1px)', boxShadow: 1 },
      }}
      onClick={onClick}
    >
      {children}
    </Box>
  </Box>
);

export default React.memo(TimelineItem);
