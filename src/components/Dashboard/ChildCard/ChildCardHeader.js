import React, { memo } from 'react';
import { Box, Chip } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useMediaQuery, useTheme } from '@mui/material';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
    !isMobile && timelineSummary.weekCount > 0
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
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 1.25, md: 2 }, ...sx }}>
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
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.25, mb: { xs: 0.25, md: 0.5 } }}>
          <Typography
            variant="h5"
            sx={{
              flex: 1,
              minWidth: 0,
              fontWeight: 700,
              fontSize: { xs: '1.05rem', md: '1.4rem' },
              lineHeight: { xs: 1.15, md: 1.2 },
              overflow: { xs: 'visible', md: 'hidden' },
              textOverflow: { xs: 'clip', md: 'ellipsis' },
              whiteSpace: { xs: 'normal', md: 'nowrap' },
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: { xs: 0.25, md: 0.5 }, flexWrap: 'wrap' }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: { xs: '1rem', md: '1.2rem' }, lineHeight: 1.1 }}
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
                height: { xs: 22, md: 24 },
                fontSize: { xs: '0.68rem', md: '0.75rem' },
                fontWeight: chip.sx?.fontWeight || 600,
                minWidth: { xs: 'unset', md: '80px' },
                px: { xs: 0.35, md: 0.75 },
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
            maxVisible={isMobile ? 3 : 4}
            sx={{
              mt: { xs: 0.5, md: 1 },
              p: { xs: 1, md: 1.5 },
            }}
          />
        )}

        {(metricChips.length > 0 || timelineSummary.lastActivityTime || !hasEntriesToday) && (
          <Box sx={{ mt: { xs: 0.75, md: 1 }, display: 'flex', flexDirection: 'column', gap: { xs: 0.5, md: 0.75 } }}>
            {metricChips.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                {metricChips.map((chip) => (
                  <Chip
                    key={chip.key}
                    label={chip.label}
                    size="small"
                    color={chip.color}
                    variant={chip.variant}
                    sx={{
                      height: { xs: 24, md: 26 },
                      fontSize: { xs: '0.78rem', md: '0.82rem' },
                      ...chip.sx,
                    }}
                  />
                ))}
              </Box>
            )}

            {!hasEntriesToday && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.78rem', md: '0.82rem' }, fontWeight: 500, lineHeight: 1.25 }}
              >
                No entries yet today — tap to log something
              </Typography>
            )}

            {timelineSummary.lastActivityTime && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', fontSize: { xs: '0.72rem', md: '0.78rem' }, fontWeight: 500, lineHeight: 1.2 }}
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
