import React from 'react';
import { Modal, Box, IconButton, TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';  // X icon for closing
import SendIcon from '@mui/icons-material/Send';    // Send icon for sending

const PhotoModal = ({ open, handleClose, mediaPreview, text, setText, handleSend }) => {
  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',  // Dark background to focus on the photo
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 2,
        }}
      >
        {/* Top bar with close and send icons */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            right: 16,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          {/* Close (X) button */}
          <IconButton onClick={handleClose} sx={{ color: '#fff' }}>
            <CloseIcon />
          </IconButton>

          {/* Send button (Paper Plane Icon) */}
          <IconButton onClick={handleSend} sx={{ color: '#fff' }}>
            <SendIcon />
          </IconButton>
        </Box>

        {/* Display image preview */}
        {mediaPreview && (
          <Box
            sx={{
              maxWidth: '90vw',
              maxHeight: '70vh',
              marginBottom: 2,
              backgroundColor: '#fff',  // White background for better contrast
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <img
              src={mediaPreview}
              alt="Selected media"
              style={{ maxWidth: '100%', maxHeight: '100%' }}
            />
          </Box>
        )}

        {/* Input for typing a message */}
        <TextField
          placeholder="Add a message for this photo"
          fullWidth
          value={text}
          onChange={(e) => setText(e.target.value)}
          sx={{
            backgroundColor: '#fff',  // White background for input box
            borderRadius: 4,
            maxWidth: '90vw',
            marginBottom: 2,
          }}
        />
      </Box>
    </Modal>
  );
};

export default PhotoModal;