import React from 'react';
import { Box, Typography } from '@mui/material';
import dayjs from 'dayjs';

const MessageContent = ({
  isEditing,
  editedText,
  setEditedText,
  handleBlur,
  handleKeyDown,
  message
}) => {
  const formattedTime = message.timestamp instanceof Date
    ? dayjs(message.timestamp).format('h:mm A · MMM D, YYYY')
    : dayjs(message.timestamp.toDate()).format('h:mm A · MMM D, YYYY');

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Message text or input if editing */}
      {isEditing ? (
        <input
          type="text"
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          onBlur={handleBlur}  // Auto-save on blur
          onKeyDown={handleKeyDown}  // Auto-save on Enter key press
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      ) : (
        <Typography variant="body2" sx={{ mt: 1 }}>
          {message.text}
        </Typography>
      )}

      {/* Display image if there's media */}
      {message.mediaURL && (
        <Box sx={{ mt: 1 }}>
          <img
            src={message.mediaURL}
            alt="uploaded media"
            style={{
              width: '100%',
              borderRadius: '8px',
              objectFit: 'contain',
              maxHeight: '500px',
            }}
          />
        </Box>
      )}

      {/* Timestamp */}
      <Typography variant="caption" sx={{ color: 'gray', mt: 1, textAlign: 'right' }}>
        {formattedTime}
      </Typography>
    </Box>
  );
};

export default MessageContent;