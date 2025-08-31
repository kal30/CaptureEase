import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  ChatBubble as ChatBubbleIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useChildContext } from '../../contexts/ChildContext';

/**
 * QuickEntrySection - Integrated Quick Entry circles with Daily Report
 * Connects to Daily Care data and provides hover highlighting
 */
const QuickEntrySection = ({
  child,
  status = {},
  userRole,
  completedToday,
  onQuickEntry,
  onDailyReport,
  onHoverAction,
  onLeaveAction,
  externalHoveredAction, // Action being hovered from Daily Care section
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { setCurrentChildId } = useChildContext();
  const [hoveredAction, setHoveredAction] = useState(null);

  // Quick action items with theme-driven colors and distinct styling
  const quickActions = [
    { 
      key: 'journal', 
      emoji: '📅', 
      label: 'Daily Habits', 
      description: 'Track mood, sleep, nutrition, progress & quick notes',
      color: '#f9d030', // Yellow for daily habits
      bgColor: '#fef9e7',
      type: 'input', // Indicates this opens an input
      shape: 'circle' // Circle shape like incident
    },
    { 
      key: 'incident', 
      emoji: '🛑', 
      label: 'Incident', 
      description: 'Log medical incidents with follow-ups',
      color: '#DC2626', // Red for urgent/incidents
      bgColor: '#FEF2F2',
      type: 'input', // Indicates this opens an input form
      shape: 'circle' // Back to circle shape
    },
    { 
      key: 'journaling', 
      emoji: '💬', 
      label: 'Journaling', 
      description: 'Rich daily journal with photos, videos & templates',
      color: '#795548', // Brown for journaling
      bgColor: '#f3e5ab',
      type: 'navigation', // Indicates this navigates to a page
      shape: 'circle',
      navigationPath: '/log'
    },
  ];

  const handleQuickEntryClick = (action, e) => {
    e.stopPropagation();
    
    // Handle navigation actions (like Journaling)
    if (action.type === 'navigation' && action.navigationPath) {
      // Set the current child ID before navigating
      setCurrentChildId(child.id);
      navigate(action.navigationPath);
      return;
    }
    
    // Handle regular input actions
    onQuickEntry?.(child, action.key, e);
  };

  const handleQuickEntryHover = (actionKey) => {
    setHoveredAction(actionKey);
    onHoverAction?.(actionKey, child.id);
  };

  const handleQuickEntryLeave = () => {
    setHoveredAction(null);
    onLeaveAction?.(child.id);
  };

  const handleDailyReportClick = (e) => {
    e.stopPropagation();
    onDailyReport?.(child);
  };

  // Don't show for therapists (they have read-only view)
  if (userRole === 'therapist') {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          py: 1,
          px: 2,
          borderRadius: 2,
          bgcolor: theme.palette.grey[50],
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontSize: "0.875rem",
            fontWeight: 600,
            color: theme.palette.text.secondary,
          }}
        >
          Today's Status:
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {quickActions.map((action) => (
            <Box
              key={action.key}
              sx={{
                width: 24,
                height: 24,
                borderRadius: "50%", // All circles now
                border: `1px solid ${status[action.key] 
                  ? action.color 
                  : theme.palette.divider}`,
                bgcolor: status[action.key]
                  ? action.bgColor
                  : theme.palette.background.paper,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title={`${action.label}: ${action.description}`}
            >
              <Typography sx={{ fontSize: "0.75rem" }}>
                {status[action.key] && action.key === 'journal' ? "📅" : status[action.key] ? "✓" : action.emoji}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        display: "flex", 
        alignItems: "center",
        gap: 2, 
        px: { xs: 0, md: 2 },
        width: { xs: "100%", md: "auto" },
        justifyContent: { xs: "center", md: "flex-start" },
      }}
    >
      {/* Quick Entry Circles */}
      {quickActions.map((action) => (
        <Tooltip
          key={action.key}
          title={`${action.label}: ${action.description}`}
          arrow
          placement="top"
        >
          <Box
            onClick={(e) => handleQuickEntryClick(action, e)}
            onMouseEnter={() => handleQuickEntryHover(action.key)}
            onMouseLeave={handleQuickEntryLeave}
            sx={{
              width: 30, // Same size for all circles
              height: 30, // Same size for all circles
              borderRadius: "50%", // All circles now
              border: action.key === 'journal' ? `3px solid ${action.color}` : `2px solid ${action.color}`, // Thicker border for journal
              bgcolor: status[action.key]
                ? action.bgColor
                : action.key === 'journal' ? action.bgColor : theme.palette.background.paper, // Always use colored bg for journal
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
              transform: (hoveredAction === action.key || externalHoveredAction === action.key) ? "scale(1.15)" : "scale(1)",
              boxShadow: (hoveredAction === action.key || externalHoveredAction === action.key)
                ? `0 4px 12px ${action.color}60` 
                : action.key === 'journal' ? `0 2px 8px ${action.color}30` : "none", // Always have subtle shadow for journal
              // Gradient background for journal
              ...(action.key === 'journal' && {
                background: `linear-gradient(135deg, ${action.bgColor} 0%, ${action.color}20 100%)`, // Gradient background for journal
              }),
              // Gradient background for journaling
              ...(action.key === 'journaling' && {
                background: `linear-gradient(135deg, ${action.bgColor} 0%, ${action.color}20 100%)`, // Gradient background for journaling
              }),
              "&:hover": {
                borderColor: action.color,
                bgcolor: action.bgColor,
                transform: action.key === 'journal' ? "scale(1.25)" : "scale(1.1)", // Even more dramatic hover for journal
                boxShadow: action.key === 'journal' ? `0 6px 16px ${action.color}50` : `0 2px 8px ${action.color}40`,
              },
            }}
          >
            <Typography sx={{ fontSize: "1.2rem" }}>
              {status[action.key] && action.key === 'journal' ? "📅" : status[action.key] ? "✓" : action.emoji}
            </Typography>
          </Box>
        </Tooltip>
      ))}

      {/* Daily Report Button - Integrated */}
      <Tooltip
        title="Analytics: View today's daily care summary and progress insights"
        arrow
        placement="top"
      >
        <IconButton
          size="small"
          onClick={handleDailyReportClick}
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: completedToday
              ? `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`
              : `linear-gradient(135deg, ${theme.palette.dailyCare.primary} 0%, ${theme.palette.dailyCare.dark} 100%)`,
            color: 'white',
            boxShadow: `0 2px 4px ${theme.palette.dailyCare.primary}20`,
            '&:hover': {
              background: completedToday
                ? `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`
                : `linear-gradient(135deg, ${theme.palette.dailyCare.dark} 0%, ${theme.palette.dailyCare.primary} 100%)`,
              transform: "scale(1.1)",
              boxShadow: `0 4px 8px ${theme.palette.dailyCare.primary}30`,
            },
            transition: "all 0.2s ease",
          }}
        >
          <AssessmentIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default QuickEntrySection;