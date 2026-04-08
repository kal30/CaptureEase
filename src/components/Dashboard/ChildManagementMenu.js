import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
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
  userRole,
}) => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  // Care owners can manage everything; care partners can edit basic child info.
  const canManage = userRole === USER_ROLES.CARE_OWNER || userRole === USER_ROLES.CARE_PARTNER;
  const canInvite = userRole === USER_ROLES.CARE_OWNER; // Only Care Owner can invite
  const canEdit = userRole === USER_ROLES.CARE_OWNER || userRole === USER_ROLES.CARE_PARTNER;
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

  const handleDeleteChild = (e) => {
    e.stopPropagation();
    onDeleteChild?.(child);
    handleMenuClose();
  };

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
              minWidth: 200,
              border: `1px solid ${colors.landing.borderLight}`,
              boxShadow: `0 24px 60px ${colors.landing.shadowPanel}`,
              bgcolor: 'rgba(255,255,255,0.98)',
              backdropFilter: 'blur(16px)',
            }
          }
        }}
      >
        {canEdit && (
          <MenuItem onClick={handleEditChild}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit Child Info</ListItemText>
          </MenuItem>
        )}
        
        {canInvite && (
          <MenuItem onClick={handleInviteTeamMember}>
            <ListItemIcon>
              <AddIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Add Care Team</ListItemText>
          </MenuItem>
        )}
        
        {canDelete ? (
          <MenuItem
            onClick={handleDeleteChild}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
            </ListItemIcon>
            <ListItemText>Delete Child</ListItemText>
          </MenuItem>
        ) : null}
      </Menu>
    </>
  );
};

export default ChildManagementMenu;
