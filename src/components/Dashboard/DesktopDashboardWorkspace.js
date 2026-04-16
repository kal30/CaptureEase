import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  IconButton,
  Menu,
  Paper,
  Popover,
} from '@mui/material';
import {
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
import TimelineFilters from '../Timeline/TimelineFilters';
import TimelineHeaderControls from '../Timeline/TimelineHeaderControls';
import { getActiveTimelineFilterCount } from '../Timeline/utils/filterCounts';
import UnifiedTimeline from '../Timeline/UnifiedTimeline';
import colors from '../../assets/theme/colors';
import DashboardActionBoard from './DashboardActionBoard';
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
  onOpenMedicalLog,
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
  const activeChild = useMemo(
    () => hook.children.find((child) => child.id === activeChildId) || hook.children[0] || null,
    [activeChildId, hook.children]
  );
  const activeChildSummary = useMemo(
    () => hook.timelineSummary?.[activeChild?.id] || hook.timelineSummary || {},
    [activeChild?.id, hook.timelineSummary]
  );
  const getUserRoleForChild = hook.getUserRoleForChild;
  const dashboardRoleLabel = useMemo(() => {
    const role = getUserRoleForChild?.(activeChild?.id);
    const label = getRoleDisplay(role)?.label || '';
    return label.replace(/^[^\w]+/, '').trim();
  }, [activeChild?.id, getUserRoleForChild]);

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

        <Box sx={{ maxWidth: 920, mx: 'auto', width: '100%' }}>
          <DashboardActionBoard
            child={activeChild}
            onTrack={hook.handleTrack}
            onOpenMedicalLog={onOpenMedicalLog}
            onOpenSleepLog={onOpenSleepLog}
            onOpenFoodLog={onOpenFoodLog}
            onOpenBathroomLog={onOpenBathroomLog}
            onQuickEntry={onQuickEntry}
            sx={{ mb: 2.25 }}
          />

          <Paper
            variant="outlined"
            sx={{
              borderRadius: '24px',
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
