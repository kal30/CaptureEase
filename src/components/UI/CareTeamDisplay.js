// Removed unused React import
import { IconButton } from "@mui/material";
import {
  LocalHospital as HospitalIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useAuthState } from 'react-firebase-hooks/auth';
import { useTranslation } from 'react-i18next';
import { auth } from '../../services/firebase';
import { USER_ROLES } from "../../constants/roles";
import ProgressiveDisclosure from "./ProgressiveDisclosure";
import MemberChip, { sortMembersByPriority } from "./MemberChip";

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
  sx = {},
}) => {
  const theme = useTheme();
  const [user] = useAuthState(auth);
  const { t } = useTranslation('terms');

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

  // Invite button component
  const inviteButton = canInvite ? (
    <IconButton
      size="small"
      onClick={(e) => {
        e.stopPropagation();
        onInviteTeamMember?.(child.id);
      }}
      sx={{
        width: 20,
        height: 20,
        ml: 0.5,
        bgcolor: theme.palette.primary.main,
        border: `1px solid ${theme.palette.primary.main}`,
        "&:hover": {
          bgcolor: theme.palette.primary.dark,
          transform: "scale(1.1)",
          boxShadow: `0 2px 8px ${theme.palette.primary.main}40`,
        },
      }}
    >
      <AddIcon sx={{ fontSize: 12, color: "white" }} />
    </IconButton>
  ) : null;

  return (
    <ProgressiveDisclosure
      items={members}
      maxVisible={maxVisible}
      renderItem={renderMember}
      renderExpandedItem={renderExpandedMember}
      label={t('care_team')}
      icon={
        <HospitalIcon
          sx={{ color: theme.palette.secondary.main, fontSize: 16 }}
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
