import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Button,
  Menu,
  MenuItem,
  ListItemText,
} from '@mui/material';
import {
  AssignmentOutlined as AssignmentOutlinedIcon,
  MoreHoriz as MoreHorizIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useChildContext } from '../../contexts/ChildContext';
import { therapyTheme } from '../../assets/theme/therapyTheme';

/**
 * QuickEntrySection - Integrated Quick Entry circles with Therapy Prep access
 * Connects to Daily Care data and provides hover highlighting
 */
const QuickEntrySection = ({
  child,
  status = {},
  userRole,
  completedToday,
  helperText = '',
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
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  // The "Core Four" Hero Buttons
  const quickActions = [
    {
      key: 'magic',
      emoji: '＋',
      label: 'Log Something',
      description: 'Quick note popup',
      color: '#4caf50', // Green
      bgColor: '#e8f5e9',
      type: 'input',
      shape: 'button'
    },
  ];
  const primaryAction = quickActions[0];
  const secondaryActions = quickActions.slice(1);

  const handleQuickEntryClick = (action, e) => {
    e.stopPropagation();

    // Handle navigation actions
    if (action.type === 'navigation' && action.navigationPath) {
      setCurrentChildId(child.id);
      navigate(action.navigationPath, { state: { selectedChildId: child.id } });
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

  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setMenuAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Therapist-specific view with therapy notes access
  if (userRole === 'therapist') {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          py: 1,
          px: 2,
          borderRadius: 2,
          bgcolor: therapyTheme.background.subtle,
          border: `1px solid ${therapyTheme.border.light}`,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontSize: "0.875rem",
            fontWeight: 600,
            color: therapyTheme.text.primary,
          }}
        >
          🩺 Professional View:
        </Typography>

        {/* Status indicators (read-only) */}
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {quickActions.map((action) => (
            <Box
              key={action.key}
              sx={{
                width: 20,
                height: 20,
                borderRadius: "50%",
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
              <Typography sx={{ fontSize: "0.65rem" }}>
                {status[action.key] && action.key === 'journal' ? "📅" : status[action.key] ? "✓" : action.emoji}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Therapy Notes Button */}
        <Button
          size="small"
          variant="contained"
          startIcon="🩺"
          onClick={() => {
            // Set the current child ID before navigating
            setCurrentChildId(child.id);
            navigate('/therapy-notes');
          }}
          sx={{
            backgroundColor: therapyTheme.primary,
            color: "#FFFFFF",
            fontWeight: 600,
            fontSize: "0.75rem",
            minHeight: "28px",
            px: 1.5,
            "&:hover": {
              backgroundColor: therapyTheme.dark,
              transform: "scale(1.05)",
            },
            boxShadow: `0 2px 4px ${therapyTheme.primary}30`,
          }}
        >
          Notes
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "stretch",
        gap: { xs: 0.75, md: 1.25 },
        px: { xs: 0, md: 2 },
        width: { xs: "100%", md: "auto" },
        justifyContent: { xs: "space-between", md: "flex-start" },
        flexDirection: { xs: 'column', md: 'row' },
      }}
    >
      <Box sx={{ width: { xs: '100%', md: 'auto' } }}>
        {helperText && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: { xs: 'block', md: 'none' },
              textAlign: 'center',
              fontSize: '0.75rem',
              fontWeight: 500,
              lineHeight: 1.2,
              mb: 0.5,
            }}
          >
            {helperText}
          </Typography>
        )}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'stretch',
            gap: { xs: 0.65, md: 0.9 },
            width: { xs: '100%', md: 'auto' },
          }}
        >
          <Button
            variant="contained"
            onClick={(e) => handleQuickEntryClick(primaryAction, e)}
            onMouseEnter={() => handleQuickEntryHover(primaryAction.key)}
            onMouseLeave={handleQuickEntryLeave}
            sx={{
              minHeight: { xs: 36, md: 42 },
              px: { xs: 2, md: 2 },
              borderRadius: { xs: '14px', md: '12px' },
              textTransform: 'none',
              fontWeight: 700,
              fontSize: { xs: '0.88rem', md: '0.95rem' },
              color: '#ffffff',
              background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
              boxShadow: (hoveredAction === primaryAction.key || externalHoveredAction === primaryAction.key)
                ? '0 8px 18px rgba(76, 175, 80, 0.28)'
                : '0 4px 10px rgba(76, 175, 80, 0.18)',
              flex: 1,
              '&:hover': {
                background: 'linear-gradient(135deg, #43a047 0%, #1f6a28 100%)',
                boxShadow: '0 10px 20px rgba(76, 175, 80, 0.3)',
              },
            }}
          >
            {`+ ${primaryAction.label}`}
          </Button>

          <Tooltip title="More actions" arrow placement="top">
            <IconButton
              size="medium"
              onClick={handleMenuOpen}
              sx={{
                width: { xs: 36, md: 42 },
                minWidth: { xs: 36, md: 42 },
                height: { xs: 36, md: 42 },
                borderRadius: { xs: '14px', md: '12px' },
                border: '1px solid rgba(8, 31, 92, 0.14)',
                backgroundColor: '#ffffff',
                color: '#102d72',
                '&:hover': {
                  backgroundColor: '#f6f8fc',
                },
                transition: "all 0.2s ease",
              }}
            >
              <MoreHorizIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {secondaryActions.map((action) => (
          <MenuItem
            key={action.key}
            onClick={(e) => {
              handleMenuClose();
              handleQuickEntryClick(action, e);
            }}
          >
            <Typography sx={{ mr: 1, fontSize: '1rem' }}>{action.emoji}</Typography>
            <ListItemText primary={action.label} secondary={action.description} />
          </MenuItem>
        ))}
        <MenuItem
          onClick={(e) => {
            handleMenuClose();
            handleDailyReportClick(e);
          }}
        >
          <AssignmentOutlinedIcon sx={{ mr: 1.5, fontSize: 18, color: theme.palette.dailyCare.dark }} />
          <ListItemText primary="Therapy Prep" secondary="Prepare notes for therapy and specialist visits" />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default QuickEntrySection;
