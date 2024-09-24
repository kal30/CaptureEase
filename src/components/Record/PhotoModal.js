import React from 'react';
import { Dialog, DialogActions, DialogContent, Box, TextField, IconButton, Paper } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';

const PhotoModal = ({ open, handleClose, mediaPreview, text, setText, handleSend }) => {
  return (
    <Dialog open={open} onClose={handleClose} fullScreen>
      {/* Close button in the top right corner */}
      <DialogActions sx={{ position: 'absolute', top: 10, right: 10 }}>
        <IconButton onClick={handleClose} sx={{ color: '#fff', backgroundColor: '#f50057', fontSize: '2rem', p: 1 }}>
          <CloseIcon fontSize="large" />
        </IconButton>
      </DialogActions>

      {/* Preview the selected image */}
      <DialogContent>
        {mediaPreview && (
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            <img
              src={mediaPreview}
              alt="Selected media preview"
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '8px',
              }}
            />
          </Box>
        )}

        {/* Message input with send icon */}
        <Paper
          elevation={2}
          sx={{
            display: 'flex',
            alignItems: 'center',
            padding: 1,
            marginTop: 2,
            borderRadius: 2,
            backgroundColor: '#f5f5f5',
            position: 'fixed', // Fixed at the bottom
            bottom: 0,
            left: 0,
            right: 0,
            padding: 2, // Adjust padding for a clean look
          }}
        >
          {/* Message input */}
          <TextField
            placeholder="Type a message"
            variant="outlined"
            fullWidth
            value={text}
            onChange={(e) => setText(e.target.value)}
            sx={{
              marginLeft: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                height: '40px',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
            }}
          />

          {/* Send button */}
          <IconButton
            color="primary"
            onClick={handleSend}
            sx={{ marginLeft: 1 }}
          >
            <SendIcon />
          </IconButton>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoModal;