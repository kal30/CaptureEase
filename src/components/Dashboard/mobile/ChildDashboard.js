import React, { useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  ClickAwayListener,
  MenuItem,
  Paper,
  Popper,
  Typography,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  AutoAwesomeOutlined as AutoAwesomeOutlinedIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  MedicalServicesOutlined as MedicalServicesOutlinedIcon,
  PeopleAltOutlined as PeopleAltOutlinedIcon,
  WarningAmberRounded as WarningAmberRoundedIcon,
} from '@mui/icons-material';
import TimelineWidget from '../../UI/TimelineWidget';
import CareTeamDisplay from '../../UI/CareTeamDisplay';
import ChildManagementMenu from '../ChildManagementMenu';
import { getChildAccent } from '../shared/childAccent';
import { useRole } from '../../../contexts/RoleContext';
import { trackRenderDebug, useMountDebug } from '../../../utils/renderDebug';

const getAllergyNames = (allergies = []) =>
  allergies
    .map((allergy) => {
      if (typeof allergy === 'string') return allergy;
      return allergy?.name || allergy?.label || '';
    })
    .filter(Boolean);

const getDisplayText = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value.map(getDisplayText).filter(Boolean).join(', ');
  }
  if (typeof value === 'object') {
    return (
      value.label ||
      value.name ||
      value.title ||
      value.value ||
      value.diagnosis ||
      ''
    );
  }
  return '';
};

const getSupportArea = (child) =>
  getDisplayText(child?.diagnosis) ||
  getDisplayText(child?.concerns?.[0]) ||
  getDisplayText(child?.conditions?.[0]) ||
  '';

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
  const { getUserRoleForChild, canAddDataForChild } = useRole();

  useMountDebug('ChildDashboard');
  trackRenderDebug('ChildDashboard', {
    childId: child?.id || 'none',
    switcherOpen: Boolean(switcherAnchor),
    childCount: children.length,
  });

  const accent = getChildAccent(child?.id);
  const otherChildren = useMemo(
    () => children.filter((item) => item.id !== child?.id),
    [children, child?.id]
  );

  if (!child) {
    return null;
  }

  const allergies = getAllergyNames(child.medicalProfile?.foodAllergies);
  const supportArea = getSupportArea(child);
  const hasSupportArea = Boolean(supportArea);
  const streak = timelineSummary[child.id]?.activityStreak || timelineSummary.activityStreak || 0;
  const childEntries = recentEntries[child.id] || [];
  const childIncidents = incidents[child.id] || [];
  const childStatus = quickDataStatus[child.id] || {};
  const userRole = getUserRoleForChild(child.id);
  const canAddData = canAddDataForChild(child.id);
  const switcherWidth = switcherAnchor?.clientWidth || 220;

  return (
    <Box sx={{ px: 1.5, pb: 13 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          mb: 1.1,
          pt: 0.25,
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={(event) => {
            onBack?.();
          }}
          sx={{
            justifyContent: 'flex-start',
            textTransform: 'none',
            minHeight: 40,
            px: 0,
            borderRadius: 0,
            minWidth: 'unset',
            color: accent.strong,
            fontSize: '0.88rem',
            fontWeight: 800,
            '&:hover': {
              backgroundColor: 'transparent',
            },
          }}
        >
          Profiles
        </Button>

        <Button
          startIcon={(
            <Avatar
              src={child.profilePhoto}
              alt={child.name}
              sx={{
                width: 36,
                height: 36,
                bgcolor: accent.strong,
                color: '#fff',
                fontWeight: 800,
                fontSize: '1rem',
              }}
            >
              {!child.profilePhoto && child.name?.[0]?.toUpperCase()}
            </Avatar>
          )}
          endIcon={<KeyboardArrowDownIcon />}
          onClick={(event) => {
            if (otherChildren.length > 0 || onAddChildClick) {
              setSwitcherAnchor(event.currentTarget);
            }
          }}
          sx={{
            minHeight: 44,
            px: 1,
            borderRadius: 0.75,
            border: '1px solid rgba(16, 185, 129, 0.25)',
            backgroundColor: 'rgba(236, 253, 245, 0.85)',
            color: 'text.primary',
            fontSize: '0.84rem',
            fontWeight: 800,
            textTransform: 'none',
            boxShadow: '0 6px 14px rgba(15, 23, 42, 0.04)',
            '& .MuiButton-startIcon': {
              mr: 0.7,
            },
            '& .MuiButton-endIcon': {
              ml: 0.25,
              color: accent.strong,
            },
            '&:hover': {
              backgroundColor: 'rgba(236, 253, 245, 0.95)',
            },
          }}
        >
          {child.name}
        </Button>
      </Box>

      <Box
        sx={{
          p: 1.2,
          borderRadius: 1,
          background: 'linear-gradient(180deg, rgba(240,244,255,0.96) 0%, rgba(233,239,255,0.92) 100%)',
          border: '1px solid rgba(205, 216, 245, 0.72)',
          boxShadow: '0 14px 26px rgba(129, 140, 248, 0.08)',
          mb: 1.2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1 }}>
          <Avatar
            src={child.profilePhoto}
            alt={child.name}
            sx={{
              width: 52,
              height: 52,
              border: '2px solid rgba(255,255,255,0.92)',
              boxShadow: '0 10px 20px rgba(15, 23, 42, 0.08)',
              bgcolor: accent.strong,
              color: '#fff',
              fontSize: '1.05rem',
              fontWeight: 800,
            }}
          >
            {!child.profilePhoto && child.name?.[0]?.toUpperCase()}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.75 }}>
              <Typography
                sx={{
                  fontSize: '1.02rem',
                  fontWeight: 800,
                  color: 'text.primary',
                  minWidth: 0,
                  lineHeight: 1.15,
                }}
              >
                {child.name}
              </Typography>
              {streak > 0 ? (
                <Typography
                  sx={{
                    fontSize: '0.82rem',
                    color: 'text.secondary',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  🔥 {streak} day streak
                </Typography>
              ) : null}
            </Box>
          </Box>

          <ChildManagementMenu
            child={child}
            userRole={userRole}
            canAddData={canAddData}
            onEditChild={onEditChild}
            onDeleteChild={undefined}
            onInviteTeamMember={onInviteTeamMember}
            onDailyReport={onDailyReport}
          />
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, mt: 1 }}>
          <Chip
            icon={<WarningAmberRoundedIcon sx={{ fontSize: 16, color: '#DC2626 !important' }} />}
            label={allergies.length > 0 ? `${allergies.join(', ')} allergy` : 'No allergies listed'}
            sx={{
              height: 32,
              borderRadius: 0.75,
              backgroundColor: 'rgba(255, 246, 235, 0.9)',
              color: '#8C4A07',
              border: '1px solid rgba(245, 158, 11, 0.18)',
              fontWeight: 700,
              '& .MuiChip-label': { px: 1, fontSize: '0.78rem' },
            }}
          />
          {hasSupportArea ? (
            <Chip
              icon={<MedicalServicesOutlinedIcon sx={{ fontSize: 16 }} />}
              label={`Support area: ${supportArea}`}
              sx={{
                height: 32,
                borderRadius: 0.75,
                backgroundColor: 'rgba(245, 243, 255, 0.96)',
                color: '#4338CA',
                border: '1px solid rgba(129, 140, 248, 0.16)',
                fontWeight: 700,
                '& .MuiChip-label': { px: 1, fontSize: '0.78rem' },
              }}
            />
          ) : null}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.65 }}>
          <CareTeamDisplay
            child={child}
            userRole={userRole}
            onInviteTeamMember={onInviteTeamMember}
            maxVisible={1}
            compactMobile={true}
            sx={{ mt: 0, p: 0, minWidth: 0 }}
          />
        </Box>

        <Box
          sx={{
            mt: 1,
            p: 0.95,
            borderRadius: 1,
            backgroundColor: 'rgba(255,255,255,0.82)',
            border: '1px solid rgba(214, 225, 247, 0.88)',
            boxShadow: '0 6px 14px rgba(129, 140, 248, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.9, minWidth: 0 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 2,
                bgcolor: 'rgba(250, 204, 21, 0.14)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                flex: '0 0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AutoAwesomeOutlinedIcon sx={{ fontSize: 16, color: '#B45309' }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: 'text.primary', lineHeight: 1.1 }}>
                Prep for Therapy
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', mt: 0.15, lineHeight: 1.2 }}>
                Review patterns and key moments before your session.
              </Typography>
            </Box>
          </Box>

          <Button
            variant="text"
            onClick={(e) => {
              e.stopPropagation();
              onDailyReport?.(child);
            }}
            sx={{
              minWidth: 'unset',
              minHeight: 'unset',
              borderRadius: 0,
              px: 0.25,
              py: 0.25,
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.82rem',
              color: '#2D6E52',
              background: 'transparent',
              boxShadow: 'none',
              '&:hover': {
                background: 'transparent',
                color: '#23533E',
              },
            }}
          >
            Start
          </Button>
        </Box>
      </Box>

      <TimelineWidget
        child={child}
        entries={childEntries}
        incidents={childIncidents}
        dailyCareStatus={childStatus}
        onQuickEntry={(_child, type, event) => onQuickEntry(child, type, event)}
        defaultExpanded={true}
        expanded={true}
        variant="full"
        showUnifiedLog={true}
        forceMobileLayout={true}
      />

      <Box
        sx={{
          position: 'fixed',
          left: 16,
          right: 16,
          bottom: 18,
          zIndex: 1200,
        }}
      >
        <Button
          fullWidth
          variant="contained"
          onClick={(e) => onQuickEntry(child, 'quick_note', e)}
          sx={{
            minHeight: 56,
            borderRadius: 999,
            textTransform: 'none',
            fontWeight: 800,
            fontSize: '1.04rem',
            color: '#FFFFFF',
            background: 'linear-gradient(135deg, #3D8B68 0%, #2D6E52 100%)',
            boxShadow: '0 16px 34px rgba(45, 110, 82, 0.22)',
            '&:hover': {
              background: 'linear-gradient(135deg, #327555 0%, #23533E 100%)',
            },
          }}
        >
          + Log an entry
        </Button>
      </Box>

      <Popper
        open={Boolean(switcherAnchor)}
        anchorEl={switcherAnchor}
        placement="bottom-end"
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 4],
            },
          },
        ]}
        sx={{ zIndex: 1400 }}
      >
        <ClickAwayListener onClickAway={() => setSwitcherAnchor(null)}>
          <Paper
            elevation={8}
            sx={{
              mt: 0,
              borderRadius: 0.5,
              minWidth: Math.max(switcherWidth, 280),
              maxWidth: 320,
              overflow: 'hidden',
            }}
          >
            {otherChildren.map((option) => (
              <MenuItem
                key={option.id}
                onClick={() => {
                  onSwitchChild(option.id);
                  setSwitcherAnchor(null);
                }}
                sx={{ gap: 1, py: 1.05 }}
              >
                <Avatar
                  src={option.profilePhoto}
                  alt={option.name}
                  sx={{ width: 30, height: 30, fontSize: '0.9rem', bgcolor: getChildAccent(option.id).strong }}
                >
                  {!option.profilePhoto && option.name?.[0]?.toUpperCase()}
                </Avatar>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {option.name}
                </Typography>
              </MenuItem>
            ))}
            {onAddChildClick ? (
              <MenuItem
                onClick={() => {
                  setSwitcherAnchor(null);
                  onAddChildClick();
                }}
                sx={{ gap: 1, py: 1.05 }}
              >
                <Avatar sx={{ width: 30, height: 30, bgcolor: accent.strong }}>
                  <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
                </Avatar>
                <Typography sx={{ fontWeight: 700, fontSize: '0.92rem' }}>Add Child</Typography>
              </MenuItem>
            ) : null}
          </Paper>
        </ClickAwayListener>
      </Popper>
    </Box>
  );
};

export default ChildDashboard;
