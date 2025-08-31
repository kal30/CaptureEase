import React, { memo } from 'react';
import { Box, Chip } from '@mui/material';
import Typography from '@mui/material/Typography';
import ChildAvatar from '../../UI/ChildAvatar';
import ChildNotificationBadge from '../../UI/ChildNotificationBadge';
import CareTeamDisplay from '../../UI/CareTeamDisplay';
import ChildManagementMenu from '../ChildManagementMenu';
import MedicalInfoDisplay from './MedicalInfoDisplay';
import useChildCardChips from '../../../hooks/useChildCardChips';

/**
 * ChildCardHeader - Header section of child card with avatar, basic info, and actions
 * Contains avatar, name/age, care team, notification badge, and management menu
 * 
 * @param {Object} props
 * @param {Object} props.child - Child object with id, name, age, etc.
 * @param {string} props.userRole - User's role for this child
 * @param {boolean} props.canAddData - Whether user can add data for this child
 * @param {boolean} props.completedToday - Whether daily care is completed
 * @param {function} props.onEditChild - Handler for editing child
 * @param {function} props.onDeleteChild - Handler for deleting child
 * @param {function} props.onInviteTeamMember - Handler for inviting team members
 * @param {function} props.onDailyReport - Handler for daily report
 * @param {function} props.onNotificationClick - Handler for notification badge click
 * @param {Object} props.sx - Additional styling
 */
const ChildCardHeader = memo(({
  child,
  userRole,
  canAddData,
  completedToday,
  onEditChild,
  onDeleteChild,
  onInviteTeamMember,
  onDailyReport,
  onNotificationClick,
  sx = {}
}) => {
  const allChips = useChildCardChips(userRole, completedToday);

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, ...sx }}>
      {/* Avatar */}
      <ChildAvatar
        child={child}
        userRole={userRole}
        size="large"
        showRole={false} // Don't show role indicator on avatar since we have chip
      />

      {/* Child Info and Management Menu Row */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Name, Settings, and Notification Row */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.25, mb: 0.5 }}>
          <Typography
            variant="h5"
            sx={{ 
              fontWeight: 700, 
              fontSize: '1.4rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: 'text.primary'
            }}
            title={child.name}
          >
            {child.name}
          </Typography>
          
          {/* Settings Menu - Very close to name */}
          <ChildManagementMenu
            child={child}
            userRole={userRole}
            canAddData={canAddData}
            onEditChild={onEditChild}
            onDeleteChild={onDeleteChild}
            onInviteTeamMember={onInviteTeamMember}
            onDailyReport={onDailyReport}
          />
          
          {/* Notification Badge - Next to settings */}
          <ChildNotificationBadge
            childId={child.id}
            onClick={onNotificationClick}
            size="small"
            color="error"
            showIcon={true}
          />
        </Box>

        {/* Age and Role Chip Row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: '1.2rem' }}
          >
            Age {child.age}
          </Typography>
          
          {/* Role Chips */}
          {allChips.map((chip, index) => (
            <Chip
              key={index}
              label={chip.label}
              size="small"
              variant={chip.variant || 'outlined'}
              color={chip.color || 'default'}
              sx={{
                height: 22,
                fontSize: '0.75rem',
                fontWeight: chip.sx?.fontWeight || 400,
                ...chip.sx
              }}
            />
          ))}
        </Box>

        {/* Medical Info Row - Below Age */}
        {(child.diagnosis || (child.medicalProfile?.foodAllergies && child.medicalProfile.foodAllergies.length > 0)) && (
          <MedicalInfoDisplay 
            diagnosis={child.diagnosis}
            allergies={child.medicalProfile?.foodAllergies}
          />
        )}

        {/* Care Team */}
        {child.careTeamMembers && child.careTeamMembers.length > 0 && (
          <CareTeamDisplay
            members={child.careTeamMembers}
            maxVisible={3}
            size="small"
            sx={{ mt: 0.5 }}
          />
        )}
      </Box>

    </Box>
  );
});

export default ChildCardHeader;