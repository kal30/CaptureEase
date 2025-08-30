import React from 'react';
import { Chip, Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

/**
 * MemberChip - Reusable component for displaying care team members
 * 
 * @param {Object} member - Member object with name, role, etc.
 * @param {string} variant - Display variant: 'compact' | 'detailed'
 * @param {boolean} showRole - Whether to show role in detailed view
 */
const MemberChip = ({ 
  member, 
  variant = 'compact',
  showRole = true,
  onClick
}) => {
  // Role-based styling and emojis
  const getRoleConfig = (role) => {
    switch (role) {
      case "Therapist":
        return { color: "#FF6B6B", emoji: "🩺", priority: 2 };
      case "Caregiver":
        return { color: "#4ECDC4", emoji: "🤱", priority: 3 };
      case "Co-Parent":
        return { color: "#45B7D1", emoji: "👨‍👩‍👧‍👦", priority: 1 };
      case "Family Member":
        return { color: "#EB684A", emoji: "👵", priority: 4 };
      case "Primary Parent":
        return { color: "#8B5CF6", emoji: "👑", priority: 0 };
      default:
        return { color: "#94A3B8", emoji: "👤", priority: 5 };
    }
  };

  const roleConfig = getRoleConfig(member.role);
  const displayName = member.name || member.displayName || 'Unknown';
  const firstName = displayName.split(' ')[0];

  if (variant === 'compact') {
    return (
      <Chip
        label={
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
            <Typography sx={{ fontSize: "0.7rem" }}>
              {roleConfig.emoji}
            </Typography>
            <Typography sx={{ fontSize: "0.7rem" }}>
              {firstName}
            </Typography>
          </Box>
        }
        size="small"
        onClick={onClick}
        sx={{
          height: 18,
          fontSize: "0.65rem",
          bgcolor: alpha(roleConfig.color, 0.15),
          color: roleConfig.color,
          fontWeight: 500,
          borderRadius: 0.5,
          cursor: onClick ? 'pointer' : 'default',
          '&:hover': onClick ? {
            bgcolor: alpha(roleConfig.color, 0.25),
          } : {}
        }}
      />
    );
  }

  // Detailed variant for popover
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1,
      p: 1,
      borderRadius: 1,
      '&:hover': {
        bgcolor: alpha(roleConfig.color, 0.05)
      }
    }}>
      <Typography sx={{ fontSize: "1rem" }}>
        {roleConfig.emoji}
      </Typography>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {displayName}
        </Typography>
        {showRole && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: roleConfig.color,
              fontSize: '0.75rem'
            }}
          >
            {member.role}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

// Helper function to sort members by priority
export const sortMembersByPriority = (members) => {
  return [...members].sort((a, b) => {
    const getRoleConfig = (role) => {
      switch (role) {
        case "Primary Parent": return { priority: 0 };
        case "Co-Parent": return { priority: 1 };
        case "Therapist": return { priority: 2 };
        case "Caregiver": return { priority: 3 };
        case "Family Member": return { priority: 4 };
        default: return { priority: 5 };
      }
    };
    
    return getRoleConfig(a.role).priority - getRoleConfig(b.role).priority;
  });
};

export default MemberChip;