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
  timelineSummary = {},
  onEditChild,
  onDeleteChild,
  onInviteTeamMember,
  onDailyReport,
  onNotificationClick,
  sx = {}
}) => {
  const allChips = useChildCardChips(userRole, completedToday);
  const hasEntriesToday = (timelineSummary.todayCount || 0) > 0;
  const metricChips = [
    hasEntriesToday
      ? {
          key: 'today',
          label: `${timelineSummary.todayCount} today`,
          color: 'primary',
          variant: 'filled',
        }
      : null,
    timelineSummary.weekCount > 0
      ? {
          key: 'week',
          label: `${timelineSummary.weekCount} this week`,
          variant: 'outlined',
          sx: {
            borderColor: 'divider',
            color: 'text.primary',
            backgroundColor: 'background.paper',
          },
        }
      : null,
    timelineSummary.activityStreak > 0
      ? {
          key: 'streak',
          label: `${timelineSummary.activityStreak} day streak`,
          color: 'success',
          variant: 'outlined',
        }
      : null,
  ].filter(Boolean);

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

        {/* Medical Info Section - Clean Text Line */}
        {(child.diagnosis || child.concerns || child.conditions || child.medicalProfile?.foodAllergies?.length > 0) && (
          <MedicalInfoDisplay
            diagnosis={child.diagnosis || (child.concerns && child.concerns[0]?.label) || (child.conditions && child.conditions[0])}
            allergies={child.medicalProfile?.foodAllergies}
          />
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

        {(metricChips.length > 0 || timelineSummary.lastActivityTime || !hasEntriesToday) && (
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {metricChips.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {metricChips.map((chip) => (
                  <Chip
                    key={chip.key}
                    label={chip.label}
                    size="small"
                    color={chip.color}
                    variant={chip.variant}
                    sx={chip.sx}
                  />
                ))}
              </Box>
            )}

            {!hasEntriesToday && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: '0.82rem', fontWeight: 500 }}
              >
                No entries yet today — tap to log something
              </Typography>
            )}

            {timelineSummary.lastActivityTime && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', fontSize: '0.78rem', fontWeight: 500 }}
              >
                Last activity at {timelineSummary.lastActivityTime}
              </Typography>
            )}
          </Box>
        )}
      </Box>

    </Box>
  );
});

export default ChildCardHeader;
