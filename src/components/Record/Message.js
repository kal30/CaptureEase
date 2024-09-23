import React from 'react';
import { Box, Typography, CardContent } from '@mui/material';
import dayjs from 'dayjs';

const Message = ({ message }) => {
  const formattedTime = message.timestamp ? dayjs(message.timestamp.toDate()).format('h:mm A') : '';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: message.userId === 'currentUserId' ? 'flex-end' : 'flex-start',
        mb: 1.5,
        maxWidth: '100%',
      }}
    >
      <Box
        sx={{
          maxWidth: '70%',  // Ensure enough space for both text and media
          backgroundColor: '#f0f0f0',
          padding: 2,
          borderRadius: 4,
          textAlign: 'left',
          boxShadow: 1,
          wordWrap: 'break-word',
        }}
      >
        <CardContent sx={{ padding: 0 }}>
          {/* Display the message text */}
          {message.text && (
            <Typography variant="body1" color="textPrimary">
              {message.text}
            </Typography>
          )}

          {/* Display the media (image or video) if available */}
          {message.mediaURL && (
            <Box sx={{ mt: 1 }}>
              <img
                src={message.mediaURL}
                alt="Uploaded media"
                style={{ maxWidth: '100%', borderRadius: 4 }}
              />
            </Box>
          )}

          {/* Display the message time */}
          <Typography variant="caption" color="textSecondary" align="right" sx={{ display: 'block', mt: 1 }}>
            {formattedTime}
          </Typography>
        </CardContent>
      </Box>
    </Box>
  );
};

export default Message;