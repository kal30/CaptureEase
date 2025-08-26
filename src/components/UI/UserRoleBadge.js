import React from 'react';
import { Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';

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
  // Role-specific styling
  const getRoleStyle = () => {
    switch (role) {
      case 'PRIMARY_PARENT':
        return {
          bgcolor: alpha('#6D28D9', 0.1),
          color: '#6D28D9',
          icon: '👑'
        };
      case 'CAREGIVER':
        return {
          bgcolor: alpha('#059669', 0.1),
          color: '#059669',
          icon: '👤'
        };
      case 'THERAPIST':
        return {
          bgcolor: alpha('#64748B', 0.1),
          color: '#64748B',
          icon: '🩺'
        };
      default:
        return {
          bgcolor: alpha('#6B7280', 0.1),
          color: '#6B7280',
          icon: '👤'
        };
    }
  };

  const roleStyle = getRoleStyle();
  const displayIcon = icon || roleStyle.icon;
  
  // Format role name for display
  const formatRoleName = (role) => {
    switch (role) {
      case 'PRIMARY_PARENT':
        return 'Primary Parent';
      case 'CAREGIVER':
        return 'Caregiver';
      case 'THERAPIST':
        return 'Therapist';
      default:
        return role?.replace(/_/g, ' ') || 'User';
    }
  };

  return (
    <Chip
      label={`${displayIcon} ${formatRoleName(role)}`}
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