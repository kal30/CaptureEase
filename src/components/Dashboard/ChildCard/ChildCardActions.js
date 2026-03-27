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
  onQuickEntry,
  onDailyReport,
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
      {/* Quick Entry Section with Therapy Prep */}
      <QuickEntrySection
        child={child}
        status={status}
        userRole={userRole}
        completedToday={completedToday}
        onQuickEntry={onQuickEntry}
        onDailyReport={onDailyReport}
        onHoverAction={handleQuickActionHover}
        onLeaveAction={handleQuickActionLeave}
        externalHoveredAction={hoveredQuickAction}
      />

      {/* Role-Specific Action Buttons */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          alignSelf: 'stretch',
          pt: { xs: 0, md: 0.5 },
          width: { xs: '100%', md: 'auto' },
          justifyContent: { xs: 'center', md: 'flex-end' },
          order: { xs: 2, md: 0 }
        }}
      >
        {/* Action Buttons */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            alignItems: 'center',
            width: { xs: '100%', md: 'auto' }
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
