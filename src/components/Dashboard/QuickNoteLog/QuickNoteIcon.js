import React from 'react';
import { IconButton, Tooltip } from '@mui/material';

const QuickNoteIcon = ({ onClick, size = 40, fontSize = '1.1rem' }) => (
  <Tooltip title="Quick Note: Log what happened" arrow>
    <IconButton
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      sx={{
        width: size,
        height: size,
        backgroundColor: '#10B981', // Emerald green for notes
        color: 'white',
        fontSize,
        border: '2px solid #D1FAE5',
        '&:hover': {
          backgroundColor: '#059669',
          transform: 'scale(1.05)'
        },
        transition: 'all 0.2s ease-in-out'
      }}
    >
      📝
    </IconButton>
  </Tooltip>
);

export default QuickNoteIcon;
