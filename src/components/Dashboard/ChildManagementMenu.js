import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
} from '@mui/material';
import {
  Edit as EditIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  SwapHoriz as SwapHorizIcon,
  AutoAwesomeOutlined as AutoAwesomeOutlinedIcon,
  FileUploadOutlined as FileUploadOutlinedIcon,
  PersonAddAlt1Outlined as PersonAddAlt1OutlinedIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { USER_ROLES } from '../../constants/roles';
import colors from '../../assets/theme/colors';

/**
 * ChildManagementMenu - Extracted settings menu component for child management
 * Clean, focused component with edit, add team, and delete functionality
 */
const ChildManagementMenu = ({
  child,
  onEditChild,
  onInviteTeamMember,
  onDeleteChild,
  onSwitchChild,
  onPrepForTherapy,
  onImportLogs,
  onStartChat,
  careTeamCount = 0,
  userRole,
}) => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  // Care owners can manage everything; care partners can edit basic child info.
  const canManage = userRole === USER_ROLES.CARE_OWNER || userRole === USER_ROLES.CARE_PARTNER;
  const canInvite = userRole === USER_ROLES.CARE_OWNER; // Only Care Owner can invite
  const canEdit = userRole === USER_ROLES.CARE_OWNER || userRole === USER_ROLES.CARE_PARTNER;
  const canStartChat = typeof onStartChat === 'function' && careTeamCount > 1;
  const canDelete = canManage && typeof onDeleteChild === 'function';
  
  if (!canManage) return null;

  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleEditChild = (e) => {
    e.stopPropagation();
    onEditChild?.(child);
    handleMenuClose();
  };

  const handleInviteTeamMember = (e) => {
    e.stopPropagation();
    onInviteTeamMember?.(child.id);
    handleMenuClose();
  };

  const handleSwitchChild = (e) => {
    e.stopPropagation();
    onSwitchChild?.();
    handleMenuClose();
  };

  const handlePrepForTherapy = (e) => {
    e.stopPropagation();
    onPrepForTherapy?.(child);
    handleMenuClose();
  };

  const handleImportLogs = (e) => {
    e.stopPropagation();
    onImportLogs?.(child);
    handleMenuClose();
  };

  const handleStartChat = (e) => {
    e.stopPropagation();
    onStartChat?.(child);
    handleMenuClose();
  };

  const handleDeleteChild = (e) => {
    e.stopPropagation();
    onDeleteChild?.(child);
    handleMenuClose();
  };

  const childWarning = child?.medicalProfile?.foodAllergies?.find(Boolean) || child?.medicalProfile?.currentMedications?.find(Boolean);
  const warningLabel = typeof childWarning === 'string'
    ? (String(childWarning).toLowerCase().includes('nut') ? 'Nut Allergy' : `${childWarning} Allergy`)
    : childWarning?.name || childWarning?.medication || childWarning?.title || null;

  return (
    <>
      <IconButton
        size="small"
        onClick={handleMenuOpen}
        sx={{
          ml: 1,
          width: 32,
          height: 32,
          bgcolor: colors.landing.surface,
          color: colors.brand.deep,
          border: `1px solid ${colors.landing.borderLight}`,
          "&:hover": {
            bgcolor: colors.landing.sageLight,
          },
          transition: "background-color 0.2s ease, border-color 0.2s ease",
        }}
        title="Manage child settings"
      >
        <SettingsIcon sx={{ fontSize: 17 }} />
      </IconButton>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            elevation: 8,
            sx: {
              borderRadius: '12px',
              minWidth: 260,
              border: `1px solid ${colors.landing.borderLight}`,
              boxShadow: `0 24px 60px ${colors.landing.shadowPanel}`,
              bgcolor: 'rgba(255,255,255,0.98)',
              backdropFilter: 'blur(16px)',
              overflow: 'hidden',
            }
          }
        }}
      >
        {warningLabel ? (
          <Box sx={{ px: 1.5, pt: 1.5, pb: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.25,
                py: 1.1,
                borderRadius: '12px',
                bgcolor: alpha(colors.semantic.error, 0.09),
                color: colors.semantic.error,
                border: `1px solid ${alpha(colors.semantic.error, 0.18)}`,
              }}
            >
              <AutoAwesomeOutlinedIcon sx={{ fontSize: 18, color: colors.semantic.error }} />
              <Typography sx={{ fontWeight: 700, color: colors.landing.heroText }}>
                {warningLabel}
              </Typography>
            </Box>
          </Box>
        ) : null}

        {warningLabel ? <Divider sx={{ my: 0.5 }} /> : null}

        {typeof onSwitchChild === 'function' ? (
          <MenuItem onClick={handleSwitchChild} sx={{ gap: 1.25, py: 1.3, px: 1.5, minHeight: 48 }}>
            <ListItemIcon sx={{ minWidth: 34 }}>
              <SwapHorizIcon sx={{ fontSize: 18, color: colors.brand.ink }} />
            </ListItemIcon>
            <ListItemText>Switch Child</ListItemText>
          </MenuItem>
        ) : null}

        <Divider sx={{ my: 0.5 }} />

        <Box sx={{ px: 1.5, pb: 0.75 }}>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: colors.landing.textMuted }}>
            Care Team
          </Typography>
        </Box>

        {canInvite ? (
          <MenuItem
            onClick={handleInviteTeamMember}
            sx={{ gap: 1.25, py: 1.3, px: 1.5, minHeight: 48 }}
          >
            <ListItemIcon sx={{ minWidth: 34 }}>
              <PersonAddAlt1OutlinedIcon sx={{ fontSize: 18, color: colors.landing.borderActive }} />
            </ListItemIcon>
            <ListItemText>Add caregiver</ListItemText>
          </MenuItem>
        ) : null}

        {canStartChat ? (
          <MenuItem onClick={handleStartChat} sx={{ gap: 1.25, py: 1.3, px: 1.5, minHeight: 48 }}>
            <ListItemIcon sx={{ minWidth: 34 }}>
              <ChatBubbleOutlineIcon sx={{ fontSize: 18, color: colors.brand.deep }} />
            </ListItemIcon>
            <ListItemText>Start chat</ListItemText>
          </MenuItem>
        ) : null}

        <Divider sx={{ my: 0.5 }} />

        <Box sx={{ px: 1.5, pb: 0.75 }}>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: colors.landing.textMuted }}>
            Tools
          </Typography>
        </Box>

        <MenuItem onClick={handlePrepForTherapy} sx={{ gap: 1.25, py: 1.3, px: 1.5, minHeight: 48 }}>
          <ListItemIcon sx={{ minWidth: 34 }}>
            <AutoAwesomeOutlinedIcon sx={{ fontSize: 18, color: colors.landing.borderActive }} />
          </ListItemIcon>
          <ListItemText>Prep for therapy</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleImportLogs} sx={{ gap: 1.25, py: 1.3, px: 1.5, minHeight: 48 }}>
          <ListItemIcon sx={{ minWidth: 34 }}>
            <FileUploadOutlinedIcon sx={{ fontSize: 18, color: colors.brand.ink }} />
          </ListItemIcon>
          <ListItemText>Import .xlsx or .docx</ListItemText>
        </MenuItem>

        {canEdit && (
          <MenuItem onClick={handleEditChild} sx={{ gap: 1.25, py: 1.3, px: 1.5, minHeight: 48 }}>
            <ListItemIcon sx={{ minWidth: 34 }}>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit Child Profile</ListItemText>
          </MenuItem>
        )}

        {canDelete ? (
          <MenuItem
            onClick={handleDeleteChild}
            sx={{ gap: 1.25, py: 1.3, px: 1.5, minHeight: 48, color: 'error.main' }}
          >
            <ListItemIcon sx={{ minWidth: 34 }}>
              <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
            </ListItemIcon>
            <ListItemText>Delete Child Profile</ListItemText>
          </MenuItem>
        ) : null}
      </Menu>
    </>
  );
};

export default ChildManagementMenu;
