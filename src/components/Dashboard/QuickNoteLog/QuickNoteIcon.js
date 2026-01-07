import React from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

const QuickNoteIcon = ({
  onClick,
  size = 40,
  fontSize = '1.1rem',
  showLabel = false,
  label = 'Quick log'
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.4 }}>
      <Tooltip title="Quick Note: Log what happened" arrow>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          sx={{
            width: size,
            height: size,
            backgroundColor: theme.palette.success.main,
            color: theme.palette.common.white,
            fontSize,
            border: `2px solid ${alpha(theme.palette.success.main, 0.25)}`,
            boxShadow: `0 0 0 3px ${alpha(theme.palette.success.main, 0.12)}`,
            '&:hover': {
              backgroundColor: theme.palette.success.dark,
              transform: 'scale(1.05)',
              boxShadow: `0 0 0 4px ${alpha(theme.palette.success.main, 0.2)}`
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          📝
        </IconButton>
      </Tooltip>
      {showLabel && (
        <Typography
          sx={{
            fontSize: '0.7rem',
            fontWeight: 600,
            color: theme.palette.text.secondary
          }}
        >
          {label}
        </Typography>
      )}
    </Box>
  );
};

export default QuickNoteIcon;
