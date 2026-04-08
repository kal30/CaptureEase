import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  CalendarToday as CalendarTodayIcon,
  CategoryOutlined as CategoryOutlinedIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  PeopleAltOutlined as PeopleAltOutlinedIcon,
  NoteAltOutlined as NoteAltOutlinedIcon,
  RestaurantOutlined as RestaurantOutlinedIcon,
  BedtimeOutlined as BedtimeOutlinedIcon,
  MedicationOutlined as MedicationOutlinedIcon,
  WcOutlined as WcOutlinedIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useDashboardView } from './shared/DashboardViewContext';
import { getLogTypeByEntry } from '../../constants/logTypeRegistry';
import { getAllQuickTagOptions, loadCustomQuickTags } from '../../utils/quickTags';
import TimelineFilters from '../Timeline/TimelineFilters';
import UnifiedTimeline from '../Timeline/UnifiedTimeline';
import MiniCalendar from '../UI/MiniCalendar';
import ChildManagementMenu from './ChildManagementMenu';
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

const countTodayEntries = (entries = []) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  return entries.reduce((acc, entry) => {
    if (!entry) return acc;
    const entryDate = entry.timestamp?.toDate?.() ? entry.timestamp.toDate() : new Date(entry.timestamp);
    if (Number.isNaN(entryDate.getTime()) || entryDate < todayStart) {
      return acc;
    }

    const meta = getLogTypeByEntry(entry);
    const category = meta?.category || entry.category || entry.type || '';

    if (category === 'medication') acc.meds += 1;
    else if (category === 'food') acc.meals += 1;
    else if (category === 'sleep') acc.sleep += 1;

    return acc;
  }, { meds: 0, meals: 0, sleep: 0 });
};

const getChildLabel = (child) => child?.name || 'Select child';

