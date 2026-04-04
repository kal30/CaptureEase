import React from 'react';
import { Box, Button } from '@mui/material';
import { useRole } from '../../../contexts/RoleContext';
import QuickEntrySection from '../QuickEntrySection';

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
                color: 'rgba(15, 23, 42, 0.82)',
                borderColor: 'rgba(148, 163, 184, 0.18)',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.88) 0%, rgba(240,244,255,0.72) 100%)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05)',
                '&:hover': {
                  borderColor: 'rgba(99, 102, 241, 0.28)',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(236,242,255,0.82) 100%)',
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
                background:
                  'linear-gradient(135deg, #94A3B8 0%, #64748B 100%)',
                color: 'white',
                '&:hover': {
                  background:
                    'linear-gradient(135deg, #64748B 0%, #475569 100%)',
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
