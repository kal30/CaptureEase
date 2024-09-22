import React from 'react';
import { Box, TextField, IconButton, Paper } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import { useTheme } from '@mui/material/styles';

const MessageInput = ({ text, setText, handleFileChange, handleSubmit, uploading, mediaPreview, mediaFile }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={3}
      sx={{
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(1),
        marginTop: theme.spacing(1),
        borderRadius: theme.shape.borderRadius,
      }}
    >
      <IconButton component="label" sx={{ color: theme.palette.secondary.main }}>
        <AttachFileIcon />
        <input type="file" hidden accept="image/*, video/*" onChange={handleFileChange} />
      </IconButton>

      <TextField
        placeholder="Type a message"
        variant="outlined"
        fullWidth
        value={text}
        onChange={(e) => setText(e.target.value)}
        sx={{
          marginLeft: theme.spacing(1),
          marginRight: theme.spacing(1),
          '& .MuiOutlinedInput-root': {
            borderRadius: theme.shape.borderRadius,
            height: '40px',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none',
          },
        }}
      />

      <IconButton
        type="submit"
        color="primary"
        onClick={handleSubmit}
        disabled={uploading}
        sx={{ color: theme.palette.primary.main }}
      >
        <SendIcon />
      </IconButton>

      {/* Show a small preview of the selected file */}
      {mediaPreview && (
        <Box sx={{ ml: 2 }}>
          {mediaFile.type.startsWith('video') ? (
            <video width="50" height="50" controls>
              <source src={mediaPreview} />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img src={mediaPreview} alt="preview" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
          )}
        </Box>
      )}
    </Paper>
  );
};

export default MessageInput;