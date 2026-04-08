import React, { useMemo, useRef, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Divider,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Add as AddIcon,
  Assignment as ReportsIcon,
  CalendarToday as TimelineIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  NoteAltOutlined as NoteAltOutlinedIcon,
  BuildOutlined as BuildOutlinedIcon,
} from '@mui/icons-material';
import { useDashboardView } from './shared/DashboardViewContext';
import ChildManagementMenu from './ChildManagementMenu';
import TimelineFilters from '../Timeline/TimelineFilters';
import UnifiedTimeline from '../Timeline/UnifiedTimeline';
import { getLogTypeByEntry } from '../../constants/logTypeRegistry';
import colors from '../../assets/theme/colors';

const quickActions = [
  {
    key: 'meds',
    label: 'Meds',
    emoji: '💊',
    color: colors.brand.ink,
    border: colors.brand.ink,
    surface: colors.landing.tealLight,
  },
  {
    key: 'sleep',
    label: 'Sleep',
    emoji: '😴',
    color: colors.brand.deep,
    border: colors.brand.deep,
    surface: colors.landing.panelSoft,
  },
  {
    key: 'food',
    label: 'Food',
    emoji: '🍽️',
    color: colors.semantic.warning,
    border: colors.semantic.warning,
    surface: alpha(colors.semantic.warning, 0.08),
  },
  {
    key: 'toilet',
    label: 'Toilet',
    emoji: '🚽',
    color: colors.semantic.success,
    border: colors.semantic.success,
    surface: alpha(colors.semantic.success, 0.08),
  },
];

