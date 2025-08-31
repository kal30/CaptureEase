import React from 'react';
import { Box, Typography } from '@mui/material';

const DailyNoteDetails = ({ entry }) => {
  return (
    <Box>
      {entry.title && (
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
          {entry.title}
        </Typography>
      )}
      {entry.content && (
        <Typography variant="body2" sx={{ color: 'text.primary', mb: 0.5 }}>
          {entry.content.length > 150 ? `${entry.content.substring(0, 150)}...` : entry.content}
        </Typography>
      )}
      {entry.mood && (
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
          Mood: {entry.mood}
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

export default React.memo(DailyNoteDetails);
