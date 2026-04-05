import React from 'react';
import { Box, Typography } from '@mui/material';

const JournalDetails = ({ entry }) => {
  const hasContent = entry.text || (entry.tags && entry.tags.length > 0);
  const notesText = entry.notes || entry.bathroomDetails?.notes || '';
  
  if (!hasContent && !notesText) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        position: 'relative',
        zIndex: 1,
        backgroundColor: '#FFFFFF',
        isolation: 'isolate',
      }}
    >
      {entry.text ? (
        <Typography
          variant="body2"
          sx={{
            color: 'text.primary',
            mb: 0,
            lineHeight: { xs: 1.4, md: 1.45 },
            fontSize: { xs: '1rem', md: '0.95rem' },
          }}
        >
          {entry.text.length > 150 ? `${entry.text.substring(0, 150)}...` : entry.text}
        </Typography>
      ) : null}

      {notesText ? (
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            lineHeight: { xs: 1.4, md: 1.45 },
            fontSize: { xs: '0.95rem', md: '0.9rem' },
          }}
        >
          {notesText.length > 180 ? `${notesText.substring(0, 180)}...` : notesText}
        </Typography>
      ) : null}
    </Box>
  );
};

export default React.memo(JournalDetails);
