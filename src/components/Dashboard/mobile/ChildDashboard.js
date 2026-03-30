import React, { useMemo, useState } from 'react';
import {
  Avatar,
  Backdrop,
  Box,
  Button,
  Fab,
  Menu,
  MenuItem,
  Typography,
  Zoom,
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  AssignmentOutlined as AssignmentOutlinedIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from '@mui/icons-material';
import ChildCard from '../ChildCard';
import { getChildAccent } from '../shared/childAccent';

const ChildDashboard = ({
  child,
  children = [],
  groupType = 'own',
  quickDataStatus = {},
  recentEntries = {},
  timelineSummary = {},
  incidents = {},
  onQuickEntry,
  onEditChild,
  onInviteTeamMember,
  onDailyReport,
  onMessages,
  onBack,
  onSwitchChild,
  onAddChildClick,
}) => {
  const [switcherAnchor, setSwitcherAnchor] = useState(null);
  const [fabOpen, setFabOpen] = useState(false);
  const accent = getChildAccent(child?.id);
  const otherChildren = useMemo(
    () => children.filter((item) => item.id !== child?.id),
    [children, child?.id]
  );

  if (!child) {
    return null;
  }

  const fabActions = [
    {
      key: 'therapy-prep',
      label: 'Therapy Prep',
      icon: <AssignmentOutlinedIcon sx={{ fontSize: 22 }} />,
      color: '#8B5CF6',
      onClick: () => onDailyReport?.(child),
    },
    {
      key: 'quick-note',
      label: 'Quick Note',
      icon: <EditIcon sx={{ fontSize: 22 }} />,
      color: '#1B5E20',
      onClick: () => onQuickEntry(child, 'quick_note'),
    },
  ];

  const handleFabAction = (action) => {
    setFabOpen(false);
    action.onClick();
  };

  return (
    <Box sx={{ px: 1.5, pb: 3 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          mb: 1,
          pt: 0.25,
        }}
      >
        {onBack ? (
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{
              fontWeight: 700,
              color: accent.text,
              textTransform: 'none',
              minWidth: 'auto',
              px: 0.5,
              fontSize: '0.8rem',
            }}
          >
            Profiles
          </Button>
        ) : (
          <Box sx={{ width: 16 }} />
        )}

        <Button
          onClick={(event) => {
            if (otherChildren.length > 0 || onAddChildClick) {
              setSwitcherAnchor(event.currentTarget);
            }
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            textTransform: 'none',
            color: 'text.primary',
            px: 1.1,
            py: 0.6,
            borderRadius: 999,
            minWidth: 0,
            border: '1px solid',
            borderColor: accent.border,
            backgroundColor: accent.surface,
            boxShadow: '0 8px 18px rgba(15, 23, 42, 0.05)',
          }}
        >
          <Avatar
            src={child.profilePhoto}
            alt={child.name}
            sx={{
              width: 28,
              height: 28,
              fontSize: '0.9rem',
              fontWeight: 700,
              bgcolor: accent.strong,
            }}
          >
            {!child.profilePhoto && child.name?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ textAlign: 'left' }}>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, lineHeight: 1.05 }}>
              {child.name}
            </Typography>
          </Box>
          {otherChildren.length > 0 || onAddChildClick ? (
            <KeyboardArrowDownIcon sx={{ fontSize: 18, color: accent.text }} />
          ) : null}
        </Button>
      </Box>

      <ChildCard
        child={child}
        groupType={groupType}
        status={quickDataStatus[child.id] || {}}
        recentEntries={recentEntries[child.id] || []}
        timelineSummary={timelineSummary[child.id] || {}}
        incidents={incidents[child.id] || []}
        isExpanded={true}
        onToggleExpanded={() => {}}
        onQuickEntry={(_child, type, event) => onQuickEntry(child, type, event)}
        onEditChild={onEditChild}
        onInviteTeamMember={onInviteTeamMember}
        onDailyReport={onDailyReport}
        onMessages={onMessages}
        compactIdentityOnMobile={true}
        disableCollapse={true}
        hidePrimaryAction={true}
      />

      <Backdrop
        open={fabOpen}
        onClick={() => setFabOpen(false)}
        sx={{
          zIndex: 1190,
          backgroundColor: 'rgba(7, 12, 25, 0.22)',
        }}
      />

      <Box
        sx={{
          position: 'fixed',
          right: 20,
          bottom: 24,
          zIndex: 1200,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 1.1,
        }}
      >
        {fabActions.map((action, index) => (
          <Zoom
            key={action.key}
            in={fabOpen}
            style={{ transitionDelay: fabOpen ? `${index * 45}ms` : '0ms' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  px: 1.1,
                  py: 0.6,
                  borderRadius: 999,
                  bgcolor: 'rgba(15, 23, 42, 0.84)',
                  color: '#fff',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  lineHeight: 1,
                  boxShadow: '0 8px 18px rgba(15, 23, 42, 0.18)',
                }}
              >
                {action.label}
              </Box>
              <Fab
                size="medium"
                aria-label={action.label}
                onClick={() => handleFabAction(action)}
                sx={{
                  width: 52,
                  height: 52,
                  minHeight: 52,
                  bgcolor: action.color,
                  color: '#FFFFFF',
                  boxShadow: '0 10px 22px rgba(15, 23, 42, 0.2)',
                  '&:hover': {
                    bgcolor: action.color,
                    filter: 'brightness(0.94)',
                  },
                }}
              >
                {action.icon}
              </Fab>
            </Box>
          </Zoom>
        ))}

        <Fab
          aria-label={fabOpen ? `Close actions for ${child.name}` : `Open actions for ${child.name}`}
          onClick={() => setFabOpen((open) => !open)}
          sx={{
            width: 60,
            height: 60,
            minHeight: 60,
            bgcolor: '#1B5E20',
            color: '#FFFFFF',
            boxShadow: '0 12px 24px rgba(27, 94, 32, 0.28)',
            '&:hover': {
              bgcolor: '#154A19',
              boxShadow: '0 14px 28px rgba(27, 94, 32, 0.32)',
            },
          }}
        >
          {fabOpen ? <CloseIcon sx={{ fontSize: 30 }} /> : <AddIcon sx={{ fontSize: 30 }} />}
        </Fab>
      </Box>

      <Menu
        anchorEl={switcherAnchor}
        open={Boolean(switcherAnchor)}
        onClose={() => setSwitcherAnchor(null)}
        disableScrollLock
        keepMounted
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {otherChildren.map((option) => (
          <MenuItem
            key={option.id}
            onClick={() => {
              onSwitchChild(option.id);
              setSwitcherAnchor(null);
            }}
            sx={{ minWidth: 220, gap: 1.25 }}
          >
            <Avatar
              src={option.profilePhoto}
              alt={option.name}
              sx={{ width: 32, height: 32, fontSize: '0.95rem', bgcolor: getChildAccent(option.id).strong }}
            >
              {!option.profilePhoto && option.name?.[0]?.toUpperCase()}
            </Avatar>
            <Typography sx={{ fontWeight: 700 }}>{option.name}</Typography>
          </MenuItem>
        ))}
        {onAddChildClick ? (
          <MenuItem
            onClick={() => {
              setSwitcherAnchor(null);
              onAddChildClick();
            }}
            sx={{ gap: 1.25 }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: accent.strong }}>
              <AddIcon sx={{ fontSize: 18 }} />
            </Avatar>
            <Typography sx={{ fontWeight: 700 }}>Add Child</Typography>
          </MenuItem>
        ) : null}
      </Menu>
    </Box>
  );
};

export default ChildDashboard;
