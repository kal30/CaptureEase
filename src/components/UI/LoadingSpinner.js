import React from 'react';
import { Box, CircularProgress, Typography, Fade } from '@mui/material';

/**
 * LoadingSpinner - Reusable loading component with optional message
 */
const LoadingSpinner = ({ 
  message = "Loading...", 
  size = 40, 
  sx = {} 
}) => {
  return (
    <Fade in={true}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
          gap: 2,
          ...sx
        }}
      >
        <CircularProgress
          size={size}
          thickness={4}
          sx={{
            color: 'primary.main',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
          }}
        />
        {message && (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              textAlign: 'center',
              maxWidth: 300,
            }}
          >
            {message}
          </Typography>
        )}
      </Box>
    </Fade>
  );
};

export default LoadingSpinner;