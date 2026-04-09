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
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import {
  CalendarToday as CalendarTodayIcon,
  NoteAltOutlined as NoteAltOutlinedIcon,
  RestaurantOutlined as RestaurantOutlinedIcon,
  BedtimeOutlined as BedtimeOutlinedIcon,
  MedicationOutlined as MedicationOutlinedIcon,
  GroupsOutlined as GroupsOutlinedIcon,
  PersonAddAlt1Outlined as PersonAddAlt1OutlinedIcon,
  MenuOutlined as MenuOutlinedIcon,
  AutoAwesomeOutlined as AutoAwesomeOutlinedIcon,
  FileUploadOutlined as FileUploadOutlinedIcon,
  EditOutlined as EditOutlinedIcon,
  DeleteOutline as DeleteOutlineIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  WcOutlined as WcOutlinedIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useDashboardView } from './shared/DashboardViewContext';
import { ChildSwitcherPanel, ChildSwitcherTrigger } from './shared/ChildSwitcher';
import { getAllQuickTagOptions, loadCustomQuickTags } from '../../utils/quickTags';
import { getRoleDisplay } from '../../constants/roles';
import TimelineFilters from '../Timeline/TimelineFilters';
import UnifiedTimeline from '../Timeline/UnifiedTimeline';
import MiniCalendar from '../UI/MiniCalendar';
import colors from '../../assets/theme/colors';

