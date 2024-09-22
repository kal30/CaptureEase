import React from 'react';
import { Box, Typography, CardContent, useTheme } from '@mui/material';
import dayjs from 'dayjs';

const Message = ({ message }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',  // Align message bubble to the right
        mb: 1.5,
        maxWidth: '100%',
      }}
    >
      <Box
        sx={{
          maxWidth: '85%',  // Adjust to control the width of the message bubble
          backgroundColor: theme.palette.background.paper,
          padding: theme.spacing(1.5),
          borderRadius: theme.shape.borderRadius,
          boxShadow: theme.shadows[2],
          wordWrap: 'break-word',  // Ensure text wraps when needed
          textAlign: 'left',
          position: 'relative',  // Allows us to position the time relative to the bubble
        }}
      >
        <CardContent sx={{ padding: 0 }}>
          {/* Display media if available */}
          {message.mediaURL && (
            <Box sx={{ mb: theme.spacing(1) }}>
              {message.mediaURL.includes('video') ? (
                <video controls width="100%">
                  <source src={message.mediaURL} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={message.mediaURL}
                  alt="Uploaded media"
                  style={{ width: '100%', borderRadius: theme.shape.borderRadius }}
                />
              )}
            </Box>
          )}

          {/* Display message text */}
          {message.text && (
            <Typography variant="body1" color={theme.palette.text.primary}>
              {message.text}
            </Typography>
          )}

          {/* Display the message time aligned to the right */}
          <Typography
            variant="caption"
            color={theme.palette.text.secondary}
            sx={{
              position: 'absolute',
              bottom: theme.spacing(0.5),
              right: theme.spacing(1),  // Align time to the right
              marginBottom: 0,  // Remove any extra margin below the time
            }}
          >
            {dayjs(message.timestamp.toDate()).format('h:mm A')}
          </Typography>
        </CardContent>
      </Box>
    </Box>
  );
};

export default Message;