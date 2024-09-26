import React from 'react';
import { TextField } from '@mui/material';

const MessageTextInput = ({ text, setText, handleKeyDown }) => {
  return (
    <TextField
      placeholder="What's happening?"
      value={text}
      onChange={(e) => setText(e.target.value)}
      multiline
      fullWidth
      onKeyDown={handleKeyDown}  // Detect Enter key press
      sx={{
        backgroundColor: '#fff',  // White background inside the input
        borderRadius: 2,
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
        },
      }}
    />
  );
};

export default MessageTextInput;