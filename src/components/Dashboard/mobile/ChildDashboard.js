import React, { useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
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
  );
};

export default ChildDashboard;
