import React, { useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  Box,
  CircularProgress,
  Button,
  Chip,
  IconButton,
  ListItemIcon,
  Drawer,
  Paper,
  Popover,
  MenuItem,
  SwipeableDrawer,
  Stack,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
import {
  AutoAwesomeOutlined as AutoAwesomeIcon,
  CalendarToday as CalendarTodayIcon,
  DeleteOutline as DeleteIcon,
  EditOutlined as EditIcon,
  FileUpload as FileUploadIcon,
  ForumOutlined as ForumOutlinedIcon,
  GroupsOutlined as GroupsIcon,
  FilterListRounded as FilterListRoundedIcon,
  NoteAltOutlined as NoteAltOutlinedIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  MenuOutlined as MenuIcon,
  Search as SearchIcon,
  PriorityHigh as PriorityHighIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { useDashboardView } from '../shared/DashboardViewContext';
import { ChildSwitcherPanel, ChildSwitcherTrigger } from '../shared/ChildSwitcher';
import { USER_ROLES } from '../../../constants/roles';
import UnifiedTimeline from '../../Timeline/UnifiedTimeline';
import { getChildCareTeam } from '../../../services/childAccessService';
import { auth } from '../../../services/firebase';
import { getAllQuickTagOptions, getQuickTagDisplay, loadCustomQuickTags } from '../../../utils/quickTags';
import colors from '../../../assets/theme/colors';

const quickActions = [
  {
    key: 'meds',
    label: 'Meds',
    emoji: '💊',
    border: colors.semantic.success,
  },
  {
    key: 'sleep',
    label: 'Sleep',
    emoji: '😴',
    border: colors.brand.deep,
  },
  {
    key: 'food',
    label: 'Food',
    emoji: '🍽️',
    border: colors.semantic.warning,
  },
  {
    key: 'toilet',
    label: 'Toilet',
    emoji: '🚽',
    border: colors.app.tertiary.main,
  },
];

const timelineFilters = [
  { key: 'medication', label: 'Meds', emoji: '💊', color: colors.semantic.success },
  { key: 'sleep', label: 'Sleep', emoji: '😴', color: colors.brand.deep },
  { key: 'food', label: 'Food', emoji: '🍽️', color: colors.semantic.warning },
  { key: 'bathroom', label: 'Toilet', emoji: '🚽', color: colors.app.tertiary.main },
];

const isSameDay = (dateA, dateB) => (
  Boolean(dateA && dateB)
  && dateA.getFullYear() === dateB.getFullYear()
  && dateA.getMonth() === dateB.getMonth()
  && dateA.getDate() === dateB.getDate()
);

const formatStreakLabel = (streak = 0) => {
  if (!streak || streak < 1) {
    return '';
  }

  return `🔥 ${streak}-Day Streak`;
};

const getTimelineHeaderLabel = (date = new Date()) => {
  if (isSameDay(date, new Date())) {
    return 'Today';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const MobileCaptureDashboard = ({
  children = [],
  allEntries = {},
  timelineSummary = {},
  getUserRoleForChild,
  onRefreshDashboard,
  onQuickEntry,
  onEditChild,
  onDeleteChild,
  onDailyReport,
  onOpenSleepLog,
  onOpenFoodLog,
  onOpenBathroomLog,
  onOpenMedicalLog,
  onInviteTeamMember,
  onMessages,
  onImportLogs,
  onAddChildClick,
  onRefreshRoles,
}) => {
  const { activeChildId, setActiveChildId } = useDashboardView();
  const [searchText, setSearchText] = useState('');
  const [activeEntryTypes, setActiveEntryTypes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [mobileSwitchSheetOpen, setMobileSwitchSheetOpen] = useState(false);
  const [mobileActionsSheetOpen, setMobileActionsSheetOpen] = useState(false);
  const [careTeamsByChildId, setCareTeamsByChildId] = useState({});
  const [customQuickTags, setCustomQuickTags] = useState([]);
  const [timelineFilterSheetOpen, setTimelineFilterSheetOpen] = useState(false);
  const [timelineImportantOnly, setTimelineImportantOnly] = useState(false);
  const [timelineTagFilters, setTimelineTagFilters] = useState([]);
  const [timelineDatePickerAnchor, setTimelineDatePickerAnchor] = useState(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const timelineRef = useRef(null);
  const pullStateRef = useRef({
    startY: 0,
    active: false,
    distance: 0,
  });
  const rootRef = useRef(null);

  const activeChild = useMemo(
    () => children.find((child) => child.id === activeChildId) || children[0] || null,
    [activeChildId, children]
  );
  const activeChildEntries = useMemo(() => allEntries[activeChild?.id] || [], [allEntries, activeChild?.id]);
  const activeChildSummary = useMemo(
    () => timelineSummary?.[activeChild?.id] || timelineSummary || {},
    [activeChild?.id, timelineSummary]
  );
  const activityStreakLabel = formatStreakLabel(activeChildSummary.activityStreak || 0);
  const mobileStreakLabel = activityStreakLabel || 'No streak yet';
  const datesWithEntries = useMemo(() => {
    const dateKeys = new Set();

    activeChildEntries.forEach((entry) => {
      if (!entry) return;
      const entryDate = entry.timestamp?.toDate?.() ? entry.timestamp.toDate() : new Date(entry.timestamp);
      if (Number.isNaN(entryDate.getTime())) return;
      dateKeys.add(new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate()).toDateString());
    });

    return dateKeys;
  }, [activeChildEntries]);
  const activeChildCareTeam = useMemo(
    () => careTeamsByChildId[activeChild?.id] || [],
    [activeChild?.id, careTeamsByChildId]
  );
  const hasChatAvailable = useMemo(
    () => activeChildCareTeam.some((member) => String(member?.role || '').toLowerCase() !== USER_ROLES.CARE_OWNER),
    [activeChildCareTeam]
  );
  const activeChildWarningLabel = useMemo(() => {
    const medicalProfile = activeChild?.medicalProfile || {};
    const foodAllergies = Array.isArray(medicalProfile.foodAllergies) ? medicalProfile.foodAllergies : [];
    const currentMedications = Array.isArray(medicalProfile.currentMedications) ? medicalProfile.currentMedications : [];

    const firstAllergy = foodAllergies.find(Boolean);
    if (firstAllergy) {
      const label = String(firstAllergy).toLowerCase().includes('nut')
        ? 'Nut Allergy'
        : `${firstAllergy} Allergy`;
      return label;
    }

    const firstMedication = currentMedications.find(Boolean);
    if (firstMedication) {
      if (typeof firstMedication === 'string') {
        return `Medication: ${firstMedication}`;
      }
      const name = firstMedication.name || firstMedication.medication || firstMedication.title || 'Medication';
      const dosage = firstMedication.dosage || firstMedication.dose;
      return `Medication: ${dosage ? `${name} ${dosage}` : name}`;
    }

    return 'Medical Info';
  }, [activeChild?.medicalProfile]);

  useEffect(() => {
    setSearchText('');
    setActiveEntryTypes([]);
    setTimelineImportantOnly(false);
    setTimelineTagFilters([]);
    setTimelineFilterSheetOpen(false);
    setTimelineDatePickerAnchor(null);
    setMobileSwitchSheetOpen(false);
    setMobileActionsSheetOpen(false);
    setSelectedDate(new Date());
  }, [activeChild?.id]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCustomQuickTags(loadCustomQuickTags(user?.uid));
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (!children.length) {
      setCareTeamsByChildId({});
      return undefined;
    }

    const loadCareTeams = async () => {
      const entries = await Promise.all(children.map(async (child) => {
        try {
          const members = await getChildCareTeam(child.id);
          return [child.id, Array.isArray(members) ? members : []];
        } catch (error) {
          return [child.id, []];
        }
      }));

      if (isMounted) {
        setCareTeamsByChildId(Object.fromEntries(entries));
      }
    };

    loadCareTeams();

    return () => {
      isMounted = false;
    };
  }, [children]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof window === 'undefined') {
      return undefined;
    }

    const threshold = 72;
    const maxPullDistance = 120;
    const getScrollTop = () => window.scrollY || document.documentElement.scrollTop || 0;

    const updatePullDistance = (nextDistance) => {
      pullStateRef.current.distance = nextDistance;
      setPullDistance(nextDistance);
    };

    const handleTouchStart = (event) => {
      if (isRefreshing || event.touches?.length !== 1) {
        return;
      }

      if (getScrollTop() > 0) {
        pullStateRef.current.active = false;
        updatePullDistance(0);
        return;
      }

      pullStateRef.current.startY = event.touches[0].clientY;
      pullStateRef.current.active = true;
      updatePullDistance(0);
    };

    const handleTouchMove = (event) => {
      if (!pullStateRef.current.active || event.touches?.length !== 1) {
        return;
      }

      if (getScrollTop() > 0) {
        pullStateRef.current.active = false;
        updatePullDistance(0);
        return;
      }

      const delta = event.touches[0].clientY - pullStateRef.current.startY;
      if (delta <= 0) {
        updatePullDistance(0);
        return;
      }

      const nextDistance = Math.min(maxPullDistance, delta * 0.65);
      updatePullDistance(nextDistance);

      if (delta > 6) {
        event.preventDefault();
      }
    };

    const handleTouchEnd = async () => {
      if (!pullStateRef.current.active) {
        updatePullDistance(0);
        return;
      }

      const shouldRefresh = pullStateRef.current.distance >= threshold;
      pullStateRef.current.active = false;
      updatePullDistance(0);

      if (shouldRefresh && typeof onRefreshDashboard === 'function') {
        setIsRefreshing(true);
        try {
          await onRefreshDashboard();
        } catch (error) {
          console.error('Error refreshing dashboard:', error);
        } finally {
          setIsRefreshing(false);
        }
      }
    };

    node.addEventListener('touchstart', handleTouchStart, { passive: true });
    node.addEventListener('touchmove', handleTouchMove, { passive: false });
    node.addEventListener('touchend', handleTouchEnd, { passive: true });
    node.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      node.removeEventListener('touchstart', handleTouchStart);
      node.removeEventListener('touchmove', handleTouchMove);
      node.removeEventListener('touchend', handleTouchEnd);
      node.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [onRefreshDashboard, isRefreshing]);

  const hasTimelineEntries = (allEntries[activeChild?.id] || []).length > 0;
  const shouldGuideToQuickLog = !hasTimelineEntries;
  const timelineAdvancedFilterCount = (timelineImportantOnly ? 1 : 0)
    + timelineTagFilters.length
    + (!isSameDay(selectedDate, new Date()) ? 1 : 0)
    + activeEntryTypes.length;

  const availableTimelineTags = useMemo(() => {
    const tagMap = new Map();

    getAllQuickTagOptions(customQuickTags).forEach((tag) => {
      if (!tagMap.has(tag.key)) {
        tagMap.set(tag.key, tag);
      }
    });

    activeChildEntries.forEach((entry) => {
      (Array.isArray(entry.tags) ? entry.tags : []).forEach((tag) => {
        const key = String(tag || '').trim();
        if (!key || tagMap.has(key)) {
          return;
        }

        tagMap.set(key, getQuickTagDisplay(key, customQuickTags));
      });
    });

    return Array.from(tagMap.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [activeChildEntries, customQuickTags]);

  const timelineFiltersValue = useMemo(() => ({
    searchText: searchText || undefined,
    entryTypes: activeEntryTypes.length > 0 ? activeEntryTypes : undefined,
    importantOnly: timelineImportantOnly || undefined,
    tagFilters: timelineTagFilters.length > 0 ? timelineTagFilters : undefined,
  }), [activeEntryTypes, searchText, timelineImportantOnly, timelineTagFilters]);

  if (!activeChild) {
    return null;
  }

  const handleQuickAction = (actionKey) => {
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
    onQuickEntry?.(activeChild, 'quick_note');
  };

  const toggleTimelineEntryType = (typeKey) => {
    setActiveEntryTypes((prev) => {
      if (prev.includes(typeKey)) {
        return prev.filter((key) => key !== typeKey);
      }

      return [...prev, typeKey];
    });
  };

  const openSwitchMenu = (event) => {
    onRefreshRoles?.();
    event?.preventDefault?.();
    setMobileSwitchSheetOpen(true);
  };

  const closeSwitchMenu = () => {
    setMobileSwitchSheetOpen(false);
  };

  const openMobileChildSheet = () => {
    setMobileActionsSheetOpen(true);
  };

  const closeMobileChildSheet = () => {
    setMobileActionsSheetOpen(false);
  };

  const handleTimelineDatePreset = (dateValue) => {
    setSelectedDate(dateValue);
    setTimelineDatePickerAnchor(null);
  };

  const handleTimelineDatePickerOpen = (event) => {
    setTimelineDatePickerAnchor(event.currentTarget);
  };

  const handleTimelineDatePickerClose = () => {
    setTimelineDatePickerAnchor(null);
  };

  const MobileCalendarDay = (props) => {
    const { day, outsideCurrentMonth, ...other } = props;
    const hasEntries = datesWithEntries.has(day.toDateString());

    return (
      <Box sx={{ position: 'relative' }}>
        <PickersDay {...other} day={day} outsideCurrentMonth={outsideCurrentMonth} />
        {hasEntries ? (
          <Box
            sx={{
              position: 'absolute',
              bottom: 4,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: colors.roles.careOwner.primary,
              border: `1px solid ${colors.landing.surface}`,
              boxShadow: `0 0 0 1px ${colors.landing.surface}`,
            }}
          />
        ) : null}
      </Box>
    );
  };

  const handleAddCaregiver = () => {
    closeMobileChildSheet();
    onInviteTeamMember?.(activeChild?.id);
  };

  const toggleTimelineTagFilter = (tagKey) => {
    setTimelineTagFilters((prev) => (
      prev.includes(tagKey)
        ? prev.filter((key) => key !== tagKey)
        : [...prev, tagKey]
    ));
  };

  return (
    <Box
      ref={rootRef}
      sx={{
        px: { xs: 1.1, sm: 1.5 },
        pt: { xs: 1, sm: 1.25 },
        pb: 10,
        touchAction: 'pan-y',
      }}
    >
      <Box
        sx={{
          height: pullDistance > 0 || isRefreshing ? 44 : 0,
          mb: pullDistance > 0 || isRefreshing ? 0.75 : 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          transition: 'height 180ms ease, margin-bottom 180ms ease',
        }}
      >
        {isRefreshing ? (
          <CircularProgress size={18} thickness={5} sx={{ color: colors.brand.ink }} />
        ) : pullDistance > 0 ? (
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: colors.landing.surface,
              border: `1px solid ${colors.landing.borderLight}`,
              boxShadow: `0 8px 18px ${colors.landing.shadowSoft}`,
              transform: `translateY(${Math.min(12, pullDistance / 6)}px) rotate(${Math.min(180, (pullDistance / 72) * 180)}deg)`,
              color: colors.landing.textMuted,
            }}
          >
            <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
          </Box>
        ) : null}
      </Box>

      <Paper
        elevation={0}
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: (theme) => theme.zIndex.appBar + 2,
          borderRadius: '14px',
          overflow: 'hidden',
          border: `1px solid ${colors.landing.borderLight}`,
          boxShadow: `0 16px 36px ${colors.landing.shadowSoft}`,
          mb: 1.5,
          bgcolor: colors.landing.surface,
        }}
      >
        <Box
          sx={{
            px: 1.1,
            py: 0.85,
            backgroundColor: colors.landing.surfaceSoft,
            color: colors.landing.heroText,
            position: 'relative',
            minHeight: 44,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <ChildSwitcherTrigger
              child={activeChild}
              onClick={openSwitchMenu}
              showRole={false}
              showBorder={false}
              avatarSize={26}
            />

            {hasChatAvailable && onMessages ? (
              <IconButton
                onClick={() => onMessages?.(activeChild)}
                aria-label="Open child chat"
                sx={{
                  flexShrink: 0,
                  width: 44,
                  height: 44,
                  p: 0,
                  borderRadius: '14px',
                  color: colors.landing.heroText,
                  bgcolor: 'transparent',
                  '&:hover': {
                    bgcolor: colors.landing.surfaceSoft,
                  },
                }}
              >
                <ForumOutlinedIcon sx={{ fontSize: 18, color: colors.landing.textMuted }} />
              </IconButton>
            ) : null}

            <IconButton
              onClick={openMobileChildSheet}
              aria-label="Child actions"
              sx={{
                flexShrink: 0,
                width: 44,
                height: 44,
                p: 0,
                borderRadius: '14px',
                color: '#64748B',
                bgcolor: 'transparent',
                '&:hover': {
                  bgcolor: colors.landing.surfaceSoft,
                },
              }}
            >
              <MenuIcon sx={{ fontSize: 18, color: '#64748B' }} />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ p: 1.25, backgroundColor: colors.landing.surface }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 2 }}>
            {quickActions.map((action) => (
              <Button
                key={action.key}
                onClick={() => handleQuickAction(action.key)}
                variant="outlined"
                sx={{
                  minHeight: 106,
                  borderRadius: '14px',
                  borderWidth: '2px',
                  borderColor: action.border,
                  bgcolor: colors.landing.surface,
                  color: colors.landing.heroText,
                  textTransform: 'none',
                  fontWeight: 900,
                  boxShadow: `0 4px 10px ${colors.landing.shadowSoft}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.65,
                  position: 'relative',
                  animation: shouldGuideToQuickLog ? 'quickLogPulse 2.8s ease-in-out infinite' : 'none',
                  '@keyframes quickLogPulse': {
                    '0%, 100%': {
                      boxShadow: `0 4px 10px ${colors.landing.shadowSoft}, 0 0 0 0 ${alpha(colors.brand.ink, 0.0)}`,
                    },
                    '50%': {
                      boxShadow: `0 8px 18px ${colors.landing.shadowSoft}, 0 0 0 10px ${alpha(colors.brand.ink, 0.05)}`,
                    },
                  },
                  '&:hover': {
                    borderColor: action.border,
                    borderWidth: '2px',
                    bgcolor: colors.landing.surfaceSoft,
                  },
                }}
              >
                <Box sx={{ fontSize: '1.85rem', lineHeight: 1, color: action.border }}>{action.emoji}</Box>
                <Box sx={{ fontSize: '1rem', lineHeight: 1.05 }}>{action.label}</Box>
              </Button>
            ))}
          </Box>

          <Button
            fullWidth
            variant="outlined"
            onClick={handleQuickNote}
            startIcon={<NoteAltOutlinedIcon sx={{ fontSize: 19, color: colors.brand.tealBlue }} />}
            sx={{
              mt: 1.1,
              minHeight: 58,
              borderRadius: '14px',
              borderWidth: '2px',
              textTransform: 'none',
              fontWeight: 900,
              color: colors.landing.heroText,
              borderColor: colors.brand.tealBlue,
              bgcolor: colors.landing.surface,
              position: 'relative',
              animation: shouldGuideToQuickLog ? 'quickLogPulse 2.8s ease-in-out infinite' : 'none',
              '&:hover': {
                borderColor: colors.brand.deep,
                borderWidth: '2px',
                bgcolor: colors.landing.surface,
              },
            }}
          >
            Quick Note (auto-classified)
          </Button>

        </Box>
      </Paper>

      <Paper
        ref={timelineRef}
        elevation={0}
        sx={{
          borderRadius: '14px',
          border: `1px solid ${colors.landing.borderLight}`,
          boxShadow: `0 14px 34px ${colors.landing.shadowSoft}`,
          overflow: 'hidden',
          backgroundColor: colors.landing.surface,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          mb: 2,
        }}
      >
        <Box sx={{ p: 1.35, borderBottom: `1px solid ${colors.landing.borderLight}` }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'nowrap',
              gap: 1,
              mb: 1,
              width: '100%',
              minWidth: 0,
            }}
          >
            <Button
              onClick={handleTimelineDatePickerOpen}
              startIcon={<CalendarTodayIcon sx={{ fontSize: 16 }} />}
              endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 18 }} />}
              sx={{
                px: 0,
                py: 0.25,
                minWidth: 0,
                color: colors.landing.heroText,
                textTransform: 'none',
                fontWeight: 900,
                fontSize: '1rem',
                letterSpacing: '-0.02em',
                justifyContent: 'flex-start',
                alignItems: 'center',
                flexShrink: 0,
                '&:hover': {
                  bgcolor: 'transparent',
                },
              }}
            >
              {getTimelineHeaderLabel(selectedDate)}
            </Button>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.45,
                px: 0.85,
                py: 0.45,
                borderRadius: '9999px',
                bgcolor: activityStreakLabel ? alpha(colors.landing.cyanPop, 0.16) : colors.landing.sageLight,
                border: `1px solid ${activityStreakLabel ? alpha(colors.landing.cyanPop, 0.4) : colors.landing.borderLight}`,
                color: colors.landing.heroText,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                maxWidth: '46%',
              }}
            >
              <Typography sx={{ fontSize: '0.78rem', lineHeight: 1 }}>🔥</Typography>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1 }}>
                {mobileStreakLabel}
              </Typography>
            </Box>
          </Box>
          <TextField
            fullWidth
            placeholder="Search..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            size="small"
            InputProps={{
              startAdornment: <SearchIcon sx={{ fontSize: 18, mr: 0.75, color: colors.landing.textMuted }} />,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                minHeight: 48,
                borderRadius: 1.5,
                bgcolor: colors.landing.surface,
                '& fieldset': {
                  borderColor: colors.landing.borderLight,
                },
                '&:hover fieldset': {
                  borderColor: colors.landing.borderMedium,
                },
                '&.Mui-focused fieldset': {
                  borderColor: colors.brand.ink,
                },
              },
            }}
          />

          <Stack
            direction="row"
            spacing={0.75}
            sx={{
              mt: 1.1,
              flexWrap: 'nowrap',
              overflowX: 'auto',
              overflowY: 'hidden',
              scrollSnapType: 'x proximity',
              pb: 0.25,
              pr: 0.5,
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {timelineFilters.map((filter) => {
              const active = activeEntryTypes.includes(filter.key);
              return (
                <Chip
                  key={filter.label}
                  label={filter.emoji ? `${filter.emoji} ${filter.label}` : filter.label}
                  onClick={() => toggleTimelineEntryType(filter.key)}
                  sx={{
                    flex: '0 0 auto',
                    scrollSnapAlign: 'start',
                    height: 36,
                    borderRadius: '12px',
                    fontWeight: 800,
                    px: 1,
                    color: active ? filter.color : colors.landing.textMuted,
                    bgcolor: active ? alpha(filter.color, 0.16) : colors.landing.surface,
                    border: `2px solid ${active ? filter.color : colors.landing.borderLight}`,
                    '& .MuiChip-label': {
                      px: 1.5,
                    },
                    '&:hover': {
                      bgcolor: active ? alpha(filter.color, 0.2) : colors.landing.surfaceSoft,
                    },
                  }}
                />
              );
            })}
            <Chip
              icon={<FilterListRoundedIcon sx={{ fontSize: 18 }} />}
              label="Filters"
              onClick={() => setTimelineFilterSheetOpen(true)}
              sx={{
                flex: '0 0 auto',
                scrollSnapAlign: 'start',
                height: 36,
                borderRadius: '12px',
                fontWeight: 800,
                px: 1,
                color: timelineAdvancedFilterCount > 0 ? colors.landing.heroText : colors.landing.textMuted,
                bgcolor: timelineAdvancedFilterCount > 0 ? alpha(colors.landing.cyanPop, 0.16) : colors.landing.surface,
                border: `2px solid ${timelineAdvancedFilterCount > 0 ? colors.landing.cyanPop : colors.landing.borderLight}`,
                '& .MuiChip-label': {
                  px: 1.5,
                },
                '&:hover': {
                  bgcolor: timelineAdvancedFilterCount > 0 ? alpha(colors.landing.cyanPop, 0.2) : colors.landing.surfaceSoft,
                },
              }}
            />
          </Stack>
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            maxHeight: { xs: 'clamp(240px, calc(100dvh - 535px), 420px)' },
            overflowY: 'auto',
            px: 1.25,
            py: 1.2,
            background: `linear-gradient(180deg, ${colors.landing.surface} 0%, ${colors.landing.sageLight} 100%)`,
          }}
        >
          <UnifiedTimeline
            child={activeChild}
            selectedDate={selectedDate}
            filters={timelineFiltersValue}
            onFiltersChange={(nextFilters) => {
              setSearchText(nextFilters?.searchText || '');
              setActiveEntryTypes(nextFilters?.entryTypes || []);
            }}
            showFilters={false}
            showDaySummary={false}
            mobileTimeLayout={true}
            streakLabel={activityStreakLabel}
          />
        </Box>
      </Paper>

      <SwipeableDrawer
        anchor="bottom"
        open={mobileActionsSheetOpen}
        onOpen={openMobileChildSheet}
        onClose={closeMobileChildSheet}
        disableBackdropTransition
        disableDiscovery
        PaperProps={{
          sx: {
            borderRadius: '20px 20px 0 0',
            bgcolor: colors.landing.surface,
            borderTop: `1px solid ${colors.landing.borderLight}`,
            boxShadow: `0 -18px 48px ${colors.landing.shadowPanel}`,
            maxHeight: '82vh',
            pb: 'env(safe-area-inset-bottom)',
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{ px: 1.5, pt: 0.75, pb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <Box
              sx={{
                width: 36,
                height: 4,
                borderRadius: 9999,
                bgcolor: colors.landing.borderLight,
              }}
            />
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 1.1,
              mb: 1,
              borderRadius: '16px',
              bgcolor: alpha('#EF4444', 0.1),
              border: `1px solid ${alpha('#EF4444', 0.16)}`,
            }}
          >
            <Box
              sx={{
                width: 22,
                height: 22,
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha('#EF4444', 0.14),
                color: '#EF4444',
                flexShrink: 0,
              }}
            >
              <PriorityHighIcon sx={{ fontSize: 15 }} />
            </Box>
            <Typography sx={{ fontSize: '0.92rem', fontWeight: 800, color: colors.landing.heroText, lineHeight: 1.2 }}>
              {activeChildWarningLabel}
            </Typography>
          </Box>

          <Typography
            sx={{
              px: 0.75,
              pt: 0.5,
              pb: 0.75,
              fontFamily: 'Outfit, sans-serif',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: colors.landing.textMuted,
            }}
          >
            Care Team
          </Typography>

          {onInviteTeamMember ? (
            <MenuItem
              onClick={() => {
                closeMobileChildSheet();
                handleAddCaregiver();
              }}
              sx={{ gap: 1.1, py: 1.3, px: 1.25, minHeight: 50, borderRadius: '14px' }}
            >
              <ListItemIcon sx={{ minWidth: 34 }}>
                <GroupsIcon sx={{ fontSize: 18, color: colors.brand.ink }} />
              </ListItemIcon>
              <Typography sx={{ fontWeight: 700, color: colors.landing.heroText }}>Add careteam</Typography>
            </MenuItem>
          ) : null}

          {(careTeamsByChildId[activeChild?.id] || []).length > 1 && onMessages ? (
            <MenuItem
              onClick={() => {
                closeMobileChildSheet();
                onMessages?.(activeChild);
              }}
              sx={{ gap: 1.1, py: 1.3, px: 1.25, minHeight: 50, borderRadius: '14px' }}
            >
              <ListItemIcon sx={{ minWidth: 34 }}>
                <GroupsIcon sx={{ fontSize: 18, color: colors.brand.ink }} />
              </ListItemIcon>
              <Typography sx={{ fontWeight: 700, color: colors.landing.heroText }}>Start chat</Typography>
            </MenuItem>
          ) : null}

          <Typography
            sx={{
              px: 0.75,
              pt: 1,
              pb: 0.75,
              fontFamily: 'Outfit, sans-serif',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: colors.landing.textMuted,
            }}
          >
            Tools
          </Typography>

          <MenuItem
            onClick={() => {
              closeMobileChildSheet();
              onDailyReport?.(activeChild);
            }}
            sx={{ gap: 1.1, py: 1.3, px: 1.25, minHeight: 50, borderRadius: '14px' }}
          >
            <ListItemIcon sx={{ minWidth: 34 }}>
              <AutoAwesomeIcon sx={{ fontSize: 18, color: colors.brand.ink }} />
            </ListItemIcon>
            <Typography sx={{ fontWeight: 700, color: colors.landing.heroText }}>Prep for therapy</Typography>
          </MenuItem>

          <MenuItem
            onClick={() => {
              closeMobileChildSheet();
              onImportLogs?.(activeChild);
            }}
            sx={{ gap: 1.1, py: 1.3, px: 1.25, minHeight: 50, borderRadius: '14px' }}
          >
            <ListItemIcon sx={{ minWidth: 34 }}>
              <FileUploadIcon sx={{ fontSize: 18, color: colors.brand.ink }} />
            </ListItemIcon>
            <Typography sx={{ fontWeight: 700, color: colors.landing.heroText }}>Import .xlsx or .docx</Typography>
          </MenuItem>

          <MenuItem
            onClick={() => {
              closeMobileChildSheet();
              onEditChild?.(activeChild);
            }}
            sx={{ gap: 1.1, py: 1.3, px: 1.25, minHeight: 50, borderRadius: '14px' }}
          >
            <ListItemIcon sx={{ minWidth: 34 }}>
              <EditIcon sx={{ fontSize: 18, color: colors.brand.ink }} />
            </ListItemIcon>
            <Typography sx={{ fontWeight: 700, color: colors.landing.heroText }}>Edit Child Profile</Typography>
          </MenuItem>

          {typeof onDeleteChild === 'function' ? (
            <MenuItem
              onClick={() => {
                closeMobileChildSheet();
                onDeleteChild?.(activeChild);
              }}
              sx={{ gap: 1.1, py: 1.3, px: 1.25, minHeight: 50, borderRadius: '14px', color: 'error.main' }}
            >
              <ListItemIcon sx={{ minWidth: 34 }}>
                <DeleteIcon sx={{ fontSize: 18, color: 'error.main' }} />
              </ListItemIcon>
              <Typography sx={{ fontWeight: 700, color: 'error.main' }}>Delete Child Profile</Typography>
            </MenuItem>
          ) : null}
        </Box>
      </SwipeableDrawer>

      <SwipeableDrawer
        anchor="bottom"
        open={mobileSwitchSheetOpen}
        onOpen={openSwitchMenu}
        onClose={closeSwitchMenu}
        disableBackdropTransition
        disableDiscovery
        PaperProps={{
          sx: {
            borderRadius: '20px 20px 0 0',
            bgcolor: colors.landing.surface,
            borderTop: `1px solid ${colors.landing.borderLight}`,
            boxShadow: `0 -18px 48px ${colors.landing.shadowPanel}`,
            maxHeight: '82vh',
            pb: 'env(safe-area-inset-bottom)',
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{ px: 1.5, pt: 0.75, pb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <Box
              sx={{
                width: 36,
                height: 4,
                borderRadius: 9999,
                bgcolor: colors.landing.borderLight,
              }}
            />
          </Box>

          <Typography
            sx={{
              px: 0.75,
              pt: 0.25,
              pb: 0.75,
              fontFamily: 'Outfit, sans-serif',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: colors.landing.textMuted,
            }}
          >
            Switch Child
          </Typography>

          <ChildSwitcherPanel
            children={children}
            activeChildId={activeChild?.id}
            getUserRoleForChild={getUserRoleForChild}
            careTeamsByChildId={careTeamsByChildId}
            onSelectChild={(childId) => {
              setActiveChildId?.(childId);
              closeSwitchMenu();
            }}
            onAddChild={() => {
              closeSwitchMenu();
              onAddChildClick?.();
            }}
            showCareTeamSummary
            showAddChild={Boolean(onAddChildClick)}
            title="Switch Child"
            subtitle="Choose who you&apos;re logging for. The care team and your role are shown on each profile."
          />
        </Box>
      </SwipeableDrawer>

      <Drawer
        anchor="bottom"
        open={timelineFilterSheetOpen}
        onClose={() => setTimelineFilterSheetOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '20px 20px 0 0',
            borderTop: `1px solid ${colors.landing.borderLight}`,
            bgcolor: colors.landing.surface,
            maxHeight: '72vh',
            pb: 'env(safe-area-inset-bottom)',
          },
        }}
      >
        <Box sx={{ px: 1.75, pt: 1.5, pb: 1.75 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.25 }}>
            <Box>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: colors.landing.textMuted }}>
                Filters
              </Typography>
              <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: colors.landing.heroText }}>
                Important moments and tags
              </Typography>
            </Box>
            <Button
              variant="text"
              onClick={() => {
                setTimelineImportantOnly(false);
                setTimelineTagFilters([]);
                setSelectedDate(new Date());
                setTimelineDatePickerAnchor(null);
              }}
              sx={{
                textTransform: 'none',
                color: colors.landing.textMuted,
                fontWeight: 700,
              }}
              >
              Clear
            </Button>
          </Box>

          <Paper
            variant="outlined"
            sx={{
              p: 1.25,
              borderRadius: '16px',
              borderColor: colors.landing.borderLight,
              bgcolor: colors.landing.sageLight,
              mb: 1.25,
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={timelineImportantOnly}
                  onChange={(event) => setTimelineImportantOnly(event.target.checked)}
                  color="primary"
                />
              }
              label="Show only important / flagged"
              sx={{
                m: 0,
                alignItems: 'center',
                gap: 1,
                '& .MuiFormControlLabel-label': {
                  fontWeight: 700,
                  color: colors.landing.heroText,
                },
              }}
            />
          </Paper>

          <Typography sx={{ fontSize: '0.76rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: colors.landing.textMuted, mb: 0.9 }}>
            Tags
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.8,
              maxHeight: '32vh',
              overflowY: 'auto',
              pr: 0.25,
              pb: 0.5,
            }}
          >
            {availableTimelineTags.map((tag) => {
              const selected = timelineTagFilters.includes(tag.key);
              return (
                <Chip
                  key={tag.key}
                  label={`${tag.icon || '🏷️'} ${tag.label}`}
                  onClick={() => toggleTimelineTagFilter(tag.key)}
                  sx={{
                    flex: '0 0 auto',
                    height: 38,
                    borderRadius: 9999,
                    fontWeight: 800,
                    px: 1,
                    color: selected ? colors.landing.heroText : colors.landing.textMuted,
                    bgcolor: selected ? colors.landing.cyanPop : colors.landing.surface,
                    border: `1px solid ${selected ? colors.landing.cyanPop : colors.landing.borderLight}`,
                    '& .MuiChip-label': {
                      px: 1.1,
                    },
                  }}
                />
              );
            })}
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setTimelineFilterSheetOpen(false)}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 800,
                borderColor: colors.landing.borderLight,
                color: colors.landing.textMuted,
              }}
            >
              Close
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={() => setTimelineFilterSheetOpen(false)}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 800,
                bgcolor: colors.brand.ink,
                color: colors.landing.heroText,
                '&:hover': {
                  bgcolor: colors.brand.navy,
                },
              }}
            >
              Done
            </Button>
          </Box>
        </Box>
      </Drawer>

      <Popover
        open={Boolean(timelineDatePickerAnchor)}
        anchorEl={timelineDatePickerAnchor}
        onClose={handleTimelineDatePickerClose}
        disableScrollLock
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: {
            borderRadius: '18px',
            border: `1px solid ${colors.landing.borderLight}`,
            boxShadow: `0 24px 60px ${colors.landing.shadowPanel}`,
            overflow: 'hidden',
          },
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateCalendar
            value={selectedDate}
            onChange={(newDate) => {
              if (newDate) {
                handleTimelineDatePreset(newDate);
              }
            }}
            slots={{
              day: MobileCalendarDay,
            }}
            sx={{
              '& .MuiPickersDay-root.Mui-selected': {
                bgcolor: colors.landing.cyanPop,
                color: colors.landing.heroText,
              },
              '& .MuiPickersDay-root.Mui-selected:hover': {
                bgcolor: colors.landing.cyanPop,
              },
              '& .MuiPickersCalendarHeader-label': {
                color: colors.landing.heroText,
                fontWeight: 800,
              },
            }}
          />
        </LocalizationProvider>
      </Popover>

    </Box>
  );
};

export default MobileCaptureDashboard;
