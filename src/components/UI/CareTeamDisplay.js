import React from 'react';
import { IconButton } from '@mui/material';
import { LocalHospital as HospitalIcon, Add as AddIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import ProgressiveDisclosure from './ProgressiveDisclosure';
import MemberChip, { sortMembersByPriority } from './MemberChip';

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
  sx = {}
}) => {
  const theme = useTheme();

  // Collect and sort all team members - CLEAN VERSION
  const getAllMembers = () => {
    const members = [
      ...(child.users?.care_partners?.map((partner) => ({
        ...partner,
        role: "Care Partner",
      })) || []),
      ...(child.users?.caregivers?.map((caregiver) => ({
        ...caregiver,
        role: "Caregiver",
      })) || []),
      ...(child.users?.therapists?.map((therapist) => ({
        ...therapist,
        role: "Therapist",
      })) || []),
    ];
    
    return sortMembersByPriority(members);
  };

  const members = getAllMembers();
  
  // Check if user can invite team members
  const canInvite = userRole === "care_owner"; // CLEAN: Only Care Owner can invite

  // Render member in header (compact)
  const renderMember = (member, index) => (
    <MemberChip 
      key={index}
      member={member} 
      variant="compact"
    />
  );

  // Render member in popover (detailed)
  const renderExpandedMember = (member, index) => (
    <MemberChip 
      key={index}
      member={member} 
      variant="detailed"
      showRole={true}
    />
  );

  // Invite button component
  const inviteButton = canInvite ? (
    <IconButton
      size="small"
      onClick={(e) => {
        e.stopPropagation();
        onInviteTeamMember?.(child.id);
      }}
      sx={{
        width: 16,
        height: 16,
        ml: 0.5,
        bgcolor: theme.palette.primary.main,
        "&:hover": { 
          bgcolor: theme.palette.primary.dark 
        },
      }}
    >
      <AddIcon sx={{ fontSize: 10, color: "white" }} />
    </IconButton>
  ) : null;

  return (
    <ProgressiveDisclosure
      items={members}
      maxVisible={maxVisible}
      renderItem={renderMember}
      renderExpandedItem={renderExpandedMember}
      label="Team"
      icon={<HospitalIcon sx={{ color: theme.palette.secondary.main, fontSize: 14 }} />}
      actionButton={inviteButton}
      sx={sx}
    />
  );
};

export default CareTeamDisplay;