import React from 'react';
import { Box, Avatar } from '@mui/material';
import RoleIndicator from './RoleIndicator';

/**
 * ChildAvatar - Reusable avatar component with role indicator
 * Displays child's profile photo with optional role indicator overlay
 * 
 * @param {Object} props
 * @param {Object} props.child - Child object with name, profilePhoto
 * @param {string} props.userRole - User role for this child (primary_parent, co_parent, etc.)
 * @param {string} props.size - Avatar size: 'small', 'medium', 'large' 
 * @param {boolean} props.showRole - Whether to show role indicator (default: true)
 * @param {Object} props.sx - Additional styling
 */
const ChildAvatar = ({ 
  child, 
  userRole, 
  size = 'medium',
  showRole = true,
  sx = {} 
}) => {
  // Avatar size mapping
  const sizeMap = {
    small: 40,
    medium: 56,
    large: 80
  };

  const avatarSize = sizeMap[size] || sizeMap.medium;

  return (
    <Box sx={{ position: 'relative', ...sx }}>
      <Avatar
        src={child.profilePhoto}
        alt={child.name}
        sx={{
          width: avatarSize,
          height: avatarSize,
          fontSize: avatarSize / 2.5, // Dynamic font size for initials
          fontWeight: 600,
          bgcolor: 'primary.main',
          color: 'white'
        }}
      >
        {!child.profilePhoto && child.name?.[0]?.toUpperCase()}
      </Avatar>
      
      {/* Role Indicator Overlay */}
      {showRole && userRole && (
        <Box
          sx={{
            position: 'absolute',
            bottom: -4,
            right: -4,
            zIndex: 1
          }}
        >
          <RoleIndicator 
            role={userRole}
            size={size === 'small' ? 'tiny' : 'small'}
          />
        </Box>
      )}
    </Box>
  );
};

export default ChildAvatar;