import React from 'react';
import { Box } from '@mui/material';

const TimelineItem = ({ color, icon, children, ariaLabel, isFirst = false, isLast = false }) => (
  <Box sx={{ position: 'relative', pb: isLast ? 0 : 2 }} role="listitem" aria-label={ariaLabel}>
    {!isFirst && (
      <Box
        sx={{
          position: 'absolute',
          left: 19,
          top: 0,
          height: 12,
          width: 4,
          borderRadius: 999,
          bgcolor: color,
          zIndex: 1,
        }}
      />
    )}

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

    {!isLast && (
      <Box
        sx={{
          position: 'absolute',
          left: 19,
          top: 18,
          bottom: 0,
          width: 4,
          borderRadius: 999,
          bgcolor: color,
          zIndex: 1,
        }}
      />
    )}

    <Box
      sx={{
        ml: 5.5,
        px: 1.5,
        py: 1.25,
        bgcolor: '#ffffff',
        borderRadius: 2.5,
        border: '1px solid rgba(148, 163, 184, 0.18)',
        boxShadow: '0 6px 16px rgba(15, 23, 42, 0.045)',
      }}
    >
      {children}
    </Box>
  </Box>
);

export default React.memo(TimelineItem);