const DesktopDashboardWorkspace = ({
  hook,
  onQuickEntry,
  onAddChildClick,
  onOpenSleepLog,
  onOpenFoodLog,
  onOpenBathroomLog,
  onImportLogs,
}) => {
  const { activeChildId, setActiveChildId } = useDashboardView();
  const switchChildButtonRef = useRef(null);
  const [childSwitcherAnchor, setChildSwitcherAnchor] = useState(null);
  const [customQuickTags, setCustomQuickTags] = useState([]);
  const [timelineFilters, setTimelineFilters] = useState({});
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const activeChild = useMemo(
    () => hook.children.find((child) => child.id === activeChildId) || hook.children[0] || null,
    [activeChildId, hook.children]
  );

  const activeChildEntries = useMemo(
    () => hook.allEntries?.[activeChild?.id] || [],
    [activeChild?.id, hook.allEntries]
  );

  const todayStats = useMemo(() => countTodayEntries(activeChildEntries), [activeChildEntries]);

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

  const quickTagOptions = useMemo(() => getAllQuickTagOptions(customQuickTags), [customQuickTags]);

  const handleChildSwitcherOpen = (event) => {
    if (hook.children.length > 1) {
      setChildSwitcherAnchor(event?.currentTarget || switchChildButtonRef.current);
    }
  };

  const handleChildSwitcherClose = () => {
    setChildSwitcherAnchor(null);
  };

  const handleSelectChild = (childId) => {
    setActiveChildId(childId);
    handleChildSwitcherClose();
  };

  const handleAddChild = () => {
    handleChildSwitcherClose();
    onAddChildClick?.();
  };

  const handleOpenSwitchChild = () => {
    if (hook.children.length > 1) {
      setChildSwitcherAnchor(switchChildButtonRef.current);
    }
  };

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

  if (!activeChild) {
    return null;
  }

  const childAvatar = activeChild.profilePhoto || activeChild.photoURL || activeChild.avatarUrl || '';
  const childLabel = getChildLabel(activeChild);

  return (
    <Box
      sx={{
        bgcolor: colors.landing.pageBackground,
        minHeight: '100%',
        px: { xs: 0, lg: 0 },
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 1520, mx: 'auto', px: { xs: 2, xl: 3 }, pb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1, pt: 0.5, pb: 1.5 }}>
          <Button
            ref={switchChildButtonRef}
            onClick={handleChildSwitcherOpen}
            variant="outlined"
            disabled={hook.children.length <= 1}
            endIcon={hook.children.length > 1 ? <KeyboardArrowDownIcon sx={{ fontSize: 18 }} /> : null}
            sx={{
              minHeight: 42,
              px: 1.5,
              borderRadius: '12px',
              borderColor: colors.landing.borderLight,
              bgcolor: colors.landing.surface,
              color: colors.landing.heroText,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: colors.landing.sageLight,
                borderColor: colors.landing.borderMedium,
                boxShadow: 'none',
              },
            }}
          >
            <Avatar
              src={childAvatar || undefined}
              alt={childLabel}
              sx={{
                width: 26,
                height: 26,
                mr: 1,
                bgcolor: colors.roles.careOwner.primary,
                color: '#fff',
                fontSize: '0.8rem',
                border: `1px solid ${colors.landing.borderMedium}`,
              }}
            >
              {childLabel.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1 }}>
              <Typography sx={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.landing.textMuted, fontWeight: 700 }}>
                Switch Child
              </Typography>
              <Typography sx={{ fontWeight: 600, fontSize: '0.92rem', color: colors.landing.heroText }}>
                {childLabel}
              </Typography>
            </Box>
          </Button>

          <Menu
            anchorEl={childSwitcherAnchor}
            open={Boolean(childSwitcherAnchor)}
            onClose={handleChildSwitcherClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 250,
                borderRadius: '12px',
                border: `1px solid ${colors.landing.borderLight}`,
                boxShadow: `0 24px 60px ${colors.landing.shadowPanel}`,
                bgcolor: 'rgba(255,255,255,0.96)',
                backdropFilter: 'blur(16px)',
              },
            }}
          >
            {hook.children.map((child) => (
              <MenuItem key={child.id} onClick={() => handleSelectChild(child.id)} sx={{ gap: 1.25, py: 1.25, px: 1.5, minHeight: 48 }}>
                <Avatar
                  src={child.profilePhoto || child.photoURL || child.avatarUrl || undefined}
                  sx={{
                    width: 28,
                    height: 28,
                    bgcolor: colors.roles.careOwner.primary,
                    color: '#fff',
                    fontSize: '0.78rem',
                  }}
                >
                  {(child.name || 'C').charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600, color: colors.landing.heroText, lineHeight: 1.1 }}>
                    {child.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.landing.textMuted }}>
                    Switch profile
                  </Typography>
                </Box>
              </MenuItem>
            ))}
            <Divider sx={{ my: 0.5 }} />
            <MenuItem onClick={handleAddChild} sx={{ gap: 1.25, py: 1.25, px: 1.5, minHeight: 48 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <PeopleAltOutlinedIcon sx={{ fontSize: 18, color: colors.brand.ink }} />
              </ListItemIcon>
              Add child
            </MenuItem>
          </Menu>

            <ChildManagementMenu
            child={activeChild}
            onEditChild={hook.handleEditChild}
            onInviteTeamMember={hook.handleInviteTeamMember}
            onDeleteChild={hook.handleDeleteChild}
            onSwitchChild={handleOpenSwitchChild}
            onPrepForTherapy={hook.handleShowCareReport}
            onImportLogs={onImportLogs}
            onStartChat={hook.handleMessages}
            userRole={hook.getUserRoleForChild?.(activeChild.id)}
            careTeamCount={Array.isArray(activeChild?.users?.members) ? activeChild.users.members.length : 0}
          />
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { lg: '250px minmax(0, 1fr) 290px' },
            gap: { lg: 2.25 },
            alignItems: 'start',
          }}
        >
          <Paper
            variant="outlined"
              sx={{
                display: { xs: 'none', lg: 'block' },
                position: 'sticky',
                top: 76,
                borderRadius: '12px',
                bgcolor: colors.landing.surface,
                borderColor: colors.landing.borderLight,
                boxShadow: `0 4px 6px -1px ${colors.landing.shadowSoft}`,
              p: 2,
            }}
          >
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: colors.landing.textMuted, mb: 1.5 }}>
              Daily Stats
            </Typography>
            <Stack spacing={1.25}>
              {[
                { label: 'Meds', value: todayStats.meds, color: colors.semantic.success },
                { label: 'Meals', value: todayStats.meals, color: colors.semantic.warning },
                { label: 'Sleep', value: todayStats.sleep, color: colors.brand.deep },
              ].map((item) => (
                <Paper
                  key={item.label}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: '12px',
                    borderColor: colors.landing.borderLight,
                    bgcolor: colors.landing.surface,
                    boxShadow: `0 4px 6px -1px ${colors.landing.shadowSoft}`,
                  }}
                >
                  <Typography sx={{ color: colors.landing.textMuted, fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {item.label}
                  </Typography>
                  <Typography sx={{ color: item.color, fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.1 }}>
                    {item.value}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </Paper>

          <Box sx={{ minWidth: 0, maxWidth: 800, width: '100%', mx: 'auto' }}>
            <Paper
              variant="outlined"
              sx={{
                borderRadius: '12px',
                bgcolor: colors.landing.surface,
                borderColor: colors.landing.borderLight,
                boxShadow: `0 4px 6px -1px ${colors.landing.shadowSoft}`,
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
                      minHeight: 44,
                      px: 2,
                      borderRadius: '12px',
                      whiteSpace: 'nowrap',
                      textTransform: 'none',
                      fontWeight: 700,
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
                  minHeight: 46,
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
                boxShadow: `0 4px 6px -1px ${colors.landing.shadowSoft}`,
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
                sx={{ mb: 1.5 }}
              />

              <UnifiedTimeline
                child={activeChild}
                selectedDate={selectedDate}
                filters={timelineFilters}
                onFiltersChange={setTimelineFilters}
                showFilters={false}
                showDaySummary
              />
            </Paper>
          </Box>

          <Stack
            spacing={2}
            sx={{
              display: { xs: 'none', lg: 'block' },
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
                boxShadow: `0 4px 6px -1px ${colors.landing.shadowSoft}`,
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

            <Paper
              variant="outlined"
              sx={{
                borderRadius: 3,
                bgcolor: colors.landing.surface,
                borderColor: colors.landing.borderLight,
                boxShadow: `0 4px 6px -1px ${colors.landing.shadowSoft}`,
                p: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <CategoryOutlinedIcon sx={{ fontSize: 18, color: colors.brand.deep }} />
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: colors.landing.textMuted }}>
                  Quick Tags
                </Typography>
              </Box>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {quickTagOptions.map((tag) => (
                  <Chip
                    key={tag.key}
                    label={`${tag.icon} ${tag.label}`}
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      borderColor: colors.landing.borderLight,
                      bgcolor: colors.landing.sageLight,
                      color: colors.landing.heroText,
                      fontWeight: 600,
                    }}
                  />
                ))}
              </Stack>
            </Paper>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default DesktopDashboardWorkspace;
