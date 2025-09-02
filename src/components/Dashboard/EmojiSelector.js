import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { EMOJI_OPTIONS } from '../../constants/categoryConstants';

const EmojiSelector = ({ selectedEmoji, onEmojiSelect }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
        Icon
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {EMOJI_OPTIONS.map(emoji => (
          <Button
            key={emoji}
            variant={selectedEmoji === emoji ? 'contained' : 'outlined'}
            onClick={() => onEmojiSelect(emoji)}
            sx={{ 
              minWidth: 48,
              height: 48,
              fontSize: '1.25rem',
              p: 0
            }}
          >
            {emoji}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

export default EmojiSelector;