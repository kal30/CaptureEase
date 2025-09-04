import React from 'react';
import { Card } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

/**
 * ThemeCard - Reusable card component with consistent styling
 * Handles all card variations: basic, role-based, completion states, hover effects
 * 
 * Usage:
 * <ThemeCard variant="basic" onClick={handleClick}>content</ThemeCard>
 * <ThemeCard variant="role" role="therapist" elevated>content</ThemeCard>
 * <ThemeCard variant="completion" isCompleted={true}>content</ThemeCard>
 */
const ThemeCard = ({
  children,
  variant = 'basic', // 'basic', 'role', 'completion', 'modal'
  role = null, // 'therapist', 'caregiver', 'parent', 'family'
  isCompleted = false,
  elevated = false,
  clickable = false,
  borderWidth = 'normal', // 'normal', 'thick', 'none'
  size = 'medium', // 'small', 'medium', 'large'
  onClick,
  sx = {},
  ...props
}) => {
  const theme = useTheme();

  // Role-based styling configurations using centralized theme.palette.roles
  const getRoleConfig = (roleName) => {
    const mapRoleKey = (r) => {
      // CLEAN: Only new role types
      switch (r) {
        case 'care_owner':
          return 'care_owner';
        case 'care_partner':
          return 'care_partner';
        case 'caregiver':
        case 'therapist':
          return r;
        default:
          return 'care_owner'; // Default fallback
      }
    };

    const key = mapRoleKey(roleName);
    const roleToken = theme.palette.roles?.[key];
    const primary = roleToken?.primary || theme.palette.primary.main;
    const background = roleToken?.background || alpha(primary, 0.02);
    const borderColor = roleToken?.border || alpha(primary, 0.2);

    return {
      border: alpha(borderColor, 1),
      borderLeft: primary,
      background,
      shadow: alpha(primary, 0.08),
      hoverShadow: alpha(primary, 0.15)
    };
  };

  // Size configurations
  const getSizeConfig = (sizeType) => {
    const sizeConfigs = {
      small: {
        borderRadius: 6,
        padding: 12
      },
      medium: {
        borderRadius: 8,
        padding: 16
      },
      large: {
        borderRadius: 12,
        padding: 24
      }
    };
    return sizeConfigs[sizeType] || sizeConfigs.medium;
  };

  // Build card styles based on variant
  const getCardStyles = () => {
    const sizeConfig = getSizeConfig(size);
    const baseStyles = {
      borderRadius: `${sizeConfig.borderRadius}px`,
      overflow: 'hidden',
      position: 'relative',
      transition: 'all 0.2s ease',
      cursor: clickable || onClick ? 'pointer' : 'default'
    };

    switch (variant) {
      case 'role': {
        const roleConfig = getRoleConfig(role);
        return {
          ...baseStyles,
          border: `1px solid ${roleConfig.border}`,
          borderLeft: borderWidth === 'thick' ? `6px solid ${roleConfig.borderLeft}` : `4px solid ${roleConfig.borderLeft}`,
          backgroundColor: roleConfig.background,
          boxShadow: elevated ? `0 4px 12px ${roleConfig.shadow}` : `0 2px 8px ${roleConfig.shadow}`,
          '&:hover': (clickable || onClick) ? {
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 32px ${roleConfig.hoverShadow}`,
            borderColor: roleConfig.borderLeft
          } : {}
        };
      }

      case 'completion': {
        const completionColor = isCompleted ? theme.palette.success.main : theme.palette.primary.main;
        return {
          ...baseStyles,
          border: `1px solid ${alpha(completionColor, 0.3)}`,
          borderLeft: `4px solid ${completionColor}`,
          backgroundColor: isCompleted 
            ? alpha(theme.palette.success.main, 0.05)
            : alpha(theme.palette.primary.main, 0.03),
          boxShadow: elevated ? `0 4px 12px ${alpha(completionColor, 0.15)}` : `0 2px 8px ${alpha(completionColor, 0.08)}`,
          '&:hover': (clickable || onClick) ? {
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 32px ${alpha(completionColor, 0.2)}`
          } : {}
        };
      }

      case 'modal': {
        return {
          ...baseStyles,
          borderRadius: '20px',
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          boxShadow: elevated ? '0px 25px 50px rgba(0, 0, 0, 0.15)' : '0 4px 12px rgba(0,0,0,0.06)',
          '&:hover': (clickable || onClick) ? {
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
          } : {}
        };
      }

      case 'basic':
      default: {
        return {
          ...baseStyles,
          border: borderWidth === 'none' ? 'none' : `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          boxShadow: elevated ? '0 4px 12px rgba(0,0,0,0.06)' : '0 1px 3px rgba(0,0,0,0.05)',
          '&:hover': (clickable || onClick) ? {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            borderColor: alpha(theme.palette.primary.main, 0.3)
          } : {}
        };
      }
    }
  };

  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        ...getCardStyles(),
        ...sx
      }}
      {...props}
    >
      {children}
    </Card>
  );
};

export default ThemeCard;
