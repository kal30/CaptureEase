import React from 'react';
import { Box, Typography, CardContent, useTheme } from '@mui/material';
import dayjs from 'dayjs';

const Message = ({ message }) => {
  const theme = useTheme();  // Access theme

  // Ensure timestamp exists and is properly formatted
  const formattedTime = message.timestamp
    ? dayjs(message.timestamp.toDate ? message.timestamp.toDate() : message.timestamp).format('h:mm A')
    : '';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',  // Align message to the right (for sender). Use 'flex-start' for recipient.
        mb: 1.5,
        maxWidth: '100%',
      }}
    >
      <Box
        sx={{
          maxWidth: '70%',
          backgroundColor: theme.palette.background.paper || '#e0e0e0',  // Fallback to light gray if undefined
          padding: theme.spacing(1.5),
          borderRadius: theme.shape.borderRadius || '12px',
          textAlign: 'left',
          boxShadow: theme.shadows[2],
          wordWrap: 'break-word',
        }}
      >
        <CardContent sx={{ padding: 0 }}>
          {/* Display message text if available */}
          {message.text && (
            <Typography variant="body1" color={theme.palette.text.primary} sx={{ fontSize: theme.typography.fontSize }}>
              {message.text}
            </Typography>
          )}

          {/* If there's media, display it */}
          {message.mediaURL && (
            <Box sx={{ mt: theme.spacing(1) }}>
              {message.mediaURL.includes('video') ? (
                <video controls width="100%">
                  <source src={message.mediaURL} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={message.mediaURL}
                  alt="uploaded media"
                  style={{
                    width: '100%',
                    borderRadius: theme.shape.borderRadius || '12px',
                  }}
                />
              )}
            </Box>
          )}

          {/* Display the message time */}
          <Typography
            variant="caption"
            color={theme.palette.text.secondary}
            align="right"
            sx={{ display: 'block', mt: theme.spacing(1) }}
          >
            {formattedTime}
          </Typography>
        </CardContent>
      </Box>
    </Box>
  );
};

export default Message;