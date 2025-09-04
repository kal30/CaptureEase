import React from 'react';
import { Chip } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { USER_ROLES, getRoleDisplay } from '../../constants/roles';

/**
 * Reusable User Role Badge Component
 * Shows role badges like "Primary Parent", "Caregiver", "Therapist"
 */
const UserRoleBadge = ({ 
  role, 
  icon = '', 
  size = 'small',
  variant = 'filled' 
}) => {
  const theme = useTheme();
  
  // Get role styling from centralized constants - KISS approach
  const roleDisplay = getRoleDisplay(role);
  const getRoleStyle = () => ({
    bgcolor: alpha(roleDisplay.color, 0.1),
    color: roleDisplay.color,
    icon: roleDisplay.icon
  });

  const roleStyle = getRoleStyle();
  const displayIcon = icon || roleStyle.icon;
  
  // Format role name from constants - KISS approach
  const formatRoleName = () => roleDisplay.badge || 'User';

  return (
    <Chip
      label={`${displayIcon} ${formatRoleName()}`}
      size={size}
      variant={variant}
      sx={{
        bgcolor: roleStyle.bgcolor,
        color: roleStyle.color,
        fontWeight: 600,
        fontSize: size === 'small' ? '0.75rem' : '0.875rem',
        '& .MuiChip-label': {
          px: size === 'small' ? 1 : 1.5,
        }
      }}
    />
  );
};

export default UserRoleBadge;