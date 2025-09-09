// MessageSkeleton Component
// Loading placeholder for messages in the thread

import React from 'react';
import { Box, CircularProgress, Paper, Typography } from '@mui/material';

const MessageSkeleton = ({ isOwnMessage = false }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: isOwnMessage ? 'row-reverse' : 'row',
      alignItems: 'flex-end',
      gap: 1,
      mb: 2,
    }}
  >
    {!isOwnMessage && <CircularProgress size={32} thickness={2} />}
    <Box
      sx={{
        maxWidth: '70%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
      }}
    >
      <Paper
        sx={{
          px: 2,
          py: 1,
          borderRadius: 2,
          backgroundColor: isOwnMessage ? 'primary.main' : 'grey.100',
          opacity: 0.6,
          animation: 'pulse 1.5s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 0.6 },
            '50%': { opacity: 0.8 },
          },
        }}
      >
        <Typography variant="body2">Loading message...</Typography>
      </Paper>
    </Box>
  </Box>
);

export default MessageSkeleton;

