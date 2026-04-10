import React from 'react';
import {
  Avatar,
  Box,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  PersonAddAlt1Outlined as PersonAddIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { getRoleDisplay } from '../../../constants/roles';
import colors from '../../../assets/theme/colors';

const stripRolePrefix = (label = '') => String(label || '').replace(/^[^\w]+/, '').trim();

const getRoleLabel = (role) => {
  const label = getRoleDisplay(role)?.label || '';
  return stripRolePrefix(label) || 'Care Owner';
};

const getCareTeamSummary = (members = []) => {
  const names = members
    .map((member) => member?.displayName || member?.name || member?.email || '')
    .filter(Boolean);

  if (!names.length) {
    return 'Care team not loaded yet';
  }

  return `Care team: ${names.slice(0, 2).join(', ')}${names.length > 2 ? ` +${names.length - 2}` : ''}`;
};

export const ChildSwitcherTrigger = ({
  child,
  roleLabel = '',
  showRole = false,
  showBorder = false,
  avatarSize = 36,
  onClick,
  sx = {},
}) => {
  if (!child) {
    return null;
  }

  return (
    <Button
      onClick={onClick}
      data-cy="dashboard-child-switcher"
      sx={{
        minWidth: 0,
        px: showBorder ? 1.2 : 0,
        py: 0,
        minHeight: 40,
        borderRadius: showBorder ? '12px' : 0,
        border: showBorder ? `1px solid ${colors.landing.borderLight}` : 'none',
        bgcolor: showBorder ? colors.landing.surface : 'transparent',
        boxShadow: 'none',
        color: colors.landing.heroText,
        textTransform: 'none',
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 600,
        letterSpacing: '-0.02em',
        '&:hover': {
          bgcolor: showBorder ? colors.landing.surfaceSoft : 'transparent',
          boxShadow: 'none',
        },
        ...sx,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={0.85} sx={{ minWidth: 0 }}>
        <Avatar
          src={child.profilePhoto || child.photoURL || child.avatarUrl || undefined}
          alt={child.name}
          sx={{
            width: avatarSize,
            height: avatarSize,
            border: `1px solid ${colors.landing.borderMedium}`,
            bgcolor: colors.roles.careOwner.primary,
            color: colors.landing.surface,
            fontSize: avatarSize <= 28 ? '0.72rem' : '0.85rem',
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {child.profilePhoto || child.photoURL || child.avatarUrl ? null : child.name?.[0]?.toUpperCase()}
        </Avatar>

        <Stack direction="column" alignItems="flex-start" spacing={0.05} sx={{ minWidth: 0, textAlign: 'left' }}>
          <Typography
            component="span"
            sx={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: showRole ? '0.98rem' : '1rem',
              fontWeight: 700,
              color: colors.landing.heroText,
              letterSpacing: '-0.02em',
              lineHeight: 1.05,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
            }}
          >
            {child.name}
          </Typography>
          {showRole ? (
            <Typography
              component="span"
              sx={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '0.76rem',
                fontWeight: 500,
                color: colors.landing.textMuted,
                letterSpacing: '-0.01em',
                lineHeight: 1.05,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
            >
              Your role: {roleLabel || 'Care Owner'}
            </Typography>
          ) : null}
        </Stack>

        <KeyboardArrowDownIcon sx={{ fontSize: 20, color: colors.landing.textMuted, ml: 0.1, flexShrink: 0 }} />
      </Stack>
    </Button>
  );
};

export const ChildSwitcherPanel = ({
  children = [],
  activeChildId,
  getUserRoleForChild,
  careTeamsByChildId = {},
  onSelectChild,
  onAddChild,
  showCareTeamSummary = false,
  showAddChild = false,
  title = 'Who are we logging for today?',
  subtitle = '',
  addChildLabel = 'Add a new person to track',
  currentLabel = 'Current',
  switchLabel = 'Switch',
}) => {
  const renderRoleLabel = (childId) => getRoleLabel(getUserRoleForChild?.(childId));

  return (
    <Stack spacing={1}>
      <Box sx={{ px: 0.75, pt: 0.25, pb: subtitle ? 0.5 : 0 }}>
        <Typography
          sx={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '0.98rem',
            fontWeight: 700,
            textTransform: 'none',
            letterSpacing: '-0.02em',
            color: colors.landing.heroText,
            lineHeight: 1.15,
          }}
        >
          {title}
        </Typography>
        {subtitle ? (
          <Typography sx={{ mt: 0.8, fontSize: '0.92rem', color: colors.landing.textMuted, lineHeight: 1.45 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>

      <Stack spacing={1}>
        {children.map((child) => {
          const isSelected = child.id === activeChildId;
          const childPhoto = child.profilePhoto || child.photoURL || child.avatarUrl || '';
          const careTeamMembers = careTeamsByChildId[child.id] || [];
          const roleLabel = renderRoleLabel(child.id);

          return (
            <Button
              key={child.id}
              onClick={() => onSelectChild?.(child.id)}
              data-cy="dashboard-child-switch-option"
              fullWidth
              sx={{
                textTransform: 'none',
                alignItems: 'stretch',
                justifyContent: 'flex-start',
                p: 0,
                borderRadius: '16px',
                border: `1px solid ${isSelected ? colors.brand.ink : colors.landing.borderLight}`,
                bgcolor: isSelected ? alpha(colors.brand.ink, 0.06) : colors.landing.surface,
                boxShadow: `0 4px 12px ${colors.landing.shadowSoft}`,
                overflow: 'hidden',
                '&:hover': {
                  bgcolor: isSelected ? alpha(colors.brand.ink, 0.08) : colors.landing.surfaceSoft,
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, width: '100%', p: 1.25 }}>
                <Avatar
                  src={childPhoto}
                  alt={child.name}
                  sx={{
                    width: 40,
                    height: 40,
                    border: `1px solid ${colors.landing.borderMedium}`,
                    bgcolor: colors.roles.careOwner.primary,
                    color: colors.landing.surface,
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {!childPhoto ? child.name?.[0]?.toUpperCase() : null}
                </Avatar>

                <Box sx={{ minWidth: 0, flex: 1, textAlign: 'left' }}>
                  <Typography
                    sx={{
                      fontFamily: "'Outfit', sans-serif",
                      fontWeight: 700,
                      color: colors.landing.heroText,
                      lineHeight: 1.1,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {child.name}
                  </Typography>

                  {showCareTeamSummary ? (
                    <Typography sx={{ mt: 0.35, fontSize: '0.82rem', color: colors.landing.textMuted, lineHeight: 1.35 }}>
                      {getCareTeamSummary(careTeamMembers)}
                    </Typography>
                  ) : null}

                  <Typography
                    sx={{
                      mt: 0.2,
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: isSelected ? colors.brand.deep : colors.landing.textMuted,
                    }}
                  >
                    Your role: {roleLabel}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    flexShrink: 0,
                    px: 1,
                    py: 0.4,
                    borderRadius: '9999px',
                    bgcolor: isSelected ? alpha(colors.brand.ink, 0.12) : colors.landing.sageLight,
                    color: isSelected ? colors.brand.ink : colors.landing.textMuted,
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {isSelected ? currentLabel : switchLabel}
                </Box>
              </Box>
            </Button>
          );
        })}

        {showAddChild && typeof onAddChild === 'function' ? (
          <Button
            onClick={() => onAddChild?.()}
            fullWidth
            startIcon={<PersonAddIcon sx={{ fontSize: 18, color: colors.brand.ink }} />}
            sx={{
              justifyContent: 'flex-start',
              textTransform: 'none',
              p: 1.25,
              borderRadius: '16px',
              border: `1px dashed ${colors.landing.borderMedium}`,
              bgcolor: alpha(colors.brand.ink, 0.06),
              color: colors.landing.heroText,
              fontWeight: 800,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: alpha(colors.brand.ink, 0.09),
                borderColor: colors.brand.ink,
                boxShadow: 'none',
              },
            }}
          >
            {addChildLabel}
          </Button>
        ) : null}
      </Stack>
    </Stack>
  );
};
