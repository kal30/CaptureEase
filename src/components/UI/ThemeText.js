import React from 'react';
import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  landingTypography, 
  landingColors 
} from '../../assets/theme/landingTheme';

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
        ...landingTypography.heroMain,
        color: landingColors.heroText,
      },
      
      'hero-subtitle': {
        ...landingTypography.heroSubtitle,
        color: landingColors.bodyText,
      },
      
      // Brand name accent styling
      'brand-accent': {
        ...landingTypography.brandAccent,
        color: landingColors.brandAccent
      },
      
      // Product name highlight
      'product-highlight': {
        ...landingTypography.productHighlight,
        color: landingColors.productHighlight,
      },
      
      // Section headers in modals/forms
      'section-header': {
        ...theme.typography.h6,
        ...theme.typography.sectionHeader,
        color: theme.palette.info.main,
      },
      
      // Modal/dialog titles
      'modal-title': {
        ...theme.typography.h5,
        ...theme.typography.modalTitle,
      },
      
      // Form field labels with emoji
      'field-label': {
        ...theme.typography.subtitle1,
        ...theme.typography.fieldLabel,
      },
      
      // Helper text for forms
      'form-helper': {
        ...theme.typography.body2,
        ...theme.typography.formHelper,
        color: theme.palette.text.secondary,
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