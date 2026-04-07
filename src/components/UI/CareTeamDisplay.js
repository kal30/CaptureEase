import React, { useState } from 'react';
import { Avatar, Box, IconButton, Paper, Popover, Typography } from "@mui/material";
import {
  LocalHospital as HospitalIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material/styles";
import { useAuthState } from 'react-firebase-hooks/auth';
import { useTranslation } from 'react-i18next';
import { auth } from '../../services/firebase';
import { USER_ROLES } from "../../constants/roles";
import ProgressiveDisclosure from "./ProgressiveDisclosure";
import MemberChip, { sortMembersByPriority } from "./MemberChip";
import colors from '../../assets/theme/colors';

const getMemberAvatarColor = (role, t) => {
  const roleColors = {
    [t('owner_one')]: colors.brand.tint,
    [t('partner_one')]: colors.brand.lightBlue,
    [t('caregiver_one')]: colors.brand.ink,
    [t('therapist_one')]: colors.brand.deep,
  };
  return roleColors[role] || "#94A3B8";
};

/**
 * CareTeamDisplay - Smart care team component with progressive disclosure
 *
 * @param {Object} child - Child object with users data
 * @param {string} userRole - Current user's role
 * @param {Function} onInviteTeamMember - Callback for inviting team members
 * @param {number} maxVisible - Maximum members to show in header (default: 2)
 * @param {Object} sx - Custom styling
 */
const CareTeamDisplay = ({
  child,
  userRole,
  onInviteTeamMember,
  maxVisible = 2,
  compactMobile = false,
  sx = {},
}) => {
  const theme = useTheme();
  const [user] = useAuthState(auth);
  const { t } = useTranslation('terms');
  const [anchorEl, setAnchorEl] = useState(null);
  const teamLabel = t('care_team');
  const open = Boolean(anchorEl);

  // Collect and sort all team members - CLEAN VERSION
  const getAllMembers = () => {
    const members = [
      ...(child.users?.care_partners?.map((partner) => ({
        ...partner,
        role: t('partner_one'),
      })) || []),
      ...(child.users?.caregivers?.map((caregiver) => ({
        ...caregiver,
        role: t('caregiver_one'),
      })) || []),
      ...(child.users?.therapists?.map((therapist) => ({
        ...therapist,
        role: t('therapist_one'),
      })) || []),
    ];

    // Add Care Owner if they exist and we have their user data
    if (child.users?.care_owner) {
      // If care_owner is a string (just userID), create a placeholder member
      if (typeof child.users.care_owner === 'string') {
        members.push({
          userId: child.users.care_owner,
          uid: child.users.care_owner,
          role: t('owner_one'),
          name: user?.uid === child.users.care_owner ? user?.displayName : t('owner_one'),
          displayName: user?.uid === child.users.care_owner ? user?.displayName : t('owner_one')
        });
      } else {
        // If care_owner is an object with user data
        members.push({
          ...child.users.care_owner,
          role: t('owner_one'),
        });
      }
    }

    return sortMembersByPriority(members, t);
  };

  const members = getAllMembers();

  // Check if user can invite team members
  const canInvite = userRole === USER_ROLES.CARE_OWNER; // CLEAN: Only Care Owner can invite

  // Render member in header (compact)
  const renderMember = (member, index) => (
    <MemberChip 
      key={index} 
      member={member} 
      variant="compact" 
      currentUserId={user?.uid}
    />
  );

  // Render member in popover (detailed)
  const renderExpandedMember = (member, index) => (
    <MemberChip
      key={index}
      member={member}
      variant="detailed"
      showRole={true}
      currentUserId={user?.uid}
    />
  );

  const handleMoreClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getMemberLabel = (member) => {
    const rawDisplayName = member.name || member.displayName || member.email || t('team_member_one');
    return rawDisplayName;
  };

  const getMemberInitials = (member) => {
    const label = getMemberLabel(member);
    return label
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || '•';
  };

  // Invite button component
  const inviteButton = canInvite ? (
    <IconButton
      size="small"
      onClick={(e) => {
        e.stopPropagation();
        onInviteTeamMember?.(child.id);
      }}
      sx={{
        width: compactMobile ? 22 : 20,
        height: compactMobile ? 22 : 20,
        ml: 0.5,
        bgcolor: colors.landing.surface,
        border: `1px solid ${alpha(colors.brand.ink, 0.26)}`,
        "&:hover": {
          bgcolor: colors.landing.sageLight,
          transform: "scale(1.05)",
          boxShadow: `0 2px 8px ${colors.brand.ink}18`,
        },
      }}
    >
      <AddIcon sx={{ fontSize: 12, color: colors.brand.ink }} />
    </IconButton>
  ) : null;

  if (compactMobile) {
    const visibleMembers = members.slice(0, maxVisible);
    const hiddenCount = Math.max(0, members.length - maxVisible);

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.65,
          flexWrap: 'nowrap',
          overflow: 'hidden',
          ...sx,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontSize: '0.75rem',
            color: theme.palette.text.primary,
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}
        >
          {teamLabel}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, overflow: 'visible', ml: 0.15 }}>
          {visibleMembers.map((member, index) => {
            const avatarColor = getMemberAvatarColor(member.role, t);
            return (
              <Avatar
                key={member.userId || member.uid || index}
                src={member.profilePhoto || member.photoURL || member.avatarUrl}
                onClick={handleMoreClick}
                sx={{
                  width: 24,
                  height: 24,
                  ml: index === 0 ? 0 : -0.55,
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  border: '2px solid #fff',
                  bgcolor: alpha(avatarColor, 0.92),
                  color: '#fff',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                }}
                title={getMemberLabel(member)}
              >
                {!member.profilePhoto && !member.photoURL && getMemberInitials(member)}
              </Avatar>
            );
          })}
          {hiddenCount > 0 && (
            <Box
              onClick={handleMoreClick}
              sx={{
                width: 24,
                height: 24,
                minWidth: 24,
                ml: -0.55,
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#ffffff',
                color: theme.palette.text.secondary,
                border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              +{hiddenCount}
            </Box>
          )}
          {inviteButton}
        </Box>

        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Paper sx={{ p: 2, maxWidth: 300, maxHeight: 400, overflow: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {teamLabel} ({members.length})
              </Typography>
              <IconButton size="small" onClick={handleClose}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {members.map((member, index) => (
                <Box key={index}>
                  {renderExpandedMember(member, index)}
                </Box>
              ))}
            </Box>
          </Paper>
        </Popover>
      </Box>
    );
  }

  return (
    <ProgressiveDisclosure
      items={members}
      maxVisible={maxVisible}
      renderItem={renderMember}
      renderExpandedItem={renderExpandedMember}
      label={t('care_team')}
      icon={
        <HospitalIcon
          sx={{ color: colors.brand.tint, fontSize: 16 }}
        />
      }
      actionButton={inviteButton}
      sx={{
        mt: 1,
        p: 1.5,
        bgcolor: theme.palette.background.paper,
        color: theme.palette.text.primary, // Use proper text color for visibility on white background
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        ...sx,
      }}
    />
  );
};

export default CareTeamDisplay;
