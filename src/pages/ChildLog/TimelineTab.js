import React from 'react';
import { Typography, Box } from '@mui/material';

const TimelineTab = ({ childId }) => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Timeline
      </Typography>
      <Typography>
        This is where the chronological timeline of all events will be displayed.
      </Typography>
    </Box>
  );
};

export default TimelineTab;
