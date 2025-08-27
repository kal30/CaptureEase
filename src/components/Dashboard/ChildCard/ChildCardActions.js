import React from 'react';
import {
  Box,
  Collapse,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ActionGroup from '../ActionGroup';

/**
 * ChildCardActions - Expandable action groups section
 * Clean theme-driven styling for action categories
 */
const ChildCardActions = ({
  child,
  isExpanded,
  canAddData = true,
  onInviteTeamMember,
  getActionGroups,
  handleGroupActionClick,
  highlightedActions = {},
  expandedCategories = {},
  setExpandedCategories,
  getTypeConfig,
  formatTimeAgo,
}) => {
  const theme = useTheme();

  if (!isExpanded || !canAddData) {
    return null;
  }

  const actionGroups = getActionGroups?.(child.id) || [];

  return (
    <Collapse in={isExpanded}>
      <Box 
        sx={{ 
          borderTop: 1, 
          borderColor: 'divider',
          bgcolor: alpha(theme.palette.background.default, 0.5),
        }}
      >
        {actionGroups.length > 0 ? (
          <Box sx={{ p: 2 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 600, 
                color: 'text.primary', 
                mb: 2 
              }}
            >
              Track Activities
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {actionGroups.map((group, index) => (
                <ActionGroup
                  key={`${child.id}-${group.category}-${index}`}
                  group={group}
                  childId={child.id}
                  onActionClick={handleGroupActionClick}
                  highlightedActions={highlightedActions}
                  expandedCategories={expandedCategories}
                  setExpandedCategories={setExpandedCategories}
                  getTypeConfig={getTypeConfig}
                  formatTimeAgo={formatTimeAgo}
                />
              ))}
            </Box>
          </Box>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No tracking activities available for this child
            </Typography>
          </Box>
        )}

        {/* Team Invitation Section */}
        {onInviteTeamMember && (
          <Box 
            sx={{ 
              p: 2, 
              borderTop: 1, 
              borderColor: 'divider',
              bgcolor: alpha(theme.palette.primary.main, 0.02),
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.75rem',
              }}
            >
              Need help tracking? {' '}
              <Box
                component="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onInviteTeamMember?.(child.id);
                }}
                sx={{
                  background: 'none',
                  border: 'none',
                  color: theme.palette.primary.main,
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: 'inherit',
                  fontFamily: 'inherit',
                  p: 0,
                  '&:hover': {
                    color: theme.palette.primary.dark,
                  },
                }}
              >
                Invite a team member
              </Box>
            </Typography>
          </Box>
        )}
      </Box>
    </Collapse>
  );
};

export default ChildCardActions;