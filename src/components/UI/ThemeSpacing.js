import React from 'react';
import { Box } from '@mui/material';

/**
 * ThemeSpacing - Handles all spacing patterns consistently
 * Eliminates the need for sx spacing props throughout the app
 * 
 * Usage:
 * <ThemeSpacing variant="field">Content</ThemeSpacing>        // Standard form field spacing (mb: 3)
 * <ThemeSpacing variant="section">Content</ThemeSpacing>      // Section spacing (mt: 4, mb: 2) 
 * <ThemeSpacing variant="section-large">Content</ThemeSpacing> // Large section spacing (responsive)
 * <ThemeSpacing variant="modal-content">Content</ThemeSpacing> // Modal internal spacing (p: 4)
 * 
 * Special wrapper variants:
 * <ThemeSpacing.Field><TextField ... /></ThemeSpacing.Field>  // Auto-wraps form fields
 */
const ThemeSpacing = ({ 
  variant = 'field', 
  component = 'div',
  children,
  sx = {},
  ...props 
}) => {
  
  const getSpacingStyles = () => {
    const spacingVariants = {
      // Form field spacing - most common pattern
      field: {
        mb: 3
      },
      
      // Section header spacing
      section: {
        mt: 4,
        mb: 2
      },
      
      // Large responsive section spacing (landing page style)
      'section-large': {
        mt: { xs: 4, md: 5, lg: 6 }
      },
      
      // Small section spacing
      'section-small': {
        mt: { xs: 3, md: 4, lg: 5 },
        mb: { xs: 2, md: 3, lg: 4 }
      },
      
      // Modal content padding
      'modal-content': {
        p: 4
      },
      
      // Chip spacing pattern
      chip: {
        mr: 0.5,
        mb: 0.5
      },
      
      // Card gap spacing
      'card-gap': {
        gap: { xs: 3, md: 4, lg: 5 }
      },
      
      // Top margin only for displaced elements
      'top-displaced': {
        mt: { xs: 4, md: 0 }
      },
      
      // No spacing (reset)
      none: {}
    };
    
    return spacingVariants[variant] || spacingVariants.field;
  };

  return (
    <Box 
      component={component}
      sx={{
        ...getSpacingStyles(),
        ...sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

// Convenience wrapper for form fields that automatically applies field spacing
ThemeSpacing.Field = ({ children, ...props }) => (
  <ThemeSpacing variant="field" {...props}>
    {children}
  </ThemeSpacing>
);

export default ThemeSpacing;