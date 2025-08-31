import React from 'react';
import { Box, Typography } from '@mui/material';
import dayjs from 'dayjs';

const MessageBubble = ({ message }) => {
  const formattedTime = message.timestamp ? dayjs(message.timestamp.toDate()).format('h:mm A') : '';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        mb: 1.5,
        padding: 1.0,
        borderRadius: '10px',  // Rounded corners for a smooth bubble effect
        maxWidth: '80%',
        alignSelf: 'flex-start',  // Align message to the left
        boxShadow: 1,  // Add slight shadow for separation
        fontSize: '0.95rem',
        paddingLeft: 3,  
        paddingRight: 12,
        wordWrap: 'break-word',
        boxSizing: 'border-box',  // Ensures padding is included in the width calculation
      }}
    >
      {/* Display text, left-aligned */}
      {message.text && (
        <Typography
          variant="body1"
          sx={{
            wordWrap: 'break-word',
            mb: message.mediaURL ? 1 : 0,
            textAlign: 'left',
              // Ensure text is left-aligned
          }}
        >
          {message.text}
        </Typography>
      )}

      {/* Display image if there is media */}
      {message.mediaURL && (
        <Box sx={{ mb: 1 }}>
          <img
            src={message.mediaURL}
            alt="uploaded media"
            style={{
              width: '100%',
              borderRadius: '8px',  // Slightly rounded corners for images
              objectFit: 'cover',
              maxHeight: '500px',
            }}
          />
        </Box>
      )}

      {/* Display time right-aligned */}
    <Box
        sx={{ display: 'flex',             
             mt: 1 }}  
        >
        <Typography
            variant="caption"
            color="textSecondary"
            sx={{ fontSize: '0.95rem' }}
        >
            {formattedTime}
        </Typography>
    </Box>
    </Box>
  );
};


export default MessageBubble;