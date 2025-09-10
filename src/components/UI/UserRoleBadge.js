import React from 'react';
import { Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { USER_ROLES, getRoleDisplay } from '../../constants/roles';
import { getRoleColorAlpha } from '../../assets/theme/roleColors';

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
  
  // Get role styling from centralized constants - now using role-based colors
  const roleDisplay = getRoleDisplay(role);
  const getRoleStyle = () => ({
    bgcolor: getRoleColorAlpha(getRoleKey(role), 'primary', 0.1),
    color: roleDisplay.color, // This now uses the new role colors from constants
    icon: roleDisplay.icon
  });

  // Map user roles to role color keys
  const getRoleKey = (userRole) => {
    const roleMap = {
      [USER_ROLES.CARE_OWNER]: 'careOwner',
      [USER_ROLES.CARE_PARTNER]: 'carePartner', 
      [USER_ROLES.CAREGIVER]: 'caregiver',
      [USER_ROLES.THERAPIST]: 'therapist'
    };
    return roleMap[userRole] || 'careOwner';
  };

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