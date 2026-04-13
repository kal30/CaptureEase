import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Paper,
  Popover,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import {
  CalendarToday as CalendarTodayIcon,
  NoteAltOutlined as NoteAltOutlinedIcon,
  MenuOutlined as MenuOutlinedIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useDashboardView } from './shared/DashboardViewContext';
import { ChildSwitcherPanel, ChildSwitcherTrigger } from './shared/ChildSwitcher';
import ChildActionsMenuContent from './shared/ChildActionsMenuContent';
import { getAllQuickTagOptions, loadCustomQuickTags } from '../../utils/quickTags';
import { getCalendarDateKey } from '../../utils/calendarDateKey';
import { getRoleDisplay } from '../../constants/roles';
import { CORE_ENTRY_ACTIONS } from '../../constants/logTypeRegistry';
import TimelineFilters from '../Timeline/TimelineFilters';
import TimelineHeaderControls from '../Timeline/TimelineHeaderControls';
import { getActiveTimelineFilterCount } from '../Timeline/utils/filterCounts';
import UnifiedTimeline from '../Timeline/UnifiedTimeline';
import MiniCalendar from '../UI/MiniCalendar';
import colors from '../../assets/theme/colors';
import { getE2EMockData, isE2EMockEnabled } from '../../services/e2eMock';
import { getChildProfileCompletion } from '../../utils/profileCompletion';
import { ACTIVE_TIMELINE_DATE_STORAGE_KEY } from './shared/DashboardViewContext';

const formatStreakLabel = (streak = 0) => {
  if (!streak || streak < 1) {
    return '';
  }

  return `🔥 ${streak}-Day Streak`;
};

