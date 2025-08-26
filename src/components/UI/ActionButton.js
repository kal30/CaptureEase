import React from 'react';
import { Button } from '@mui/material';
import { alpha } from '@mui/material/styles';

/**
 * Reusable Action Button Component
 * Standardized button styling across the app
 */
const ActionButton = ({
  children,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  onClick,
  disabled = false,
  startIcon,
  endIcon,
  fullWidth = false,
  customColor,
  ...props
}) => {
  
  // Custom styling based on props
  const getButtonStyles = () => {
    const baseStyles = {
      textTransform: 'none',
      fontWeight: 600,
      borderRadius: 2,
      transition: 'all 0.2s ease',
    };

    // If custom color is provided
    if (customColor) {
      return {
        ...baseStyles,
        bgcolor: customColor,
        color: 'white',
        '&:hover': {
          bgcolor: alpha(customColor, 0.8),
          transform: 'translateY(-1px)',
        },
        '&:disabled': {
          bgcolor: 'grey.300',
          color: 'grey.500'
        }
      };
    }

    // Default Material-UI styling with enhancements
    return {
      ...baseStyles,
      '&:hover': {
        transform: 'translateY(-1px)',
      }
    };
  };

  return (
    <Button
      variant={variant}
      color={color}
      size={size}
      onClick={onClick}
      disabled={disabled}
      startIcon={startIcon}
      endIcon={endIcon}
      fullWidth={fullWidth}
      sx={getButtonStyles()}
      {...props}
    >
      {children}
    </Button>
  );
};

export default ActionButton;