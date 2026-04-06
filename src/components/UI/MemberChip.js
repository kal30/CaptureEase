import React from 'react';
import { Chip, Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import colors from '../../assets/theme/colors';

// Role configuration with styling and emojis
const getRoleConfig = (role, t) => {
  const configs = {
    [t('owner_one')]: { color: colors.app.dailyCare.primary, emoji: "👑", priority: 0 },
    [t('partner_one')]: { color: colors.app.dailyCare.light, emoji: "👨‍👩‍👧‍👦", priority: 1 },
    [t('caregiver_one')]: { color: colors.app.performance.primary, emoji: "🤱", priority: 2 },
    [t('therapist_one')]: { color: colors.app.incident.painMedical, emoji: "🩺", priority: 3 },
  };
  return configs[role] || { color: colors.app.text.muted, emoji: "👤", priority: 5 };
};

/**
 * MemberChip - Displays care team members with role styling
 */
const MemberChip = ({ 
  member, 
  variant = 'compact',
  showRole = true,
  onClick,
  currentUserId
}) => {
  const { t } = useTranslation('terms');
  
  const roleConfig = getRoleConfig(member.role, t);
  const isCurrentUser = currentUserId && (member.userId === currentUserId || member.uid === currentUserId);
  const rawDisplayName = member.name || member.displayName || member.email || t('team_member_one');
  const displayName = isCurrentUser ? t('me') : rawDisplayName;
  const firstName = isCurrentUser ? t('me') : displayName.split(' ')[0];

  if (variant === 'compact') {
    return (
      <Chip
        label={
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography sx={{ fontSize: "0.8rem", lineHeight: 1 }}>
              {roleConfig.emoji}
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
              {firstName}
            </Typography>
          </Box>
        }
        size="medium"
        onClick={onClick}
        sx={{
          height: 24,
          fontSize: "0.75rem",
          bgcolor: alpha(roleConfig.color, 0.12),
          color: roleConfig.color,
          fontWeight: 600,
          borderRadius: 1,
          border: `1px solid ${alpha(roleConfig.color, 0.2)}`,
          cursor: onClick ? 'pointer' : 'default',
          '&:hover': onClick ? {
            bgcolor: alpha(roleConfig.color, 0.8), // Darker background for better contrast with white text
            color: colors.app.cards.background, // Force white text on hover
            transform: 'translateY(-1px)',
            boxShadow: `0 2px 8px ${alpha(roleConfig.color, 0.3)}`,
            '& .MuiTypography-root': {
              color: colors.app.cards.background, // Force all typography to be white on hover
            }
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

// Helper function to sort members by priority - CLEAN VERSION
export const sortMembersByPriority = (members, t) => {
  return [...members].sort((a, b) => {
    const aPriority = getRoleConfig(a.role, t).priority;
    const bPriority = getRoleConfig(b.role, t).priority;
    return aPriority - bPriority;
  });
};

export default MemberChip;
