import React from 'react';
import { Box, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

/**
 * Reusable Status Indicator Circle Component
 * Used for quick entry buttons (mood, sleep, energy) and other status indicators
 */
const StatusIndicator = ({ 
  emoji, 
  label, 
  isCompleted = false,
  onClick,
  color,
  size = 36,
  description = '',
  disabled = false,
  showLabel = false
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
      <Box
        onClick={disabled ? undefined : onClick}
        sx={{
          width: size,
          height: size,
          borderRadius: "50%",
          border: `2px solid ${color || theme.palette.dailyCare.primary}`,
          bgcolor: isCompleted ? (color ? alpha(color, 0.1) : theme.palette.dailyCare.background) : "background.paper",
          cursor: disabled ? 'default' : 'pointer',
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
          opacity: disabled ? 0.6 : 1,
          '&:hover': disabled ? {} : {
            borderColor: color || theme.palette.dailyCare.primary,
            bgcolor: color ? alpha(color, 0.1) : theme.palette.dailyCare.background,
            transform: "scale(1.1)",
          },
        }}
        title={description || `${label} ${isCompleted ? '(completed)' : ''}`}
      >
        <Typography sx={{ fontSize: size < 30 ? "1rem" : "1.2rem" }}>
          {isCompleted ? "✓" : emoji}
        </Typography>
      </Box>
      
      {showLabel && (
        <Typography 
          variant="caption" 
          sx={{ 
            fontSize: '0.7rem', 
            color: 'text.secondary',
            textAlign: 'center'
          }}
        >
          {label}
        </Typography>
      )}
    </Box>
  );
};

export default StatusIndicator;