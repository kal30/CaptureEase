import React, { useState } from 'react';
import {
  Box,
  Collapse,
  Typography,
  IconButton,
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { alpha, useTheme, keyframes } from '@mui/material/styles';

// Minimal animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const ActionGroup = ({ 
  group, 
  child, 
  onActionClick, 
  completionStatus = {},
  defaultExpanded = false,
  highlightedActions = {},
  onActionHover,
  onActionLeave
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleToggle = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  // Calculate completion for this group with mixed tracking
  const getTodayDateString = () => new Date().toDateString();
  
  const getCompletionStatus = (action) => {
    if (action.trackingType === 'daily') {
      // For daily items, check if completed today
      const todayStatus = completionStatus[`${action.key}_${getTodayDateString()}`];
      return todayStatus === true;
    } else {
      // For task items, use persistent completion
      return completionStatus[action.key] === true;
    }
  };

  const completedActions = group.actions.filter(action => 
    getCompletionStatus(action)
  ).length;
  const totalActions = group.actions.length;

  return (
    <Box
      sx={{
        backgroundColor: 'white',
        border: '1px solid',
        borderColor: 'grey.200',
        borderRadius: 2,
        p: 2,
        mb: 2,
      }}
    >
      {/* Clean Header */}
      <Box
        onClick={handleToggle}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 1.5,
          cursor: 'pointer',
          '&:hover': {
            '& .group-title': {
              color: alpha(group.color, 0.8),
            }
          },
        }}
      >
        <Typography
          className="group-title"
          variant="h6"
          sx={{
            fontWeight: 600,
            color: group.color,
            fontSize: '1.1rem',
            transition: 'color 0.2s ease',
          }}
        >
          {group.title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="caption"
            sx={{
              color: completedActions === totalActions ? theme.palette.success.dark : 'text.secondary',
              fontSize: '0.8rem',
              fontWeight: completedActions === totalActions ? 600 : 400,
            }}
          >
            {completedActions === totalActions ? "All done ✅" : `${completedActions} of ${totalActions} ✅`}
          </Typography>
          <IconButton
            size="small"
            sx={{ 
              color: 'text.secondary',
              p: 0.5,
              '&:hover': {
                color: group.color,
              }
            }}
          >
            <ExpandMoreIcon 
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          </IconButton>
        </Box>
      </Box>

      {/* Simple Actions */}
      <Collapse in={expanded}>
        <Box sx={{ pb: 2, pl: 1 }}>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: 2,
            animation: expanded ? `${fadeIn} 0.3s ease-out` : 'none',
          }}>
            {group.actions.map((action) => {
              const isCompleted = getCompletionStatus(action);
              const isHighlighted = highlightedActions[action.key] || false;
              
              // Get distinct colors for different action types
              const getActionColor = (actionKey) => {
                switch(actionKey) {
                  case 'journal': return '#ff0080'; // Hot pink for creative/free-form
                  case 'incident': return '#DC2626'; // Red for urgent/incidents
                  default: return group.color; // Default group color
                }
              };
              
              const actionColor = getActionColor(action.key);
              
              return (
                <Typography
                  key={action.key}
                  onClick={(e) => {
                    e.stopPropagation();
                    onActionClick(action, child);
                  }}
                  onMouseEnter={() => {
                    // Only highlight for Daily Care actions that have quick entry circles
                    if (['journal', 'incident'].includes(action.key)) {
                      onActionHover?.(action.key, child.id);
                    }
                  }}
                  onMouseLeave={() => {
                    if (['journal', 'incident'].includes(action.key)) {
                      onActionLeave?.(child.id);
                    }
                  }}
                  sx={{
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    color: isCompleted ? theme.palette.success.main : actionColor,
                    fontWeight: isCompleted ? 600 : 500,
                    opacity: isCompleted ? 0.8 : 1,
                    transition: 'all 0.2s ease',
                    backgroundColor: isHighlighted ? alpha(actionColor, 0.15) : 'transparent',
                    borderRadius: isHighlighted ? 1 : 0,
                    px: isHighlighted ? 1 : 0,
                    py: isHighlighted ? 0.5 : 0,
                    transform: isHighlighted ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: isHighlighted ? `0 2px 8px ${alpha(actionColor, 0.3)}` : 'none',
                    '&:hover': {
                      color: isCompleted ? theme.palette.success.dark : alpha(actionColor, 0.8),
                      textDecoration: 'underline',
                    },
                    '&:before': {
                      content: isCompleted ? '"\u2713 "' : `"${action.icon} "`,
                      marginRight: '4px',
                    },
                    '&:after': action.trackingType === 'daily' ? {
                      content: '" (add)"',
                      fontSize: '0.8rem',
                      opacity: 0.6,
                      fontStyle: 'italic',
                    } : {}
                  }}
                  title={action.description || action.label}
                >
                  {action.label}
                </Typography>
              );
            })}
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};

export default ActionGroup;

