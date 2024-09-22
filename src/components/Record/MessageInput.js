import React from 'react';
import { Box, TextField, IconButton, Paper } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import { useTheme } from '@mui/material/styles';

const MessageInput = ({ text, setText, handleFileChange, handleSubmit, uploading }) => {
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
        backgroundColor: theme.palette.background.input,  // Use the input background from the theme
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
          paddingLeft: theme.spacing(1),
          height: '40px',  // Adjust height for a clean look
          backgroundColor: '#fff',  // White background for the text input area
          '& .MuiOutlinedInput-root': {
            borderRadius: theme.shape.borderRadius,  // Set border radius from theme
            height: '40px',  // Enforce height within the input itself
            paddingLeft: theme.spacing(1),  // Padding inside the input
          },
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none',  // Remove the border from the input box
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
    </Paper>
  );
};

export default MessageInput;