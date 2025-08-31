import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ENTRY_TYPES } from '../../../constants/timeline';

const TimelineLegend = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 3,
        mb: 2,
        p: 2,
        bgcolor: 'background.default',
        borderRadius: 1,
        flexWrap: 'wrap',
      }}
    >
      {Object.values(ENTRY_TYPES).map((item) => (
        <Box key={item.key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: theme.palette.timeline.entries[item.key] || theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.6rem',
            }}
          >
            {item.icon}
          </Box>
          <Typography variant="caption" sx={{ fontWeight: 500 }}>
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default React.memo(TimelineLegend);
