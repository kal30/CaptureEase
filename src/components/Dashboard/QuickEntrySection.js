import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  MoreHoriz as MoreHorizIcon,
} from '@mui/icons-material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import LunchDiningOutlinedIcon from '@mui/icons-material/LunchDiningOutlined';
import WcOutlinedIcon from '@mui/icons-material/WcOutlined';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useChildContext } from '../../contexts/ChildContext';
import { getLogTypeByCategory } from '../../constants/logTypeRegistry';
import colors from '../../assets/theme/colors';

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
  hidePrimaryAction = false,
  onQuickEntry,
  onDailyReport,
  onTrack,
  onOpenFoodLog,
  onOpenMedicalLog,
  onImportLogs,
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

  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setMenuAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handlePrepForTherapy = (e) => {
    e.stopPropagation();
    handleMenuClose();
    onDailyReport?.(child);
  };

  const handleImportPastLogs = (e) => {
    e.stopPropagation();
    handleMenuClose();
    onImportLogs?.(child);
  };

  const handleTrack = (e) => {
    e.stopPropagation();
    handleMenuClose();
    onTrack?.(child, getLogTypeByCategory('bathroom').category);
  };

  const handleOpenMedicalLog = (e) => {
    e.stopPropagation();
    handleMenuClose();
    setCurrentChildId(child.id);
    onOpenMedicalLog?.(child);
  };

  const handleOpenFoodLog = (e) => {
    e.stopPropagation();
    handleMenuClose();
    setCurrentChildId(child.id);
    onOpenFoodLog?.(child);
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
          bgcolor: colors.landing.sageLight,
          border: `1px solid ${colors.app.dashboard.childHeader.heroBorder}`,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontSize: "0.875rem",
            fontWeight: 600,
            color: colors.landing.heroText,
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
                  ? colors.brand.deep
                  : theme.palette.divider}`,
                bgcolor: status[action.key]
                  ? colors.landing.panelSoft
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
            backgroundColor: colors.brand.ink,
            color: colors.landing.heroText,
            fontWeight: 600,
            fontSize: "0.75rem",
            minHeight: "28px",
            px: 1.5,
            "&:hover": {
              backgroundColor: colors.brand.navy,
              transform: "scale(1.05)",
            },
            boxShadow: `0 2px 4px ${colors.brand.ink}30`,
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
        justifyContent: { xs: hidePrimaryAction ? "flex-end" : "space-between", md: "flex-start" },
        flexDirection: { xs: 'column', md: 'row' },
      }}
    >
      {!hidePrimaryAction && (
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
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                gap: 0.25,
                flex: 1,
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
                  color: colors.semantic.surface,
                  background: `linear-gradient(135deg, ${colors.app.dashboard.quickAction.primaryGradientStart} 0%, ${colors.app.dashboard.quickAction.primaryGradientEnd} 100%)`,
                  boxShadow: (hoveredAction === primaryAction.key || externalHoveredAction === primaryAction.key)
                    ? `0 8px 18px ${colors.app.dashboard.quickAction.primaryHoverShadow}`
                    : `0 4px 10px ${colors.app.dashboard.quickAction.primaryShadow}`,
                  width: '100%',
                  '&:hover': {
                    background: `linear-gradient(135deg, ${colors.app.dashboard.quickAction.primaryHoverStart} 0%, ${colors.app.dashboard.quickAction.primaryHoverEnd} 100%)`,
                    boxShadow: `0 10px 20px ${colors.app.dashboard.quickAction.primaryHoverShadow}`,
                  },
                }}
              >
                {`+ ${primaryAction.label}`}
              </Button>
            </Box>

            <Tooltip title="More actions" arrow placement="top">
              <IconButton
                size="medium"
                onClick={handleMenuOpen}
                sx={{
                  width: { xs: 36, md: 42 },
                  minWidth: { xs: 36, md: 42 },
                  height: { xs: 36, md: 42 },
                  borderRadius: { xs: '14px', md: '12px' },
                  border: `1px solid ${colors.app.dashboard.quickAction.secondaryBorder}`,
                  backgroundColor: colors.app.dashboard.quickAction.secondaryBg,
                  color: colors.app.dashboard.quickAction.secondaryText,
                  '&:hover': {
                    backgroundColor: colors.app.dashboard.quickAction.secondaryHoverBg,
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <MoreHorizIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}

      {hidePrimaryAction && (
        <Box sx={{ width: '100%' }}>
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
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Tooltip title="More actions" arrow placement="top">
              <IconButton
                size="medium"
                onClick={handleMenuOpen}
                sx={{
                  width: 36,
                  minWidth: 36,
                  height: 36,
                  borderRadius: '14px',
                  border: `1px solid ${colors.app.dashboard.quickAction.secondaryBorder}`,
                  backgroundColor: colors.app.dashboard.quickAction.secondaryBg,
                  color: colors.app.dashboard.quickAction.secondaryText,
                  '&:hover': {
                    backgroundColor: colors.app.dashboard.quickAction.secondaryHoverBg,
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <MoreHorizIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
        {onDailyReport ? (
          <MenuItem onClick={handlePrepForTherapy}>
            <ListItemIcon>
              <AutoAwesomeOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Prep for Therapy"
              secondary="Review patterns and key moments before your session."
            />
          </MenuItem>
        ) : null}

        {onDailyReport && (onOpenMedicalLog || onTrack || onImportLogs) ? <Divider /> : null}

        {onOpenMedicalLog ? (
          <MenuItem onClick={handleOpenMedicalLog}>
            <ListItemIcon>
              <MedicationOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={getLogTypeByCategory('medication').trackLabel}
              secondary="Open the medical log page"
            />
          </MenuItem>
        ) : null}

        {onOpenMedicalLog && (onOpenFoodLog || onTrack || onImportLogs) ? <Divider /> : null}

        {onOpenFoodLog ? (
          <MenuItem onClick={handleOpenFoodLog}>
            <ListItemIcon>
              <LunchDiningOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={getLogTypeByCategory('food').trackLabel}
              secondary="Log a meal or snack"
            />
          </MenuItem>
        ) : null}

        {onOpenFoodLog && (onTrack || onImportLogs) ? <Divider /> : null}

        {onTrack ? (
          <MenuItem onClick={handleTrack}>
            <ListItemIcon>
              <WcOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={getLogTypeByCategory('bathroom').trackLabel}
              secondary="Log bathroom use"
            />
          </MenuItem>
        ) : null}

        {onTrack && onImportLogs ? <Divider /> : null}

        {onImportLogs ? (
          <MenuItem onClick={handleImportPastLogs}>
            <ListItemIcon>
              <FileUploadIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Import from a file"
              secondary="Have past logs?"
            />
          </MenuItem>
        ) : null}

        {(onDailyReport || onImportLogs) ? <Divider /> : null}

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
      </Menu>
    </Box>
  );
};

export default QuickEntrySection;
