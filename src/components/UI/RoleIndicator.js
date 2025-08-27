import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

/**
 * RoleIndicator - Reusable component for displaying user roles with consistent styling
 * Handles both header-style banners and compact badges
 * 
 * Usage:
 * <RoleIndicator role="therapist" variant="header" childName="Emma" />
 * <RoleIndicator role="caregiver" variant="badge" />
 * <RoleIndicator role="primary_parent" variant="compact" size="small" />
 */
const RoleIndicator = ({
  role,
  variant = 'badge', // 'badge', 'header', 'compact'
  childName,
  size = 'medium', // 'small', 'medium', 'large'
  showIcon = true,
  showLabel = true,
  sx = {},
  ...props
}) => {
  const theme = useTheme();

  // Role configuration with theme integration
  const getRoleConfig = (roleType) => {
    const roleConfigs = {
      therapist: {
        label: 'Clinical Therapist',
        shortLabel: 'Therapist',
        icon: '🩺',
        colors: {
          primary: '#1976D2',
          dark: '#0D47A1',
          light: '#E3F2FD',
          background: '#FAFCFF',
          gradient: 'linear-gradient(90deg, #E3F2FD 0%, #BBDEFB 100%)',
          border: '#E3F2FD'
        }
      },
      caregiver: {
        label: 'Caregiver',
        shortLabel: 'Caregiver',
        icon: '🤗',
        colors: {
          primary: '#F57C00',
          dark: '#BF360C',
          light: '#FFF3E0',
          background: '#FFFDF9',
          gradient: 'linear-gradient(90deg, #FFF3E0 0%, #FFCC80 100%)',
          border: '#FFF3E0'
        }
      },
      primary_parent: {
        label: 'Parent/Guardian',
        shortLabel: 'Primary Parent',
        icon: '👑',
        colors: {
          primary: '#388E3C',
          dark: '#1B5E20',
          light: '#E8F5E8',
          background: '#FAFFFE',
          gradient: 'linear-gradient(90deg, #E8F5E8 0%, #C8E6C9 100%)',
          border: '#E8F5E8'
        }
      },
      co_parent: {
        label: 'Co-Parent',
        shortLabel: 'Co-Parent',
        icon: '👨‍👩‍👧‍👦',
        colors: {
          primary: theme.palette.primary.main,
          dark: theme.palette.primary.dark,
          light: alpha(theme.palette.primary.main, 0.15),
          background: alpha(theme.palette.primary.main, 0.03),
          gradient: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`,
          border: alpha(theme.palette.primary.main, 0.3)
        }
      },
      family_member: {
        label: 'Family Member',
        shortLabel: 'Family',
        icon: '👵',
        colors: {
          primary: theme.palette.calendar.accent,
          dark: theme.palette.calendar.accentHover,
          light: alpha(theme.palette.calendar.accent, 0.15),
          background: alpha(theme.palette.calendar.accent, 0.03),
          gradient: `linear-gradient(90deg, ${alpha(theme.palette.calendar.accent, 0.12)} 0%, ${alpha(theme.palette.calendar.accent, 0.06)} 100%)`,
          border: alpha(theme.palette.calendar.accent, 0.4)
        }
      },
      unknown: {
        label: 'Team Member',
        shortLabel: 'Member',
        icon: '👤',
        colors: {
          primary: '#666',
          dark: '#424242',
          light: '#f5f5f5',
          background: '#fafafa',
          gradient: 'linear-gradient(90deg, #f5f5f5 0%, #eeeeee 100%)',
          border: '#f0f0f0'
        }
      }
    };

    return roleConfigs[roleType] || roleConfigs.unknown;
  };

  // Size configurations
  const getSizeConfig = (sizeType) => {
    const sizeConfigs = {
      small: {
        fontSize: '0.75rem',
        padding: '4px 8px',
        iconSize: '14px',
        height: 20
      },
      medium: {
        fontSize: '0.95rem',
        padding: '6px 12px',
        iconSize: '16px',
        height: 24
      },
      large: {
        fontSize: '1.1rem',
        padding: '8px 16px',
        iconSize: '18px',
        height: 32
      }
    };
    return sizeConfigs[sizeType] || sizeConfigs.medium;
  };

  const roleConfig = getRoleConfig(role);
  const sizeConfig = getSizeConfig(size);

  // Badge variant (Chip-based)
  if (variant === 'badge') {
    return (
      <Chip
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {showIcon && (
              <Box component="span" sx={{ fontSize: sizeConfig.iconSize }}>
                {roleConfig.icon}
              </Box>
            )}
            {showLabel && (
              <Box component="span">
                {sizeConfig.fontSize === '0.75rem' ? roleConfig.shortLabel : roleConfig.label}
              </Box>
            )}
          </Box>
        }
        size={size === 'large' ? 'medium' : 'small'}
        sx={{
          height: sizeConfig.height,
          fontSize: sizeConfig.fontSize,
          bgcolor: roleConfig.colors.light,
          color: roleConfig.colors.primary,
          fontWeight: 600,
          borderRadius: 1,
          ...sx
        }}
        {...props}
      />
    );
  }

  // Compact variant (simple inline display)
  if (variant === 'compact') {
    return (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1,
          py: 0.5,
          borderRadius: 1,
          bgcolor: roleConfig.colors.light,
          color: roleConfig.colors.primary,
          fontSize: sizeConfig.fontSize,
          fontWeight: 600,
          ...sx
        }}
        {...props}
      >
        {showIcon && (
          <Box component="span" sx={{ fontSize: sizeConfig.iconSize }}>
            {roleConfig.icon}
          </Box>
        )}
        {showLabel && (
          <Typography component="span" sx={{ fontSize: 'inherit', fontWeight: 'inherit' }}>
            {sizeConfig.fontSize === '0.75rem' ? roleConfig.shortLabel : roleConfig.label}
          </Typography>
        )}
      </Box>
    );
  }

  // Header variant (banner style like in ChildCard)
  if (variant === 'header') {
    return (
      <Box
        sx={{
          background: roleConfig.colors.gradient,
          color: roleConfig.colors.primary,
          p: '12px 20px',
          fontSize: '16px',
          fontWeight: 600,
          borderBottom: `2px solid ${roleConfig.colors.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          ...sx
        }}
        {...props}
      >
        {showIcon && (
          <Box component="span" sx={{ fontSize: '20px' }}>
            {roleConfig.icon}
          </Box>
        )}
        {showLabel && (
          <Box component="span" sx={{ flex: 1 }}>
            {roleConfig.label}
          </Box>
        )}
        {childName && (
          <Box
            component="span"
            sx={{
              fontSize: '18px',
              fontWeight: 700,
              color: roleConfig.colors.dark
            }}
          >
            {childName}
          </Box>
        )}
      </Box>
    );
  }

  return null;
};

export default RoleIndicator;