const DesktopDashboardWorkspace = ({
  hook,
  onQuickEntry,
  onOpenSleepLog,
  onOpenFoodLog,
  onOpenBathroomLog,
  onImportLogs,
  onGoToCareTeam,
}) => {
  const { activeChildId, setActiveChildId } = useDashboardView();
  const [customQuickTags, setCustomQuickTags] = useState([]);
  const [timelineFilters, setTimelineFilters] = useState({});
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [childMenuAnchor, setChildMenuAnchor] = useState(null);
  const [desktopMenuAnchor, setDesktopMenuAnchor] = useState(null);
  const [desktopTimelineFilterAnchor, setDesktopTimelineFilterAnchor] = useState(null);
  const showLeftSidebar = useMediaQuery('(min-width:1200px)');
  const showRightSidebar = useMediaQuery('(min-width:1024px)');
  const activeChild = useMemo(
    () => hook.children.find((child) => child.id === activeChildId) || hook.children[0] || null,
    [activeChildId, hook.children]
  );
  const activeChildSummary = useMemo(
    () => hook.timelineSummary?.[activeChild?.id] || hook.timelineSummary || {},
    [activeChild?.id, hook.timelineSummary]
  );
  const dashboardRoleLabel = useMemo(() => {
    const role = hook.getUserRoleForChild?.(activeChild?.id);
    const label = getRoleDisplay(role)?.label || '';
    return label.replace(/^[^\w]+/, '').trim();
  }, [activeChild?.id, hook.getUserRoleForChild]);

  const activeChildEntries = useMemo(
    () => hook.allEntries?.[activeChild?.id] || [],
    [activeChild?.id, hook.allEntries]
  );
  const activeChildProfileCompletion = useMemo(
    () => getChildProfileCompletion(activeChild || {}),
    [activeChild]
  );

  const activityStreakLabel = formatStreakLabel(activeChildSummary.activityStreak || 0);
  const quickTagOptions = useMemo(() => getAllQuickTagOptions(customQuickTags), [customQuickTags]);
  const desktopTimelineFilterCount = getActiveTimelineFilterCount(timelineFilters, selectedDate);

  useEffect(() => {
    if (isE2EMockEnabled()) {
      setCustomQuickTags(loadCustomQuickTags(getE2EMockData().authUser?.uid));
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCustomQuickTags(loadCustomQuickTags(user?.uid));
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setTimelineFilters({});
    setSelectedDate(new Date());
  }, [activeChild?.id]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const selectedDateKey = getCalendarDateKey(selectedDate);
    if (selectedDateKey) {
      window.localStorage.setItem(ACTIVE_TIMELINE_DATE_STORAGE_KEY, selectedDateKey);
      window.dispatchEvent(new CustomEvent('captureez:timeline-date-changed', {
        detail: { dateKey: selectedDateKey },
      }));
    }
  }, [selectedDate]);

  const handleQuickAction = (actionKey) => {
    if (!activeChild) return;

    switch (actionKey) {
      case 'meds':
        hook.handleTrack?.(activeChild, 'medication');
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
    onQuickEntry?.(activeChild, 'quick_note', undefined, selectedDate);
  };

  const handleDesktopChildMenuOpen = (event) => {
    setChildMenuAnchor(event.currentTarget);
  };

  const handleDesktopChildMenuClose = () => {
    setChildMenuAnchor(null);
  };

  const handleDesktopMenuOpen = (event) => {
    setDesktopMenuAnchor(event.currentTarget);
  };

  const handleDesktopMenuClose = () => {
    setDesktopMenuAnchor(null);
  };

  const handleDesktopTimelineFiltersOpen = (event) => {
    setDesktopTimelineFilterAnchor(event.currentTarget);
  };

  const handleDesktopTimelineFiltersClose = () => {
    setDesktopTimelineFilterAnchor(null);
  };

  const handleDesktopChildSelect = (childId) => {
    handleDesktopChildMenuClose();
    setActiveChildId?.(childId);
    window.dispatchEvent(new CustomEvent('captureez:set-active-child', {
      detail: { childId },
    }));
  };

  const handleDesktopAction = (action) => {
    handleDesktopMenuClose();

    const child = activeChild;
    switch (action) {
      case 'add-child':
        hook.setShowAddChildModal?.(true);
        break;
      case 'invite-caregiver':
        if (child) {
          hook.handleInviteTeamMember?.(child.id);
        }
        break;
      case 'start-chat':
        if (child) {
          hook.handleMessages?.(child);
        }
        break;
      case 'prep-for-therapy':
        if (child) {
          hook.handleShowCareReport?.(child);
        }
        break;
      case 'import-logs':
        if (child) {
          onImportLogs?.(child);
        }
        break;
      case 'edit-child':
        if (child) {
          hook.handleEditChild?.(child);
        }
        break;
      case 'delete-child':
        if (child) {
          hook.handleDeleteChild?.(child);
        }
        break;
      default:
        break;
    }
  };

  if (!activeChild) {
    return null;
  }

  const desktopCardShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';

  return (
    <Box
      sx={{
        bgcolor: colors.landing.pageBackground,
        minHeight: '100%',
        px: { xs: 0, lg: 0 },
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 1640, mx: 'auto', px: { xs: 2, xl: 3 }, pb: 4 }}>
        <Paper
          variant="outlined"
          sx={{
            borderRadius: '12px',
            bgcolor: colors.landing.surface,
            borderColor: colors.landing.borderLight,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            px: 2,
            py: 1.25,
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
              <ChildSwitcherTrigger
                child={activeChild}
                roleLabel={dashboardRoleLabel || 'Care Owner'}
                showRole
                avatarSize={36}
                completionPercent={activeChildProfileCompletion < 100 ? activeChildProfileCompletion : null}
                onCompletionClick={() => hook.handleEditChild?.(activeChild)}
                onClick={handleDesktopChildMenuOpen}
              />

              <IconButton
                onClick={handleDesktopMenuOpen}
                data-cy="dashboard-actions-menu"
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  color: colors.landing.textMuted,
                  bgcolor: 'transparent',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: alpha(colors.landing.textMuted, 0.08),
                  },
                }}
              >
                <MenuOutlinedIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>

          </Box>
        </Paper>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: showLeftSidebar
              ? '260px minmax(0, 1fr) 300px'
              : showRightSidebar
                ? 'minmax(0, 1fr) 300px'
                : '1fr',
            gap: { lg: 2.25 },
            alignItems: 'start',
          }}
        >
          {showLeftSidebar ? (
            <Stack
              spacing={2}
              sx={{
                position: 'sticky',
                top: 76,
                alignSelf: 'start',
                minWidth: 0,
              }}
            >
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: '12px',
                  bgcolor: colors.landing.surface,
                  borderColor: colors.landing.borderLight,
                  boxShadow: desktopCardShadow,
                  p: 2,
                }}
              >
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: colors.landing.textMuted, mb: 1.25 }}>
                  Streak
                </Typography>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 1.4,
                    py: 1,
                    borderRadius: '9999px',
                    bgcolor: alpha(colors.landing.cyanPop, 0.16),
                    border: `1px solid ${alpha(colors.landing.cyanPop, 0.4)}`,
                    color: colors.landing.heroText,
                  }}
                >
                  <Typography sx={{ fontSize: '0.9rem', lineHeight: 1 }}>
                    🔥
                  </Typography>
                  <Typography sx={{ fontSize: '0.86rem', fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1 }}>
                    {activityStreakLabel || 'No streak yet'}
                  </Typography>
                </Box>
              </Paper>
            </Stack>
          ) : null}

          <Box sx={{ minWidth: 0, maxWidth: 800, width: '100%', mx: 'auto' }}>
            <Paper
              variant="outlined"
              sx={{
                borderRadius: '12px',
                bgcolor: colors.landing.surface,
                borderColor: colors.landing.borderLight,
                boxShadow: desktopCardShadow,
                p: { xs: 1.5, md: 2 },
                mb: 2,
              }}
            >
              <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.25 }}>
                {CORE_ENTRY_ACTIONS.map((action) => (
                  <Button
                    key={action.key}
                    onClick={() => handleQuickAction(action.key)}
                    variant="outlined"
                    sx={{
                      minHeight: 36,
                      px: 1.5,
                      borderRadius: '12px',
                      whiteSpace: 'nowrap',
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      color: colors.landing.heroText,
                      borderColor: action.color,
                      bgcolor: alpha(action.color, 0.06),
                      boxShadow: 'none',
                      display: 'inline-flex',
                      gap: 0.75,
                      '&:hover': {
                        bgcolor: alpha(action.color, 0.12),
                        borderColor: action.color,
                        boxShadow: 'none',
                      },
                    }}
                  >
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6 }}>
                      <span style={{ lineHeight: 1, color: action.color }}>{action.icon}</span>
                      <span>{action.label}</span>
                    </Box>
                  </Button>
                ))}
              </Stack>

              <Button
                onClick={handleQuickNote}
                data-cy="dashboard-quick-note"
                startIcon={<NoteAltOutlinedIcon sx={{ fontSize: 18 }} />}
                variant="outlined"
                sx={{
                  mt: 1.5,
                  width: '100%',
                  minHeight: 40,
                  px: 2,
                  borderRadius: '12px',
                  borderColor: colors.landing.borderLight,
                  bgcolor: colors.landing.surface,
                  color: colors.landing.heroText,
                  textTransform: 'none',
                  fontWeight: 700,
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: colors.landing.sageLight,
                    borderColor: colors.landing.borderMedium,
                    boxShadow: 'none',
                  },
                }}
              >
                Quick Note (Auto-classified)
              </Button>
            </Paper>

            <Paper
              variant="outlined"
              sx={{
                borderRadius: '12px',
                bgcolor: colors.landing.surface,
                borderColor: colors.landing.borderLight,
                boxShadow: desktopCardShadow,
                p: { xs: 1.5, md: 2 },
              }}
            >
              <TimelineHeaderControls
                filters={timelineFilters}
                onFiltersChange={setTimelineFilters}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                streakLabel={activityStreakLabel}
                activeFiltersCount={desktopTimelineFilterCount}
                calendarEntries={activeChildEntries}
                mobileLayout={false}
                onOpenAdvancedFilters={handleDesktopTimelineFiltersOpen}
                sx={{ mb: 1.5 }}
              />

              <UnifiedTimeline
                child={activeChild}
                selectedDate={selectedDate}
                filters={timelineFilters}
                onFiltersChange={setTimelineFilters}
                showFilters={false}
                showDaySummary
                streakLabel={activityStreakLabel}
                calendarEntries={activeChildEntries}
              />
            </Paper>
          </Box>

          {showRightSidebar ? (
            <Stack
              spacing={2}
              sx={{
                position: 'sticky',
                top: 76,
                alignSelf: 'start',
              }}
            >
            <Paper
              variant="outlined"
              sx={{
                borderRadius: '12px',
                bgcolor: colors.landing.surface,
                borderColor: colors.landing.borderLight,
                boxShadow: desktopCardShadow,
                p: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <CalendarTodayIcon sx={{ fontSize: 18, color: colors.brand.ink }} />
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: colors.landing.textMuted }}>
                  Mini-Calendar
                </Typography>
              </Box>
              <MiniCalendar
                entries={activeChildEntries}
                currentMonth={selectedDate}
                selectedDate={selectedDate}
                onDayClick={(day, dayEntries, date) => setSelectedDate(date)}
              />
            </Paper>

            </Stack>
          ) : null}
        </Box>
      </Box>

      <Menu
        anchorEl={childMenuAnchor}
        open={Boolean(childMenuAnchor)}
        onClose={handleDesktopChildMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 280,
            maxHeight: '80vh',
            borderRadius: '18px',
            border: `1px solid ${colors.landing.borderLight}`,
            boxShadow: `0 24px 60px ${colors.landing.shadowPanel}`,
            bgcolor: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(16px)',
            overflowY: 'auto',
            overflowX: 'hidden',
          },
          }}
        >
        <Box sx={{ px: 1.5, py: 1.25 }}>
          <ChildSwitcherPanel
            children={hook.children}
            activeChildId={activeChildId}
            getUserRoleForChild={hook.getUserRoleForChild}
            onSelectChild={handleDesktopChildSelect}
            showCareTeamSummary={false}
            onAddChild={() => hook.setShowAddChildModal?.(true)}
            showAddChild={Boolean(hook.setShowAddChildModal)}
            activeChild={activeChild}
          />
        </Box>
      </Menu>

      <Menu
        anchorEl={desktopMenuAnchor}
        open={Boolean(desktopMenuAnchor)}
        onClose={handleDesktopMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 280,
            borderRadius: '18px',
            border: `1px solid ${colors.landing.borderLight}`,
            boxShadow: `0 24px 60px ${colors.landing.shadowPanel}`,
            bgcolor: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(16px)',
            overflow: 'hidden',
          },
        }}
        >
        <Box sx={{ px: 0.5 }}>
          <ChildActionsMenuContent
            child={activeChild}
            userRole={hook.getUserRoleForChild?.(activeChild?.id)}
            careTeamCount={(activeChild?.users?.members || []).length}
            onAddChild={() => handleDesktopAction('add-child')}
            onGoToCareTeam={(child) => onGoToCareTeam?.(child)}
            onEditChild={() => handleDesktopAction('edit-child')}
            onInviteTeamMember={() => handleDesktopAction('invite-caregiver')}
            onDeleteChild={() => handleDesktopAction('delete-child')}
            onPrepForTherapy={() => handleDesktopAction('prep-for-therapy')}
            onImportLogs={() => handleDesktopAction('import-logs')}
            onStartChat={() => handleDesktopAction('start-chat')}
            showWarning
            showSwitchChild={false}
            showAddChild
          />
        </Box>
      </Menu>

      <Popover
        open={Boolean(desktopTimelineFilterAnchor)}
        anchorEl={desktopTimelineFilterAnchor}
        onClose={handleDesktopTimelineFiltersClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: '18px',
            border: `1px solid ${colors.landing.borderLight}`,
            boxShadow: `0 24px 60px ${colors.landing.shadowPanel}`,
            bgcolor: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(16px)',
            overflow: 'hidden',
            minWidth: 360,
            maxWidth: '90vw',
          },
        }}
      >
        <Box sx={{ p: 1 }}>
          <TimelineFilters
            compact={false}
            filters={timelineFilters}
            onFiltersChange={setTimelineFilters}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            calendarEntries={activeChildEntries}
            availableTags={quickTagOptions}
          />
        </Box>
      </Popover>
    </Box>
  );
};

export default DesktopDashboardWorkspace;
