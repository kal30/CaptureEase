import React from 'react';
import {
  Box,
  Divider,
  ListItemIcon,
  MenuItem,
  Typography,
} from '@mui/material';
import {
  EditOutlined as EditOutlinedIcon,
  DeleteOutline as DeleteOutlineIcon,
  SwapHoriz as SwapHorizIcon,
  AutoAwesomeOutlined as AutoAwesomeOutlinedIcon,
  FileUploadOutlined as FileUploadOutlinedIcon,
  GroupsOutlined as GroupsOutlinedIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  PersonAddAlt1Outlined as PersonAddIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { USER_ROLES } from '../../../constants/roles';
import colors from '../../../assets/theme/colors';

const getWarningLabel = (child) => {
  const childWarning = child?.medicalProfile?.foodAllergies?.find(Boolean) || child?.medicalProfile?.currentMedications?.find(Boolean);

  if (!childWarning) {
    return null;
  }

  if (typeof childWarning === 'string') {
    return String(childWarning).toLowerCase().includes('nut')
      ? 'Nut Allergy'
      : `${childWarning} Allergy`;
  }

  return childWarning?.name || childWarning?.medication || childWarning?.title || null;
};

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
    sx={{ gap: 1.25, py: 1.25, px: 1.5, minHeight: 48, color }}
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
  careTeamCount = 0,
  onEditChild,
  onInviteTeamMember,
  onGoToCareTeam,
  onDeleteChild,
  onSwitchChild,
  onPrepForTherapy,
  onImportLogs,
  onStartChat,
  onAddChild,
  showWarning = true,
  showSwitchChild = true,
  showAddChild = true,
}) => {
  const warningLabel = showWarning ? getWarningLabel(child) : null;
  const canInvite = userRole === USER_ROLES.CARE_OWNER && typeof onInviteTeamMember === 'function';
  const canGoToCareTeam = typeof onGoToCareTeam === 'function';
  const canEdit = typeof onEditChild === 'function';
  const canDelete = typeof onDeleteChild === 'function';
  const canStartChat = typeof onStartChat === 'function' && careTeamCount > 1;
  const canSwitch = typeof onSwitchChild === 'function' && showSwitchChild;

  return (
    <>
      {warningLabel ? (
        <>
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
          <Divider sx={{ my: 0.5 }} />
        </>
      ) : null}

      {showAddChild && typeof onAddChild === 'function' ? (
        <ActionItem
          icon={<PersonAddIcon />}
          onClick={onAddChild}
        >
          Add child
        </ActionItem>
      ) : null}

      {canSwitch ? (
        <ActionItem
          icon={<SwapHorizIcon />}
          onClick={onSwitchChild}
        >
          Switch Child
        </ActionItem>
      ) : null}

      <Box sx={{ px: 1.5, pb: 0.75, pt: 1 }}>
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: colors.landing.textMuted }}>
          Care Team
        </Typography>
      </Box>

      {canInvite ? (
        <ActionItem
          icon={<GroupsOutlinedIcon />}
          onClick={() => onInviteTeamMember?.(child?.id)}
          iconColor={colors.brand.ink}
        >
          Add careteam
        </ActionItem>
      ) : null}

      {canGoToCareTeam ? (
        <ActionItem
          icon={<GroupsOutlinedIcon />}
          onClick={() => onGoToCareTeam?.(child)}
          iconColor={colors.brand.deep}
        >
          View care team
        </ActionItem>
      ) : null}

      {canStartChat ? (
        <ActionItem
          icon={<ChatBubbleOutlineIcon />}
          onClick={() => onStartChat?.(child)}
          iconColor={colors.brand.deep}
        >
          Start chat
        </ActionItem>
      ) : null}

      <Divider sx={{ my: 0.5 }} />

      <Box sx={{ px: 1.5, pb: 0.75, pt: 1 }}>
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: colors.landing.textMuted }}>
          Tools
        </Typography>
      </Box>

      <ActionItem
        icon={<AutoAwesomeOutlinedIcon />}
        onClick={() => onPrepForTherapy?.(child)}
        iconColor={colors.brand.ink}
      >
        Prep for therapy
      </ActionItem>

      <ActionItem
        icon={<FileUploadOutlinedIcon />}
        onClick={() => onImportLogs?.(child)}
        iconColor={colors.brand.deep}
      >
        Import .xlsx or .docx
      </ActionItem>

      {canEdit ? (
        <ActionItem
          icon={<EditOutlinedIcon />}
          onClick={() => onEditChild?.(child)}
          iconColor={colors.brand.ink}
        >
          Edit Child Profile
        </ActionItem>
      ) : null}

      {canDelete ? (
        <ActionItem
          icon={<DeleteOutlineIcon />}
          onClick={() => onDeleteChild?.(child)}
          color="error.main"
          iconColor="error.main"
        >
          Delete Child Profile
        </ActionItem>
      ) : null}
    </>
  );
};

export default ChildActionsMenuContent;
