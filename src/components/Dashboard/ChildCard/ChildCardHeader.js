import React, { memo, useEffect, useMemo, useState } from 'react';
import { Box, Chip, IconButton, Tooltip, Typography } from '@mui/material';
import { useMediaQuery, useTheme } from '@mui/material';
import { ChatBubbleOutlineRounded } from '@mui/icons-material';
import ChildAvatar from '../../UI/ChildAvatar';
import CareTeamDisplay from '../../UI/CareTeamDisplay';
import ChildManagementMenu from '../../../features/dashboard/shared/ChildManagementMenu';
import MedicalInfoDisplay from './MedicalInfoDisplay';
import { getChildCareTeam } from '../../../services/childAccessService';
import { ROLE_DISPLAY, USER_ROLES } from '../../../constants/roles';
import { getRoleColor, getRoleColorAlpha } from '../../../assets/theme/roleColors';
import colors from '../../../assets/theme/colors';

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
 * @param {function} props.onMessages - Handler for opening child chat
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
  onMessages,
  onNotificationClick,
  compactIdentityOnMobile = false,
  collapseSummaryOnMobile = false,
  sx = {}
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const showCompactMobileIdentity = compactIdentityOnMobile && isMobile;
  const showCollapsedSummaryLine = showCompactMobileIdentity && collapseSummaryOnMobile;
  const [careTeamCount, setCareTeamCount] = useState(null);

  useEffect(() => {
    let isMounted = true;

    if (!child?.id || !onMessages) {
      setCareTeamCount(null);
      return undefined;
    }

    const loadCareTeamCount = async () => {
      try {
        const members = await getChildCareTeam(child.id);
        if (isMounted) {
          setCareTeamCount(Array.isArray(members) ? members.length : 0);
        }
      } catch (error) {
        if (isMounted) {
          setCareTeamCount(0);
        }
      }
    };

    loadCareTeamCount();

    return () => {
      isMounted = false;
    };
  }, [child?.id, onMessages]);
  const roleChip = useMemo(() => {
    if (!userRole) {
      return null;
    }

    const roleMap = {
      [USER_ROLES.CARE_OWNER]: 'careOwner',
      [USER_ROLES.CARE_PARTNER]: 'carePartner',
      [USER_ROLES.CAREGIVER]: 'caregiver',
      [USER_ROLES.THERAPIST]: 'therapist',
    };

    const roleKey = roleMap[userRole] || 'careOwner';
    return {
      label: ROLE_DISPLAY[userRole]?.label || userRole,
      variant: 'filled',
      sx: {
        fontWeight: 600,
        backgroundColor: getRoleColorAlpha(roleKey, 'primary', 0.1),
        color: getRoleColor(roleKey, 'primary'),
        border: `1px solid ${getRoleColorAlpha(roleKey, 'primary', 0.3)}`,
      },
    };
  }, [userRole]);
  const hasEntriesToday = (timelineSummary.todayCount || 0) > 0;
  const shouldShowMedicalInfo = Boolean(
    child.diagnosis ||
    child.concerns ||
    child.conditions ||
    child.medicalProfile?.foodAllergies?.length > 0
  );
  const metricChips = [
    hasEntriesToday
      ? {
          key: 'today',
          label: `${timelineSummary.todayCount} today`,
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
          variant: 'outlined',
        }
      : null,
  ].filter(Boolean);

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 1, md: 2 }, ...sx }}>
      {!showCompactMobileIdentity && (
        <ChildAvatar
          child={child}
          userRole={userRole}
          size={isMobile ? 'medium' : 'large'}
          showRole={false}
        />
      )}

      <Box sx={{ flex: 1, minWidth: 0 }}>
      {showCompactMobileIdentity ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 0.35,
            mb: 0.35,
          }}
        >
          {onMessages ? (
            <Tooltip title="Open child chat">
              <IconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  onMessages?.(child);
                }}
                sx={{
                  width: 30,
                  height: 30,
                  bgcolor: colors.landing.surface,
                  border: `1px solid ${colors.landing.borderLight}`,
                  color: colors.brand.ink,
                  '&:hover': {
                    bgcolor: colors.landing.sageLight,
                  },
                }}
                aria-label="Open child chat"
              >
                <ChatBubbleOutlineRounded sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
          ) : null}

          <ChildManagementMenu
            child={child}
            userRole={userRole}
            canAddData={canAddData}
            onEditChild={onEditChild}
            onDeleteChild={onDeleteChild}
            onInviteTeamMember={onInviteTeamMember}
            onDailyReport={onDailyReport}
          />
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.12, mb: { xs: 0.25, md: 0.5 } }}>
              <Typography
                variant="h5"
                sx={{
                  flex: '0 1 auto',
                  minWidth: 0,
                  fontWeight: 700,
                  fontSize: { xs: '1.05rem', md: '1.4rem' },
                  lineHeight: { xs: 1.15, md: 1.2 },
                  overflow: { xs: 'visible', md: 'hidden' },
                  textOverflow: { xs: 'clip', md: 'ellipsis' },
                  whiteSpace: { xs: 'normal', md: 'nowrap' },
                  color: 'text.primary',
                }}
                title={child.name}
              >
                {child.name}
              </Typography>

              {onMessages ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Tooltip title={careTeamCount === 0 ? 'No care team yet' : 'Open child chat'}>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          if (careTeamCount === 0) return;
                          onMessages?.(child);
                        }}
                        disabled={careTeamCount === 0}
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: colors.landing.surface,
                          border: `1px solid ${colors.landing.borderLight}`,
                          color: careTeamCount === 0 ? 'text.disabled' : colors.brand.ink,
                          '&:hover': {
                            bgcolor: careTeamCount === 0 ? colors.landing.surface : colors.landing.sageLight,
                          },
                        }}
                        aria-label={careTeamCount === 0 ? 'No care team yet' : 'Open child chat'}
                      >
                        <ChatBubbleOutlineRounded sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>
                  </Tooltip>
                  {careTeamCount === 0 ? (
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      No care team yet
                    </Typography>
                  ) : null}
                </Box>
              ) : null}

              <ChildManagementMenu
                child={child}
                userRole={userRole}
                canAddData={canAddData}
                onEditChild={onEditChild}
                onDeleteChild={onDeleteChild}
                onInviteTeamMember={onInviteTeamMember}
                onDailyReport={onDailyReport}
              />

            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: { xs: 0.25, md: 0.5 }, flexWrap: 'wrap' }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: '1rem', md: '1.2rem' }, lineHeight: 1.1 }}
              >
                Age {child.age}
              </Typography>

              {roleChip ? (
                <Chip
                  key="role-chip"
                  label={roleChip.label}
                  size="small"
                  variant={roleChip.variant || 'outlined'}
                  color={undefined}
                  sx={{
                    height: { xs: 22, md: 24 },
                    fontSize: { xs: '0.68rem', md: '0.75rem' },
                    fontWeight: roleChip.sx?.fontWeight || 600,
                    minWidth: { xs: 'unset', md: '80px' },
                    px: { xs: 0.35, md: 0.75 },
                    ...roleChip.sx,
                    '&.MuiChip-root': {
                      backgroundColor: roleChip.sx?.backgroundColor,
                      color: roleChip.sx?.color,
                      border: roleChip.sx?.border,
                    }
                  }}
                />
              ) : null}
            </Box>
          </>
        )}

        {showCollapsedSummaryLine ? (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              fontSize: '0.76rem',
              color: 'text.secondary',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              mb: 0.25,
            }}
          >
            {[child.diagnosis || (child.concerns && child.concerns[0]?.label) || (child.conditions && child.conditions[0]), child.medicalProfile?.foodAllergies?.join(', ')].filter(Boolean).join(' • ')}
          </Typography>
        ) : shouldShowMedicalInfo && (
          <MedicalInfoDisplay
            diagnosis={child.diagnosis || (child.concerns && child.concerns[0]?.label) || (child.conditions && child.conditions[0])}
            allergies={child.medicalProfile?.foodAllergies}
            compact={showCompactMobileIdentity}
          />
        )}

        {!showCollapsedSummaryLine && (metricChips.length > 0 || timelineSummary.lastActivityTime || !hasEntriesToday) && (
          <Box sx={{ mt: { xs: 0.3, md: 1 }, display: 'flex', flexDirection: 'column', gap: { xs: 0.25, md: 0.75 } }}>
            {showCompactMobileIdentity ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                }}
              >
                {child.users && (child.users.care_partners?.length > 0 || child.users.caregivers?.length > 0 || child.users.therapists?.length > 0 || child.users?.care_owner) ? (
                  <CareTeamDisplay
                    child={child}
                    userRole={userRole}
                    onInviteTeamMember={onInviteTeamMember}
                    maxVisible={2}
                    compactMobile={true}
                    sx={{ mt: 0, p: 0, minWidth: 0, flex: 1 }}
                  />
                ) : (
                  <Box />
                )}

              {metricChips.find((chip) => chip.key === 'streak') && (
                <Chip
                  label={metricChips.find((chip) => chip.key === 'streak').label}
                  size="small"
                  variant="outlined"
                  sx={{
                    bgcolor: colors.brand.ice,
                    borderColor: colors.brand.tint,
                    color: colors.brand.deep,
                    height: 22,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    flex: '0 0 auto',
                    ml: 0.5,
                  }}
                />
                )}
              </Box>
            ) : (
              <>
                {child.users && (child.users.care_partners?.length > 0 || child.users.caregivers?.length > 0 || child.users.therapists?.length > 0) && (
                  <CareTeamDisplay
                    child={child}
                    userRole={userRole}
                    onInviteTeamMember={onInviteTeamMember}
                    maxVisible={isMobile ? 3 : 4}
                    compactMobile={false}
                    sx={{
                      mt: { xs: 0.35, md: 1 },
                      p: { xs: 0.9, md: 1.5 },
                    }}
                  />
                )}

                {metricChips.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                    {metricChips.map((chip) => (
                      <Chip
                        key={chip.key}
                        label={chip.label}
                        size="small"
                      variant={chip.variant}
                      sx={{
                          ...(chip.key === 'today' && {
                            bgcolor: colors.landing.tealLight,
                            color: colors.brand.navy,
                            borderColor: colors.brand.ink,
                          }),
                          ...(chip.key === 'week' && {
                            bgcolor: colors.landing.surface,
                            color: colors.brand.navy,
                            borderColor: colors.landing.borderLight,
                          }),
                          ...(chip.key === 'streak' && {
                            bgcolor: colors.brand.ice,
                            color: colors.brand.deep,
                            borderColor: colors.brand.tint,
                          }),
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
              </>
            )}

            {timelineSummary.lastActivityTime && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: 'block',
                  fontSize: { xs: showCompactMobileIdentity ? '0.7rem' : '0.72rem', md: '0.78rem' },
                  fontWeight: 500,
                  lineHeight: 1.2,
                  pt: showCompactMobileIdentity ? 0.15 : 0,
                }}
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
