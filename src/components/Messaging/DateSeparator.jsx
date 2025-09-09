// DateSeparator Component
// Displays a labeled divider for date grouping in message threads

import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { getDateGroupLabel } from '../../utils/dateUtils';

const DateSeparator = ({ date }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      my: 2,
      gap: 2,
    }}
  >
    <Divider sx={{ flex: 1 }} />
    <Typography
      variant="caption"
      sx={{
        color: 'text.secondary',
        backgroundColor: 'background.paper',
        px: 2,
        py: 0.5,
        borderRadius: 1,
        fontWeight: 500,
      }}
    >
      {getDateGroupLabel(date)}
    </Typography>
    <Divider sx={{ flex: 1 }} />
  </Box>
);

export default DateSeparator;

