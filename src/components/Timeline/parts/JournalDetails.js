import React from 'react';
import { Box, Typography } from '@mui/material';

const JournalDetails = ({ entry }) => {
  return (
    <Box>
      {entry.text && (
        <Typography variant="body2" sx={{ color: 'text.primary', mb: 0.5 }}>
          {entry.text.length > 150 ? `${entry.text.substring(0, 150)}...` : entry.text}
        </Typography>
      )}
      {entry.tags && entry.tags.length > 0 && (
        <Box sx={{ mt: 0.5 }}>
          {entry.tags.map((tag) => (
            <Typography
              key={tag}
              component="span"
              variant="caption"
              sx={{ mr: 0.5, px: 0.5, py: 0.25, bgcolor: 'grey.100', borderRadius: 0.5, fontSize: '0.7rem' }}
            >
              #{tag}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default React.memo(JournalDetails);
