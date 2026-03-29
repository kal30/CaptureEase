import React, { useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Fade,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
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
  const accent = getChildAccent(child?.id);
  const otherChildren = useMemo(
    () => children.filter((item) => item.id !== child?.id),
    [children, child?.id]
  );

  if (!child) {
    return null;
  }

  return (
    <Fade in={true} timeout={220}>
      <Box sx={{ px: 1.5, pb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            mb: 2,
            pt: 1,
            px: 1,
            py: 1,
            borderRadius: 3,
            border: '1px solid',
            borderColor: accent.border,
            backgroundColor: accent.surface,
          }}
        >
          {onBack ? (
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={onBack}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                color: accent.text,
                minWidth: 'auto',
                px: 0.5,
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
              px: 1,
              py: 0.75,
              borderRadius: 2,
              minWidth: 0,
            }}
          >
            <Avatar
              src={child.profilePhoto}
              alt={child.name}
              sx={{
                width: 34,
                height: 34,
                fontSize: '1rem',
                fontWeight: 700,
                bgcolor: accent.strong,
                boxShadow: `0 0 0 3px ${accent.border}`,
              }}
            >
              {!child.profilePhoto && child.name?.[0]?.toUpperCase()}
            </Avatar>
            <Box sx={{ textAlign: 'left' }}>
              <Typography sx={{ fontSize: '0.73rem', lineHeight: 1.1, color: accent.text }}>
                Viewing profile
              </Typography>
              <Typography sx={{ fontSize: '0.98rem', fontWeight: 800, lineHeight: 1.15 }}>
                {child.name}
              </Typography>
            </Box>
            {otherChildren.length > 0 || onAddChildClick ? <KeyboardArrowDownIcon /> : null}
          </Button>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
          <Chip
            label="All logging on this screen stays with this child"
            size="small"
            sx={{
              height: 24,
              borderRadius: 1.5,
              fontSize: '0.72rem',
              fontWeight: 700,
              color: accent.text,
              backgroundColor: accent.surface,
              border: `1px solid ${accent.border}`,
            }}
          />
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
        />

        <Menu
          anchorEl={switcherAnchor}
          open={Boolean(switcherAnchor)}
          onClose={() => setSwitcherAnchor(null)}
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
    </Fade>
  );
};

export default ChildDashboard;