const toDayStart = (value) => {
  const date = value?.toDate?.() || new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const DesktopDashboardWorkspace = ({
  hook,
  onQuickEntry,
  onDailyReport,
  onOpenSleepLog,
  onOpenFoodLog,
  onOpenBathroomLog,
  onOpenMedicalLog,
  onAddChildClick,
}) => {
  const { activeChildId, setActiveChildId } = useDashboardView();
  const mainRef = useRef(null);
  const [filters, setFilters] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [switchAnchor, setSwitchAnchor] = useState(null);

  const activeChild = hook.children.find((child) => child.id === activeChildId) || hook.children[0] || null;
  const activeRole = activeChild ? hook.getUserRoleForChild?.(activeChild.id) : null;
  const canAddData = activeChild ? (hook.canAddDataForChild?.(activeChild.id) ?? false) : false;

  const todaySummary = useMemo(() => {
    const entries = hook.allEntries?.[activeChild?.id] || [];
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const counts = {
      meds: 0,
      meals: 0,
      sleep: 0,
      toilet: 0,
    };

    entries.forEach((entry) => {
      const entryStart = toDayStart(entry.timestamp);
      if (!entryStart || entryStart < todayStart) {
        return;
      }

      const meta = getLogTypeByEntry(entry);
      const category = meta?.category || entry.category || entry.type || '';

      if (category === 'medication') counts.meds += 1;
      else if (category === 'food') counts.meals += 1;
      else if (category === 'sleep') counts.sleep += 1;
      else if (category === 'bathroom') counts.toilet += 1;
    });

    return counts;
  }, [activeChild?.id, hook.allEntries]);

  const handleScrollTimeline = () => {
    mainRef.current?.scrollTo?.({ top: 0, behavior: 'smooth' });
  };

  const handleToday = () => {
    setSelectedDate(new Date());
    handleScrollTimeline();
  };

  const handleQuickAction = (actionKey) => {
    if (!activeChild) return;

    switch (actionKey) {
      case 'meds':
        onOpenMedicalLog?.(activeChild);
        break;
      case 'sleep':
        onOpenSleepLog?.(activeChild);
        break;
      case 'food':
        onOpenFoodLog?.(activeChild);
        break;
      case 'toilet':
        onOpenBathroomLog?.(activeChild);
        break;
      default:
        break;
    }
  };

  const handleQuickNote = () => {
    if (!activeChild) return;
    onQuickEntry?.(activeChild, 'quick_note');
  };

  if (!activeChild) {
    return null;
  }

  const otherChildren = hook.children.filter((child) => child.id !== activeChild.id);

  return (
    <Box
      sx={{
        display: 'flex',
        gap: { xs: 0, md: 2.5 },
        alignItems: 'flex-start',
        minHeight: { xs: 'auto', md: 'calc(100vh - 140px)' },
        width: '100%',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          gap: 2,
          width: 240,
          flex: '0 0 240px',
          position: 'sticky',
          top: 24,
          maxHeight: 'calc(100vh - 48px)',
          overflowY: 'auto',
          p: 1.5,
          borderRadius: 4,
          border: `1px solid ${colors.landing.borderLight}`,
          bgcolor: colors.landing.sageLight,
          boxShadow: `0 16px 36px ${colors.landing.shadowSoft}`,
        }}
      >
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${colors.brand.deep} 0%, ${colors.brand.ink} 100%)`,
            color: colors.landing.surface,
          }}
        >
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.85 }}>
            Child
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mt: 1 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.1 }}>
                {activeChild.name}
              </Typography>
              <Typography sx={{ fontSize: '0.82rem', mt: 0.4, opacity: 0.88 }}>
                Active dashboard
              </Typography>
            </Box>

            <Avatar
              src={activeChild.profilePhoto}
              alt={activeChild.name}
              sx={{
                width: 48,
                height: 48,
                bgcolor: alpha(colors.landing.surface, 0.2),
                color: colors.landing.surface,
                fontWeight: 800,
                border: `1px solid ${alpha(colors.landing.surface, 0.3)}`,
              }}
            >
              {!activeChild.profilePhoto && activeChild.name?.[0]?.toUpperCase()}
            </Avatar>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mt: 1.5 }}>
            <Button
              size="small"
              variant="outlined"
              endIcon={<KeyboardArrowDownIcon />}
              onClick={(event) => setSwitchAnchor(event.currentTarget)}
              sx={{
                minHeight: 34,
                px: 1.25,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                color: colors.landing.surface,
                borderColor: alpha(colors.landing.surface, 0.55),
                '&:hover': {
                  borderColor: colors.landing.surface,
                  bgcolor: alpha(colors.landing.surface, 0.08),
                },
              }}
            >
              Switch Child
            </Button>

            {activeChild ? (
              <ChildManagementMenu
                child={activeChild}
                userRole={activeRole}
                canAddData={canAddData}
                onEditChild={hook.handleEditChild}
                onInviteTeamMember={hook.handleInviteTeamMember}
                onDeleteChild={hook.handleDeleteChild}
              />
            ) : null}
          </Box>
        </Box>

        <Box
          sx={{
            p: 1.5,
            borderRadius: 3,
            bgcolor: colors.landing.surface,
            border: `1px solid ${colors.landing.borderLight}`,
            boxShadow: `0 10px 24px ${colors.landing.shadowSoft}`,
          }}
        >
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: colors.landing.textMuted, mb: 1 }}>
            Quick Log
          </Typography>

          <Stack spacing={1}>
            {quickActions.map((action) => (
              <Button
                key={action.key}
                fullWidth
                variant="outlined"
                onClick={() => handleQuickAction(action.key)}
                startIcon={<Box component="span" sx={{ fontSize: '1rem', lineHeight: 1 }}>{action.emoji}</Box>}
                sx={{
                  minHeight: 48,
                  px: 1.5,
                  justifyContent: 'flex-start',
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontWeight: 800,
                  color: colors.landing.heroText,
                  borderColor: action.border,
                  bgcolor: action.surface,
                  '&:hover': {
                    borderColor: action.border,
                    bgcolor: alpha(action.surface, 0.95),
                  },
                }}
              >
                {action.label}
              </Button>
            ))}

            <Button
              fullWidth
              variant="outlined"
              onClick={handleQuickNote}
              startIcon={<NoteAltOutlinedIcon sx={{ fontSize: 18 }} />}
              sx={{
                minHeight: 48,
                px: 1.5,
                justifyContent: 'flex-start',
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 800,
                color: colors.landing.heroText,
                borderColor: colors.brand.tint,
                bgcolor: colors.landing.panelSoft,
                '&:hover': {
                  borderColor: colors.brand.deep,
                  bgcolor: colors.landing.surface,
                },
              }}
            >
              Quick Note (auto-classified)
            </Button>
          </Stack>
        </Box>

        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            borderRadius: 3,
            bgcolor: colors.landing.surface,
            borderColor: colors.landing.borderLight,
          }}
        >
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: colors.landing.textMuted, mb: 1 }}>
            Today
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1 }}>
            {[
              { key: 'meds', label: 'meds', value: todaySummary.meds, color: colors.brand.ink },
              { key: 'meals', label: 'meals', value: todaySummary.meals, color: colors.semantic.warning },
              { key: 'sleep', label: 'sleep', value: todaySummary.sleep, color: colors.brand.deep },
            ].map((item) => (
              <Box key={item.key} sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: item.color, lineHeight: 1 }}>
                  {item.value}
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: colors.landing.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        <Box sx={{ pt: 0.5 }}>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: colors.landing.textMuted, mb: 1 }}>
            Navigation
          </Typography>

          <Stack spacing={1}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<TimelineIcon sx={{ fontSize: 18 }} />}
              onClick={handleScrollTimeline}
              sx={{
                minHeight: 44,
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 700,
                color: colors.landing.heroText,
                borderColor: colors.landing.borderLight,
                bgcolor: colors.landing.surface,
              }}
            >
              Timeline
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ReportsIcon sx={{ fontSize: 18 }} />}
              onClick={() => onDailyReport?.(activeChild)}
              sx={{
                minHeight: 44,
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 700,
                color: colors.landing.heroText,
                borderColor: colors.landing.borderLight,
                bgcolor: colors.landing.surface,
              }}
            >
              Reports
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<BuildOutlinedIcon sx={{ fontSize: 18 }} />}
              onClick={() => onOpenMedicalLog?.(activeChild)}
              sx={{
                minHeight: 44,
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 700,
                color: colors.landing.heroText,
                borderColor: colors.landing.borderLight,
                bgcolor: colors.landing.surface,
              }}
            >
              Tools
            </Button>
          </Stack>
        </Box>

        {hook.children.length > 1 ? (
          <Menu
            anchorEl={switchAnchor}
            open={Boolean(switchAnchor)}
            onClose={() => setSwitchAnchor(null)}
            PaperProps={{ sx: { minWidth: 220, borderRadius: 3 } }}
          >
            {otherChildren.map((child) => (
              <MenuItem
                key={child.id}
                selected={child.id === activeChild.id}
                onClick={() => {
                  setActiveChildId(child.id);
                  setSwitchAnchor(null);
                }}
              >
                {child.name}
              </MenuItem>
            ))}
            {onAddChildClick ? (
              <>
                <Divider />
                <MenuItem
                  onClick={() => {
                    setSwitchAnchor(null);
                    onAddChildClick();
                  }}
                >
                  <AddIcon fontSize="small" sx={{ mr: 1 }} />
                  Add Child
                </MenuItem>
              </>
            ) : null}
          </Menu>
        ) : null}
      </Paper>

      <Box
        ref={mainRef}
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          minHeight: { xs: 'auto', md: 'calc(100vh - 140px)' },
          maxHeight: { xs: 'none', md: 'calc(100vh - 140px)' },
          overflowY: { xs: 'visible', md: 'auto' },
          pr: { xs: 0, md: 0.5 },
          pb: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 2.5 },
            borderRadius: 4,
            bgcolor: colors.landing.surface,
            border: `1px solid ${colors.landing.borderLight}`,
            boxShadow: `0 14px 34px ${colors.landing.shadowSoft}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, mb: 1.75 }}>
            <Box>
              <Typography sx={{ fontSize: { xs: '1.4rem', md: '1.75rem' }, fontWeight: 800, letterSpacing: '-0.03em', color: colors.landing.heroText, lineHeight: 1.1 }}>
                Timeline
              </Typography>
              <Typography sx={{ fontSize: '0.92rem', color: colors.landing.bodyText, mt: 0.4 }}>
                Search and review daily logs for {activeChild.name}.
              </Typography>
            </Box>

            <Button
              variant="contained"
              onClick={handleToday}
              sx={{
                borderRadius: 1.5,
                minHeight: 44,
                px: 2,
                textTransform: 'none',
                fontWeight: 800,
                bgcolor: colors.brand.ink,
                color: colors.landing.heroText,
                boxShadow: `0 8px 20px ${colors.landing.shadowHero}`,
                '&:hover': {
                  bgcolor: colors.brand.navy,
                },
              }}
            >
              Today
            </Button>
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <TimelineFilters
              compact
              mobileLayout={false}
              hideDateFilter
              selectedDate={selectedDate}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </Box>

          <UnifiedTimeline
            child={activeChild}
            selectedDate={selectedDate}
            filters={filters}
            onFiltersChange={setFilters}
            showFilters={false}
            showDaySummary
            mobileTimeLayout={false}
          />
        </Paper>
      </Box>
    </Box>
  );
};

export default DesktopDashboardWorkspace;
