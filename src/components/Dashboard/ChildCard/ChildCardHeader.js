import React, { memo, useState } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import ChildAvatar from '../../UI/ChildAvatar';
import ChildNotificationBadge from '../../UI/ChildNotificationBadge';
import CareTeamDisplay from '../../UI/CareTeamDisplay';
import ChildManagementMenu from '../ChildManagementMenu';
import MedicalInfoDisplay from './MedicalInfoDisplay';
import DiagnosisChips from '../DiagnosisChips';
import useChildCardChips from '../../../hooks/useChildCardChips';
import { getChildAge, formatAge } from '../../../utils/dateUtils';
import useIsMobile from '../../../hooks/useIsMobile';

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
  const isMobile = useIsMobile();
  const [showHealthDetails, setShowHealthDetails] = useState(false);

  // Calculate display age - prioritizes birthDate calculation, falls back to stored age
  const displayAge = getChildAge(child);
  const ageText = formatAge(displayAge);
  const concerns = child.concerns || child.conditions || [];
  const allergies = child.medicalProfile?.foodAllergies || [];
  const primaryConcern = concerns[0];
  const primaryAllergy = allergies[0];
  const remainingCount =
    Math.max(concerns.length - 1, 0) + Math.max(allergies.length - 1, 0);
  const hasHealthSummary = concerns.length > 0 || allergies.length > 0;

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: isMobile ? 1.5 : 2, ...sx }}>
      {/* Avatar */}
      <ChildAvatar
        child={child}
        userRole={userRole}
        size={isMobile ? 'medium' : 'large'}
        showRole={false} // Don't show role indicator on avatar since we have chip
      />

      {/* Child Info and Management Menu Row */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Name, Settings, and Notification Row */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.25, mb: isMobile ? 0.25 : 0.5 }}>
          <Typography
            variant="h5"
            sx={{ 
              fontWeight: 700, 
              fontSize: isMobile ? '1.1rem' : '1.4rem',
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: isMobile ? 0.25 : 0.5, flexWrap: 'wrap' }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: isMobile ? '0.95rem' : '1.2rem' }}
          >
            Age {ageText}
          </Typography>
          
          {/* Role Chips */}
          {allChips.map((chip, index) => (
              <Chip
                key={index}
                label={chip.label}
                size="small"
                variant={chip.variant || 'outlined'}
                color={chip.sx ? undefined : (chip.color || 'default')}
                sx={{
                  height: 24, // Slightly taller for better visibility
                  fontSize: '0.75rem',
                  fontWeight: chip.sx?.fontWeight || 600,
                  minWidth: '80px', // Ensure minimum width
                  ...chip.sx, // Apply the role colors
                  // Ensure the colors are applied with higher specificity
                  '&.MuiChip-root': {
                    backgroundColor: chip.sx?.backgroundColor,
                    color: chip.sx?.color,
                    border: chip.sx?.border,
                  }
                }}
              />
          ))}
        </Box>

        {/* Medical Info Summary */}
        {hasHealthSummary && (
          <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography
              variant="caption"
              sx={{
                fontSize: isMobile ? '0.75rem' : '0.8rem',
                color: 'text.secondary'
              }}
            >
              {primaryConcern && `Issues: ${primaryConcern.label || primaryConcern}`}
              {primaryConcern && primaryAllergy && ' | '}
              {primaryAllergy && `Allergies: ${primaryAllergy}`}
            </Typography>
            {remainingCount > 0 && (
              <Typography
                variant="caption"
                onClick={() => setShowHealthDetails((prev) => !prev)}
                sx={{
                  fontSize: isMobile ? '0.75rem' : '0.8rem',
                  color: 'primary.main',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                +{remainingCount} more
              </Typography>
            )}
          </Box>
        )}

        {showHealthDetails && (
          <>
            {(child.concerns || child.conditions) && (
              <DiagnosisChips concerns={child.concerns || child.conditions} />
            )}
            {(child.diagnosis ||
              (child.medicalProfile?.foodAllergies &&
                child.medicalProfile.foodAllergies.length > 0)) && (
              <MedicalInfoDisplay
                diagnosis={child.diagnosis}
                allergies={child.medicalProfile?.foodAllergies}
              />
            )}
          </>
        )}

        {/* Care Team */}
        {child.users && (child.users.care_partners?.length > 0 || child.users.caregivers?.length > 0 || child.users.therapists?.length > 0) && (
          <CareTeamDisplay
            child={child}
            userRole={userRole}
            onInviteTeamMember={onInviteTeamMember}
            maxVisible={4}
          />
        )}
      </Box>

    </Box>
  );
});

export default ChildCardHeader;