const actionPalette = {
  meds: {
    icon: <MedicationOutlinedIcon sx={{ fontSize: 18 }} />,
    label: 'Meds',
    color: colors.semantic.success,
  },
  sleep: {
    icon: <BedtimeOutlinedIcon sx={{ fontSize: 18 }} />,
    label: 'Sleep',
    color: colors.brand.deep,
  },
  food: {
    icon: <RestaurantOutlinedIcon sx={{ fontSize: 18 }} />,
    label: 'Food',
    color: colors.semantic.warning,
  },
  toilet: {
    icon: <WcOutlinedIcon sx={{ fontSize: 18 }} />,
    label: 'Toilet',
    color: colors.app.tertiary.main,
  },
};

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
}) => {
  const { activeChildId, setActiveChildId } = useDashboardView();
  const [customQuickTags, setCustomQuickTags] = useState([]);
  const [timelineFilters, setTimelineFilters] = useState({});
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [childMenuAnchor, setChildMenuAnchor] = useState(null);
  const [desktopMenuAnchor, setDesktopMenuAnchor] = useState(null);
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

  const activityStreakLabel = formatStreakLabel(activeChildSummary.activityStreak || 0);
  const quickTagOptions = useMemo(() => getAllQuickTagOptions(customQuickTags), [customQuickTags]);
  const activeQuickTags = timelineFilters.tagFilters || [];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCustomQuickTags(loadCustomQuickTags(user?.uid));
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setTimelineFilters({});
    setSelectedDate(new Date());
  }, [activeChild?.id]);

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
    onQuickEntry?.(activeChild, 'quick_note');
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

  const handleQuickTagToggle = (tagKey) => {
    setTimelineFilters((current) => {
      const currentTags = Array.isArray(current.tagFilters) ? current.tagFilters : [];
      const nextTags = currentTags.includes(tagKey)
        ? currentTags.filter((value) => value !== tagKey)
        : [...currentTags, tagKey];

      return {
        ...current,
        tagFilters: nextTags.length > 0 ? nextTags : undefined,
      };
    });
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <ChildSwitcherTrigger
              child={activeChild}
              roleLabel={dashboardRoleLabel || 'Care Owner'}
              showRole
              showBorder
              avatarSize={36}
              onClick={handleDesktopChildMenuOpen}
            />

            <IconButton
              onClick={handleDesktopMenuOpen}
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
                {Object.entries(actionPalette).map(([key, action]) => (
                  <Button
                    key={key}
                    onClick={() => handleQuickAction(key)}
                    startIcon={action.icon}
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
                      '&:hover': {
                        bgcolor: alpha(action.color, 0.12),
                        borderColor: action.color,
                        boxShadow: 'none',
                      },
                    }}
                  >
                    {action.label}
                  </Button>
                ))}
              </Stack>

              <Button
                onClick={handleQuickNote}
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
              <TimelineFilters
                compact
                mobileLayout={false}
                filters={timelineFilters}
                onFiltersChange={setTimelineFilters}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                hideDateFilter
                sx={{ mb: 1 }}
              />

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  overflowX: 'auto',
                  whiteSpace: 'nowrap',
                  pb: 0.75,
                  mb: 1.5,
                  mt: -0.25,
                  scrollbarWidth: 'none',
                  '&::-webkit-scrollbar': {
                    display: 'none',
                  },
                }}
              >
                {quickTagOptions.map((tag) => {
                  const selected = activeQuickTags.includes(tag.key);
                  return (
                    <Button
                      key={tag.key}
                      onClick={() => handleQuickTagToggle(tag.key)}
                      variant={selected ? 'contained' : 'outlined'}
                      sx={{
                        flex: '0 0 auto',
                        minHeight: 30,
                        px: 1.4,
                        py: 0.5,
                        borderRadius: '9999px',
                        borderColor: selected ? colors.brand.deep : colors.landing.borderLight,
                        bgcolor: selected ? alpha(colors.brand.deep, 0.12) : colors.landing.surface,
                        color: selected ? colors.landing.heroText : colors.landing.textMuted,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        letterSpacing: '-0.01em',
                        boxShadow: 'none',
                        whiteSpace: 'nowrap',
                        '&:hover': {
                          bgcolor: selected ? alpha(colors.brand.deep, 0.16) : colors.landing.sageLight,
                          boxShadow: 'none',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                        <span>{tag.icon}</span>
                        <span>{tag.label}</span>
                      </Box>
                    </Button>
                  );
                })}
              </Box>

              <UnifiedTimeline
                child={activeChild}
                selectedDate={selectedDate}
                filters={timelineFilters}
                onFiltersChange={setTimelineFilters}
                showFilters={false}
                showDaySummary
                streakLabel={activityStreakLabel}
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
            borderRadius: '18px',
            border: `1px solid ${colors.landing.borderLight}`,
            boxShadow: `0 24px 60px ${colors.landing.shadowPanel}`,
            bgcolor: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(16px)',
            overflow: 'hidden',
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
            showAddChild={false}
            title="Switch Child"
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
        {activeChild?.medicalProfile?.foodAllergies?.find(Boolean) || activeChild?.medicalProfile?.currentMedications?.find(Boolean) ? (
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
                <Typography sx={{ fontWeight: 700, color: colors.landing.heroText }}>
                  {activeChild?.medicalProfile?.foodAllergies?.find(Boolean) || activeChild?.medicalProfile?.currentMedications?.find(Boolean)}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 0.5 }} />
          </>
        ) : null}

        <MenuItem
          onClick={() => handleDesktopAction('add-child')}
          sx={{ gap: 1.25, py: 1.25, px: 1.5, minHeight: 48 }}
        >
          <ListItemIcon sx={{ minWidth: 34 }}>
            <PersonAddAlt1OutlinedIcon sx={{ fontSize: 18, color: colors.brand.ink }} />
          </ListItemIcon>
          Add child
        </MenuItem>

        <Box sx={{ px: 1.5, pb: 0.75, pt: 1 }}>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: colors.landing.textMuted }}>
            Care Team
          </Typography>
        </Box>

        <MenuItem onClick={() => handleDesktopAction('invite-caregiver')} sx={{ gap: 1.25, py: 1.25, px: 1.5, minHeight: 48 }}>
          <ListItemIcon sx={{ minWidth: 34 }}>
            <GroupsOutlinedIcon sx={{ fontSize: 18, color: colors.brand.ink }} />
          </ListItemIcon>
          Add careteam
        </MenuItem>

        {Array.isArray(activeChild?.users?.members) && activeChild.users.members.length > 1 ? (
          <MenuItem onClick={() => handleDesktopAction('start-chat')} sx={{ gap: 1.25, py: 1.25, px: 1.5, minHeight: 48 }}>
            <ListItemIcon sx={{ minWidth: 34 }}>
              <ChatBubbleOutlineIcon sx={{ fontSize: 18, color: colors.brand.deep }} />
            </ListItemIcon>
            Start chat
          </MenuItem>
        ) : null}

        <Divider sx={{ my: 0.5 }} />

        <Box sx={{ px: 1.5, pb: 0.75, pt: 1 }}>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: colors.landing.textMuted }}>
            Tools
          </Typography>
        </Box>

        <MenuItem onClick={() => handleDesktopAction('prep-for-therapy')} sx={{ gap: 1.25, py: 1.25, px: 1.5, minHeight: 48 }}>
          <ListItemIcon sx={{ minWidth: 34 }}>
            <AutoAwesomeOutlinedIcon sx={{ fontSize: 18, color: colors.brand.ink }} />
          </ListItemIcon>
          Prep for therapy
        </MenuItem>

        <MenuItem onClick={() => handleDesktopAction('import-logs')} sx={{ gap: 1.25, py: 1.25, px: 1.5, minHeight: 48 }}>
          <ListItemIcon sx={{ minWidth: 34 }}>
            <FileUploadOutlinedIcon sx={{ fontSize: 18, color: colors.brand.deep }} />
          </ListItemIcon>
          Import .xlsx or .docx
        </MenuItem>

        <MenuItem onClick={() => handleDesktopAction('edit-child')} sx={{ gap: 1.25, py: 1.25, px: 1.5, minHeight: 48 }}>
          <ListItemIcon sx={{ minWidth: 34 }}>
            <EditOutlinedIcon sx={{ fontSize: 18, color: colors.brand.ink }} />
          </ListItemIcon>
          Edit Child Profile
        </MenuItem>

        <MenuItem onClick={() => handleDesktopAction('delete-child')} sx={{ gap: 1.25, py: 1.25, px: 1.5, minHeight: 48, color: 'error.main' }}>
          <ListItemIcon sx={{ minWidth: 34 }}>
            <DeleteOutlineIcon sx={{ fontSize: 18, color: 'error.main' }} />
          </ListItemIcon>
          Delete Child Profile
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default DesktopDashboardWorkspace;
