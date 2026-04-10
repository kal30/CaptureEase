import React, { useState } from 'react';
import { IconButton, Menu, Box } from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { USER_ROLES } from '../../../constants/roles';
import colors from '../../../assets/theme/colors';
import ChildActionsMenuContent from './ChildActionsMenuContent';

/**
 * ChildManagementMenu - Extracted settings menu component for child management
 * Wrapper trigger + shared action menu content
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
  const canManage = userRole === USER_ROLES.CARE_OWNER || userRole === USER_ROLES.CARE_PARTNER;

  if (!canManage) return null;

  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  };

  const handleMenuClose = () => setMenuAnchor(null);

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
          '&:hover': {
            bgcolor: colors.landing.sageLight,
          },
          transition: 'background-color 0.2s ease, border-color 0.2s ease',
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
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
            },
          },
        }}
      >
        <Box sx={{ px: 0.5 }}>
          <ChildActionsMenuContent
            child={child}
            userRole={userRole}
            careTeamCount={careTeamCount}
            onEditChild={onEditChild}
            onInviteTeamMember={onInviteTeamMember}
            onDeleteChild={onDeleteChild}
            onSwitchChild={onSwitchChild}
            onPrepForTherapy={onPrepForTherapy}
            onImportLogs={onImportLogs}
            onStartChat={onStartChat}
            showWarning
            showSwitchChild={typeof onSwitchChild === 'function'}
            showAddChild={false}
          />
        </Box>
      </Menu>
    </>
  );
};

export default ChildManagementMenu;
