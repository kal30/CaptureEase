import React from 'react';
import { Box } from '@mui/material';

const TimelineItem = ({
  color,
  icon,
  children,
  ariaLabel,
  isFirst = false,
  isLast = false,
  isNested = false,
  cardBackground = '#ffffff',
  cardBorderColor = 'rgba(148, 163, 184, 0.18)',
}) => (
  <Box sx={{ position: 'relative', pb: isLast ? 0 : { xs: 1.25, md: 2 } }} role="listitem" aria-label={ariaLabel}>
    {!isFirst && (
      <Box
        sx={{
          position: 'absolute',
          left: { xs: 18, md: 21 },
          top: 0,
          height: { xs: 8, md: 12 },
          width: { xs: 3, md: 4 },
          borderRadius: 999,
          bgcolor: color,
          zIndex: 1,
        }}
      />
    )}

      <Box
        sx={{
          position: 'absolute',
          left: { xs: 11, md: 13 },
          top: { xs: 4, md: 6 },
          width: { xs: 16, md: 20 },
          height: { xs: 16, md: 20 },
          borderRadius: '50%',
          bgcolor: color,
          border: { xs: '2px solid', md: '3px solid' },
          borderColor: 'background.paper',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: { xs: '0.58rem', md: '0.7rem' },
        }}
      >
        {icon || '●'}
    </Box>

    {!isLast && (
      <Box
        sx={{
          position: 'absolute',
          left: { xs: 18, md: 21 },
          top: { xs: 20, md: 26 },
          bottom: 0,
          width: { xs: 3, md: 4 },
          borderRadius: 999,
          bgcolor: color,
          zIndex: 1,
        }}
      />
    )}

    <Box
      sx={{
        ml: { xs: isNested ? 5.05 : 4.7, md: isNested ? 6.1 : 5.7 },
        px: { xs: 1.1, md: 1.5 },
        py: { xs: 0.9, md: 1.25 },
        bgcolor: cardBackground,
        borderRadius: 1,
        border: `1px solid ${cardBorderColor}`,
        boxShadow: { xs: '0 3px 10px rgba(15, 23, 42, 0.035)', md: '0 6px 16px rgba(15, 23, 42, 0.045)' },
        position: 'relative',
      }}
    >
      {children}
    </Box>
  </Box>
);

export default React.memo(TimelineItem);
