import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

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
  const [hoveredAction, setHoveredAction] = useState(null);

  // Quick action items with theme-driven colors
  const quickActions = [
    { 
      key: 'mood', 
      emoji: '😊', 
      label: 'Mood', 
      description: 'Quick mood check',
    }, 
    { 
      key: 'sleep', 
      emoji: '😴', 
      label: 'Sleep', 
      description: "Last night's sleep",
    }, 
    { 
      key: 'incident', 
      emoji: '🚨', 
      label: 'Incident', 
      description: 'Log an incident',
    },
  ];

  const handleQuickEntryClick = (action, e) => {
    e.stopPropagation();
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
                borderRadius: "50%",
                border: `1px solid ${status[action.key] 
                  ? theme.palette.dailyCare.primary 
                  : theme.palette.divider}`,
                bgcolor: status[action.key]
                  ? theme.palette.dailyCare.background
                  : theme.palette.background.paper,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title={`${action.label}: ${action.description}`}
            >
              <Typography sx={{ fontSize: "0.75rem" }}>
                {status[action.key] ? "✓" : action.emoji}
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
        <Box
          key={action.key}
          onClick={(e) => handleQuickEntryClick(action, e)}
          onMouseEnter={() => handleQuickEntryHover(action.key)}
          onMouseLeave={handleQuickEntryLeave}
          sx={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: `2px solid ${theme.palette.dailyCare.primary}`,
            bgcolor: status[action.key]
              ? theme.palette.dailyCare.background
              : theme.palette.background.paper,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
            transform: (hoveredAction === action.key || externalHoveredAction === action.key) ? "scale(1.1)" : "scale(1)",
            boxShadow: (hoveredAction === action.key || externalHoveredAction === action.key)
              ? `0 2px 8px ${theme.palette.dailyCare.primary}40` 
              : "none",
            "&:hover": {
              borderColor: theme.palette.dailyCare.primary,
              bgcolor: theme.palette.dailyCare.background,
              transform: "scale(1.1)",
              boxShadow: `0 2px 8px ${theme.palette.dailyCare.primary}40`,
            },
          }}
          title={`${action.label}: ${action.description} - Click for quick entry`}
        >
          <Typography sx={{ fontSize: "1.2rem" }}>
            {status[action.key] ? "✓" : action.emoji}
          </Typography>
        </Box>
      ))}

      {/* Daily Report Button - Integrated */}
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
        title="View today's daily care summary"
      >
        <AssessmentIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Box>
  );
};

export default QuickEntrySection;