import React from 'react';
import { Button } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

/**
 * GradientButton - Reusable button component with gradient backgrounds and consistent styling
 * Handles all button variations: primary, success, warning, gradient, outlined, etc.
 * 
 * Usage:
 * <GradientButton variant="gradient">Primary Gradient</GradientButton>
 * <GradientButton variant="outlined" color="success">Success Outlined</GradientButton>
 * <GradientButton variant="dailyCare" elevated>Daily Care Action</GradientButton>
 * <GradientButton variant="gradient" size="hero" elevated>Landing Page Hero</GradientButton>
 */
const GradientButton = ({
  children,
  variant = 'contained', // 'contained', 'outlined', 'text', 'gradient', 'dailyCare', 'success-gradient'
  color = 'primary',
  size = 'medium', // 'small', 'medium', 'large', 'hero'
  elevated = false,
  fullWidth = false,
  disabled = false,
  startIcon,
  endIcon,
  onClick,
  type = 'button',
  sx = {},
  ...props
}) => {
  const theme = useTheme();

  // Size configurations
  const getSizeConfig = (sizeType) => {
    const sizeConfigs = {
      small: {
        py: 0.5,
        px: 1.5,
        fontSize: '0.875rem'
      },
      medium: {
        py: 1.5,
        px: 3,
        fontSize: '1rem'
      },
      large: {
        py: 1.5,
        px: 3,
        fontSize: '1.1rem'
      },
      hero: {
        py: { xs: 1.5, md: 2, lg: 2.5 },
        px: { xs: 4, md: 5, lg: 6 },
        fontSize: { xs: "1rem", md: "1.1rem", lg: "1.25rem" },
        // Use the global button font (Harmattan) for all buttons, including hero
        fontFamily: theme.typography.button.fontFamily
      }
    };
    return sizeConfigs[sizeType] || sizeConfigs.medium;
  };

  // Gradient configurations
  const getGradientConfig = (gradientType) => {
    const gradients = {
      primary: {
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        hoverBackground: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        color: 'white',
        shadowColor: theme.palette.primary.main
      },
      success: {
        background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
        hoverBackground: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
        color: 'white',
        shadowColor: theme.palette.success.main
      },
      dailyCare: {
        background: `linear-gradient(135deg, ${theme.palette.dailyCare.primary} 0%, ${theme.palette.dailyCare.dark} 100%)`,
        hoverBackground: `linear-gradient(135deg, ${theme.palette.dailyCare.dark} 0%, ${theme.palette.dailyCare.primary} 100%)`,
        color: 'white',
        shadowColor: theme.palette.dailyCare.primary
      },
      secondary: {
        background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.tertiary.dark} 100%)`,
        hoverBackground: `linear-gradient(135deg, ${theme.palette.tertiary.dark} 0%, ${theme.palette.secondary.main} 100%)`,
        color: 'white',
        shadowColor: theme.palette.secondary.main
      }
    };
    return gradients[color] || gradients.primary;
  };

  // Build button styles based on variant
  const getButtonStyles = () => {
    const sizeConfig = getSizeConfig(size);
    const baseStyles = {
      py: sizeConfig.py,
      px: sizeConfig.px,
      fontSize: sizeConfig.fontSize,
      fontWeight: 600,
      textTransform: 'none',
      borderRadius: '14px',
      transition: 'all 0.2s ease',
      width: fullWidth ? '100%' : 'auto',
      ...(sizeConfig.fontFamily && { fontFamily: sizeConfig.fontFamily })
    };

    switch (variant) {
      case 'gradient':
      case 'success-gradient':
      case 'dailyCare': {
        const gradientConfig = getGradientConfig(variant === 'gradient' ? color : variant.replace('-gradient', ''));
        return {
          ...baseStyles,
          background: gradientConfig.background,
          color: gradientConfig.color,
          border: 'none',
          boxShadow: elevated ? `0 4px 15px ${alpha(gradientConfig.shadowColor, 0.3)}` : 'none',
          '&:hover': {
            background: gradientConfig.hoverBackground,
            transform: elevated ? 'translateY(-2px)' : 'translateY(-1px)',
            boxShadow: `0 6px 25px ${alpha(gradientConfig.shadowColor, 0.4)}`
          },
          '&:active': {
            transform: 'translateY(0)'
          }
        };
      }

      case 'outlined': {
        const colorPalette = theme.palette[color] || theme.palette.primary;
        return {
          ...baseStyles,
          borderColor: colorPalette.main,
          color: colorPalette.main,
          backgroundColor: 'transparent',
          borderWidth: '2px',
          boxShadow: elevated ? `0 2px 8px ${alpha(colorPalette.main, 0.2)}` : 'none',
          '&:hover': {
            borderColor: colorPalette.dark,
            backgroundColor: alpha(colorPalette.main, 0.05),
            transform: elevated ? 'translateY(-2px)' : 'translateY(-1px)',
            boxShadow: `0 6px 25px ${alpha(colorPalette.main, 0.4)}`
          }
        };
      }

      case 'text': {
        const colorPalette = theme.palette[color] || theme.palette.primary;
        return {
          ...baseStyles,
          color: colorPalette.main,
          backgroundColor: 'transparent',
          border: 'none',
          '&:hover': {
            backgroundColor: alpha(colorPalette.main, 0.1),
            transform: 'scale(1.02)'
          }
        };
      }

      case 'contained':
      default: {
        const colorPalette = theme.palette[color] || theme.palette.primary;
        return {
          ...baseStyles,
          backgroundColor: colorPalette.main,
          color: colorPalette.contrastText || 'white',
          border: 'none',
          boxShadow: elevated ? `0 4px 15px ${alpha(colorPalette.main, 0.3)}` : 'none',
          '&:hover': {
            backgroundColor: colorPalette.dark,
            transform: elevated ? 'translateY(-2px)' : 'translateY(-1px)',
            boxShadow: elevated ? `0 6px 25px ${alpha(colorPalette.main, 0.4)}` : `0 2px 8px ${alpha(colorPalette.main, 0.3)}`
          }
        };
      }
    }
  };

  return (
    <Button
      variant="contained" // Always use contained to override MUI defaults
      disabled={disabled}
      onClick={onClick}
      startIcon={startIcon}
      endIcon={endIcon}
      type={type}
      sx={{
        ...getButtonStyles(),
        ...sx
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default GradientButton;
