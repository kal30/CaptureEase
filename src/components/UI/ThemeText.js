import React from 'react';
import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * ThemeText - Handles all typography patterns consistently  
 * Eliminates the need for sx typography props throughout the app
 * All fonts, weights, and responsive sizes defined in one place
 * 
 * Usage:
 * <ThemeText variant="hero-main">Main Title</ThemeText>
 * <ThemeText variant="hero-subtitle">Subtitle</ThemeText>
 * <ThemeText variant="section-header">Section Title</ThemeText>
 * <ThemeText variant="brand-accent">Brand Name</ThemeText>
 * <ThemeText variant="form-helper">Helper text</ThemeText>
 */
const ThemeText = ({ 
  variant = 'body1',
  children,
  component,
  color,
  sx = {},
  ...props 
}) => {
  const theme = useTheme();
  
  const getTextStyles = () => {
    const textVariants = {
      // Landing page hero styles
      'hero-main': {
        ...theme.typography.h1,
        fontWeight: 'bold',
        fontSize: {
          xs: '2rem',
          sm: '2.5rem', 
          md: '3rem',
          lg: '3.5rem',
          xl: '4rem'
        },
        fontFamily: '"Montserrat", sans-serif',
        lineHeight: { xs: 1.3, md: 1.1, lg: 1.15 },
        color: theme.palette.primary.darkSecondary,
        mb: { xs: 2, md: 3, lg: 4 }
      },
      
      'hero-subtitle': {
        ...theme.typography.body1,
        mt: { xs: 3, md: 4, lg: 5 },
        color: theme.palette.text.primary,
        fontWeight: 300,
        lineHeight: 1.75,
        fontFamily: '"Poppins", sans-serif',
        fontSize: {
          xs: '1rem',
          sm: '1.1rem',
          md: '1.25rem', 
          lg: '1.35rem',
          xl: '1.5rem'
        },
        maxWidth: { xs: '100%', md: '90%', lg: '85%' }
      },
      
      // Brand name accent styling
      'brand-accent': {
        fontFamily: '"Dancing Script", cursive',
        fontWeight: 600,
        color: theme.palette.success.main
      },
      
      // Product name highlight
      'product-highlight': {
        color: theme.palette.success.main,
        fontWeight: 'bold'
      },
      
      // Section headers in modals/forms
      'section-header': {
        ...theme.typography.h6,
        fontWeight: 600,
        color: theme.palette.info.main,
        mt: 4,
        mb: 2
      },
      
      // Modal/dialog titles
      'modal-title': {
        ...theme.typography.h5,
        fontWeight: 700
      },
      
      // Form field labels with emoji
      'field-label': {
        ...theme.typography.subtitle1,
        fontWeight: 600,
        mb: 1.5
      },
      
      // Helper text for forms
      'form-helper': {
        ...theme.typography.body2,
        color: theme.palette.text.secondary,
        mb: 3
      },
      
      // Responsive card text
      'card-responsive': {
        fontSize: { xs: '0.9rem', md: '1.1rem' }
      },
      
      // Standard body variants (fallback to theme)
      body1: theme.typography.body1,
      body2: theme.typography.body2,
      h1: theme.typography.h1,
      h2: theme.typography.h2,
      h3: theme.typography.h3,
      h4: theme.typography.h4,
      h5: theme.typography.h5,
      h6: theme.typography.h6,
      subtitle1: theme.typography.subtitle1,
      subtitle2: theme.typography.subtitle2,
      caption: theme.typography.caption
    };
    
    return textVariants[variant] || textVariants.body1;
  };

  // Determine the MUI variant to use (fallback for standard variants)
  const getMuiVariant = () => {
    const muiVariants = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'subtitle1', 'subtitle2', 'body1', 'body2', 'caption'];
    return muiVariants.includes(variant) ? variant : 'body1';
  };

  return (
    <Typography 
      variant={getMuiVariant()}
      component={component}
      color={color}
      sx={{
        ...getTextStyles(),
        ...sx
      }}
      {...props}
    >
      {children}
    </Typography>
  );
};

export default ThemeText;