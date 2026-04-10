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
  WarningAmberOutlined as WarningAmberOutlinedIcon,
  AutoAwesomeOutlined as AutoAwesomeOutlinedIcon,
  FileUploadOutlined as FileUploadOutlinedIcon,
  GroupsOutlined as GroupsOutlinedIcon,
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
  onEditChild,
  onInviteTeamMember,
  onGoToCareTeam,
  onDeleteChild,
  onPrepForTherapy,
  onImportLogs,
  onAddChild,
  showWarning = true,
}) => {
  const warningLabel = showWarning ? getWarningLabel(child) : null;
  const canInvite = userRole === USER_ROLES.CARE_OWNER && typeof onInviteTeamMember === 'function';
  const canGoToCareTeam = typeof onGoToCareTeam === 'function';
  const canEdit = typeof onEditChild === 'function';
  const canDelete = typeof onDeleteChild === 'function';
  const canAddAnotherPerson = typeof onAddChild === 'function';
  const childName = child?.name || 'This child';
  const teamLabel = `${childName}’s Team`;
  const infoLabel = `Edit ${childName}’s Info`;
  const recordLabel = `Delete ${childName}’s Record`;

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
              <WarningAmberOutlinedIcon sx={{ fontSize: 18, color: colors.semantic.error }} />
              <Typography sx={{ fontWeight: 700, color: colors.landing.heroText }}>
                {warningLabel}
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 0.5 }} />
        </>
      ) : null}

      <Box sx={{ px: 1.5, pb: 0.75, pt: 1 }}>
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: colors.landing.textMuted }}>
          {teamLabel}
        </Typography>
      </Box>

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
          {infoLabel}
        </ActionItem>
      ) : null}

      {canAddAnotherPerson ? (
        <ActionItem
          icon={<PersonAddIcon />}
          onClick={() => onAddChild?.(child)}
          iconColor={colors.brand.deep}
        >
          Add another person
        </ActionItem>
      ) : null}

      {canDelete ? (
        <ActionItem
          icon={<DeleteOutlineIcon />}
          onClick={() => onDeleteChild?.(child)}
          color="error.main"
          iconColor="error.main"
        >
          {recordLabel}
        </ActionItem>
      ) : null}
    </>
  );
};

export default ChildActionsMenuContent;
