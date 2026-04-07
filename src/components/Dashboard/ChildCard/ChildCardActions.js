import React from 'react';
import { Box, Button } from '@mui/material';
import { useRole } from '../../../contexts/RoleContext';
import QuickEntrySection from '../QuickEntrySection';
import colors from '../../../assets/theme/colors';

/**
 * ChildCardActions - Action buttons and quick entry section
 * Contains quick entry buttons, daily report, and role-specific actions
 * 
 * @param {Object} props
 * @param {Object} props.child - Child object
 * @param {Object} props.status - Daily care status
 * @param {string} props.userRole - User's role for this child
 * @param {boolean} props.completedToday - Whether daily care is completed
 * @param {function} props.onQuickEntry - Handler for quick entry actions
 * @param {function} props.onDailyReport - Handler for daily report
 * @param {function} props.onTrack - Handler for track action
 * @param {function} props.onOpenFoodLog - Handler for food log action
 * @param {function} props.onOpenMedicalLog - Handler for medical log action
 * @param {string} props.hoveredQuickAction - Currently hovered quick action
 * @param {function} props.onHoverAction - Handler for action hover
 * @param {function} props.onLeaveAction - Handler for action leave
 * @param {function} props.onMessages - Handler for Messages button click
 * @param {Object} props.sx - Additional styling
 */
const ChildCardActions = ({
  child,
  status,
  userRole,
  completedToday,
  helperText,
  hidePrimaryAction = false,
  onQuickEntry,
  onDailyReport,
  onTrack,
  onOpenFoodLog,
  onOpenMedicalLog,
  onImportLogs,
  hoveredQuickAction,
  onHoverAction,
  onLeaveAction,
  onMessages,
  sx = {}
}) => {
  const { USER_ROLES } = useRole();

  const handleQuickActionHover = (actionType) => {
    if (onHoverAction) {
      onHoverAction(actionType);
    }
  };

  const handleQuickActionLeave = () => {
    if (onLeaveAction) {
      onLeaveAction();
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        flexWrap: { xs: 'wrap', md: 'nowrap' },
        ...sx 
      }}
    >
      {!hidePrimaryAction ? (
        <QuickEntrySection
          child={child}
          status={status}
          userRole={userRole}
          completedToday={completedToday}
          helperText={helperText}
          hidePrimaryAction={hidePrimaryAction}
          onQuickEntry={onQuickEntry}
          onDailyReport={onDailyReport}
          onTrack={onTrack}
          onOpenFoodLog={onOpenFoodLog}
          onOpenMedicalLog={onOpenMedicalLog}
          onImportLogs={onImportLogs}
          onHoverAction={handleQuickActionHover}
          onLeaveAction={handleQuickActionLeave}
          externalHoveredAction={hoveredQuickAction}
        />
      ) : (
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              pt: 0.35,
            }}
          >
            <Button
              variant="outlined"
              startIcon={<span aria-hidden="true">📝</span>}
              onClick={(e) => {
                e.stopPropagation();
                onDailyReport?.(child);
              }}
              sx={{
                flex: 1,
                justifyContent: 'flex-start',
                minHeight: 36,
                px: 1.25,
                borderRadius: 0.8,
                textTransform: 'none',
                fontSize: '0.84rem',
                fontWeight: 700,
                color: colors.brand.navy,
                borderColor: colors.app.dashboard.quickAction.secondaryBorder,
                backgroundColor: colors.landing.surface,
                boxShadow: `0 10px 24px ${colors.app.cards.shadowPanel}`,
                '&:hover': {
                  borderColor: colors.brand.ink,
                  backgroundColor: colors.landing.sageLight,
                },
              }}
            >
              Prep for Therapy
            </Button>
        </Box>
      )}

      {/* Role-Specific Action Buttons */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          alignSelf: hidePrimaryAction ? { xs: 'flex-start', md: 'stretch' } : 'stretch',
          pt: { xs: hidePrimaryAction ? 0 : 0, md: 0.5 },
          width: { xs: hidePrimaryAction ? 'auto' : '100%', md: 'auto' },
          justifyContent: { xs: hidePrimaryAction ? 'flex-end' : 'center', md: 'flex-end' },
          order: { xs: hidePrimaryAction ? 0 : 2, md: 0 },
          ml: hidePrimaryAction ? 'auto' : 0,
        }}
      >
        {/* Action Buttons */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            alignItems: 'center',
            width: { xs: hidePrimaryAction ? 'auto' : '100%', md: 'auto' }
          }}
        >
          {userRole === USER_ROLES.THERAPIST && (
            // Professional tools for therapists
            <Button
              variant="contained"
              size="small"
              onClick={(e) => {
                e.stopPropagation(); // Prevent card expansion
                // TODO: Navigate to analytics/insights page
                console.log('View Analytics for child:', child.id);
              }}
              sx={{
                py: 0.5,
                px: 1.5,
                fontSize: '0.875rem',
                minWidth: 'auto',
                borderRadius: 1,
                backgroundColor: colors.brand.tint,
                color: colors.brand.navy,
                '&:hover': {
                  backgroundColor: colors.brand.ice,
                },
              }}
            >
              📊 Analytics
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ChildCardActions;
