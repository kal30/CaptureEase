import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Divider,
  ListItemIcon,
  MenuItem,
  Typography,
} from '@mui/material';
import {
  EditOutlined as EditOutlinedIcon,
  SettingsOutlined as SettingsOutlinedIcon,
  FileUploadOutlined as FileUploadOutlinedIcon,
  GroupsOutlined as GroupsOutlinedIcon,
  WcOutlined as WcOutlinedIcon,
  ShareOutlined as ShareOutlinedIcon,
  PersonAddAlt1Outlined as PersonAddIcon,
} from '@mui/icons-material';
import { USER_ROLES } from '../../../constants/roles';
import colors from '../../../assets/theme/colors';

const SectionLabel = ({ children }) => (
  <Box sx={{ px: 1.5, pb: 0.75, pt: 1 }}>
    <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: colors.landing.textMuted }}>
      {children}
    </Typography>
  </Box>
);

const ActionItem = ({ icon, children, onClick, color = colors.landing.heroText, iconColor, ...props }) => (
  <MenuItem
    onClick={onClick}
    sx={{
      gap: 1.1,
      py: 1.15,
      px: 1.5,
      minHeight: 48,
      color,
      borderRadius: 0,
    }}
    {...props}
  >
    <ListItemIcon sx={{ minWidth: 34 }}>
      {React.cloneElement(icon, { sx: { fontSize: 18, color: iconColor || colors.brand.ink } })}
    </ListItemIcon>
    {children}
  </MenuItem>
);

const ChildActionsMenuContent = ({
  child,
  userRole,
  onEditChild,
  onInviteTeamMember,
  onGoToCareTeam,
  onPrepForTherapy,
  onImportLogs,
  onOpenBathroomLog,
}) => {
  const canInvite = userRole === USER_ROLES.CARE_OWNER && typeof onInviteTeamMember === 'function';
  const canGoToCareTeam = typeof onGoToCareTeam === 'function';
  const canEdit = typeof onEditChild === 'function';
  const canOpenBathroomLog = typeof onOpenBathroomLog === 'function';
  const navigate = useNavigate();

  return (
    <>
      <SectionLabel>Navigation</SectionLabel>

      <ActionItem
        icon={<WcOutlinedIcon />}
        onClick={() => {
          if (canOpenBathroomLog) {
            onOpenBathroomLog?.(child);
            return;
          }
          alert('Toilet logging coming soon');
        }}
        iconColor={colors.brand.ink}
      >
        Toilet
      </ActionItem>

      <Divider sx={{ my: 0.5 }} />

      <SectionLabel>Team</SectionLabel>

      {canInvite ? (
        <ActionItem
          icon={<PersonAddIcon />}
          onClick={() => onInviteTeamMember?.(child?.id)}
          iconColor={colors.brand.ink}
        >
          Invite Team Member
        </ActionItem>
      ) : null}

      {canGoToCareTeam ? (
        <ActionItem
          icon={<GroupsOutlinedIcon />}
          onClick={() => onGoToCareTeam?.(child)}
          iconColor={colors.brand.deep}
        >
          Manage Team
        </ActionItem>
      ) : null}

      <Divider sx={{ my: 0.5 }} />

      <SectionLabel>Sharing</SectionLabel>

      <ActionItem
        icon={<ShareOutlinedIcon />}
        onClick={() => onPrepForTherapy?.(child)}
        iconColor={colors.brand.ink}
      >
        Share with Therapist
      </ActionItem>

      <Divider sx={{ my: 0.5 }} />

      <SectionLabel>Account</SectionLabel>

      {canEdit ? (
        <ActionItem
          icon={<EditOutlinedIcon />}
          onClick={() => onEditChild?.(child)}
          iconColor={colors.brand.ink}
        >
          Edit Child Info
        </ActionItem>
      ) : null}

      <ActionItem
        icon={<FileUploadOutlinedIcon />}
        onClick={() => onImportLogs?.(child)}
        iconColor={colors.brand.deep}
      >
        Import Past Data
      </ActionItem>

      <ActionItem
        icon={<SettingsOutlinedIcon />}
        onClick={() => {
          navigate('/profile');
        }}
        iconColor={colors.brand.ink}
      >
        Settings
      </ActionItem>
    </>
  );
};

export default ChildActionsMenuContent;
