import React, { useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  Avatar,
  Box,
  ButtonBase,
  CircularProgress,
  Button,
  FormControl,
  Chip,
  IconButton,
  Drawer,
  InputLabel,
  Paper,
  Popover,
  MenuItem,
  InputAdornment,
  Select,
  SwipeableDrawer,
  FormControlLabel,
  Switch,
  TextField,
  Snackbar,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  CalendarToday as CalendarTodayIcon,
  ForumOutlined as ForumOutlinedIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  MenuOutlined as MenuIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { ACTIVE_TIMELINE_DATE_STORAGE_KEY, useDashboardView } from '../shared/DashboardViewContext';
import { ChildSwitcherPanel } from '../shared/ChildSwitcher';
import { getTimelineEntryDate } from '../../../services/timeline/dateUtils';
import ChildActionsMenuContent from '../shared/ChildActionsMenuContent';
import { USER_ROLES } from '../../../constants/roles';
import { LOG_TYPES } from '../../../constants/logTypeRegistry';
import UnifiedTimeline from '../../Timeline/UnifiedTimeline';
import { getChildCareTeam } from '../../../services/childAccessService';
import { auth } from '../../../services/firebase';
import { getAllQuickTagOptions, getQuickTagDisplay, loadCustomQuickTags } from '../../../utils/quickTags';
import { getCalendarDateKey } from '../../../utils/calendarDateKey';
import colors from '../../../assets/theme/colors';
import DashboardActionBoard from '../DashboardActionBoard';
import { getE2EMockData, isE2EMockEnabled } from '../../../services/e2eMock';
import { getChildProfileCompletion } from '../../../utils/profileCompletion';
import { buildMoodDocId, logMood } from '../../../services/moodService';
import { isBehaviorIncidentEntry } from '../../../constants/logTypeRegistry';

const timelineUserRoleOptions = [
  { value: USER_ROLES.CARE_OWNER, label: 'Care Owner' },
  { value: USER_ROLES.CARE_PARTNER, label: 'Care Partner' },
  { value: USER_ROLES.CAREGIVER, label: 'Caregiver' },
  { value: USER_ROLES.THERAPIST, label: 'Therapist' },
];

const MOOD_OPTIONS = [
  { key: 'down', emoji: '😢', label: 'Down', tint: '#D6D0F3', aliases: ['down', 'sad', 'bad', 'upset', 'tired'] },
  { key: 'neutral', emoji: '😐', label: 'Neutral', tint: '#D7E4F2', aliases: ['neutral', 'okay', 'ok', 'fine', 'meh'] },
  { key: 'calm', emoji: '🙂', label: 'Calm', tint: '#DDEEE4', aliases: ['calm', 'relaxed', 'peaceful', 'content'] },
  { key: 'happy', emoji: '😄', label: 'Happy', tint: '#F7E1C9', aliases: ['happy', 'good', 'great', 'joyful', 'smiling'] },
  { key: 'frustrated', emoji: '😡', label: 'Frustrated', tint: '#F8D1D5', aliases: ['frustrated', 'mad', 'angry', 'annoyed', 'stressed'] },
];

const TEXT_PRIMARY = '#1F2937';
const TEXT_SECONDARY = '#4B5563';
const TEXT_MUTED = '#9CA3AF';

const MOOD_DEBOUNCE_MS = 2500;
const MOOD_COOLDOWN_MS = 10000;

const getMoodOption = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) {
    return MOOD_OPTIONS[2];
  }

  return MOOD_OPTIONS.find((option) => (
    option.key === normalized
    || option.label.toLowerCase() === normalized
    || option.aliases.some((alias) => normalized.includes(alias))
  )) || MOOD_OPTIONS[2];
};

const buildOptimisticMoodEntry = ({ childId, moodValue, moodOption }) => {
  const now = new Date();
  const moodDocId = buildMoodDocId(childId, now);

  return {
    id: moodDocId,
    childId,
    collection: 'dailyCare',
    actionType: 'mood',
    type: 'mood',
    timelineType: 'mood',
    category: 'mood',
    logCategory: 'mood',
    timestamp: now,
    createdAt: now,
    value: moodValue,
    moodValue,
    mood: moodValue,
    title: moodValue,
    titlePrefix: 'Mood',
    content: moodValue,
    text: moodValue,
    data: {
      level: moodValue,
      value: moodValue,
      source: 'mobile-dashboard',
    },
    icon: moodOption.emoji,
    color: LOG_TYPES.mood.palette.dot,
    categoryIcon: moodOption.emoji,
    categoryColor: LOG_TYPES.mood.palette.dot,
    incidentStyle: false,
    entryType: 'mood',
    incidentCategoryId: 'mood',
    incidentCategoryLabel: 'Mood',
    incidentCategoryColor: LOG_TYPES.mood.palette.dot,
    incidentCategoryIcon: moodOption.emoji,
    authorName: 'You',
    loggedByUser: 'You',
  };
};

const getEntryDate = (entry) => {
  if (!entry) {
    return null;
  }

  const candidate = getTimelineEntryDate(entry)
    || (typeof entry.timestamp?.toDate === 'function' ? entry.timestamp.toDate() : null)
    || new Date(entry.timestamp);

  return candidate instanceof Date && !Number.isNaN(candidate.getTime()) ? candidate : null;
};

const getMoodSnapshot = (entries = []) => {
  const latestMoodEntry = [...entries]
    .map((entry) => ({ entry, date: getEntryDate(entry) }))
    .filter(({ date }) => Boolean(date))
    .sort((a, b) => b.date - a.date)
    .map(({ entry }) => entry)
    .find((entry) => {
      const category = String(entry?.category || entry?.type || entry?.timelineType || entry?.actionType || entry?.logCategory || '').toLowerCase();
      const text = String(
        entry?.moodValue
        || entry?.value
        || entry?.data?.level
        || entry?.title
        || entry?.content
        || entry?.text
        || entry?.notes
        || ''
      ).toLowerCase();
      return category === 'mood'
        || category === 'mood_log'
        || text.includes('mood')
        || text.includes('calm')
        || text.includes('happy')
        || text.includes('neutral')
        || text.includes('frustrated');
    });

  const rawMood = String(
    latestMoodEntry?.moodValue
    || latestMoodEntry?.data?.level
    || latestMoodEntry?.value
    || latestMoodEntry?.mood
    || latestMoodEntry?.moodLevel
    || latestMoodEntry?.content
    || latestMoodEntry?.title
    || 'Calm'
  ).trim();
  const matchedMood = getMoodOption(rawMood);

  return {
    key: matchedMood.key,
    emoji: matchedMood.emoji,
    label: matchedMood.label,
    raw: rawMood,
  };
};

const MobileCaptureDashboard = ({
  children = [],
  allEntries = {},
  getUserRoleForChild,
  onRefreshDashboard,
  onQuickEntry,
  onTrack,
  onEditChild,
  onDeleteChild,
  onDailyReport,
  onOpenSleepLog,
  onOpenFoodLog,
  onOpenBathroomLog,
  onOpenMedicalLog,
  onInviteTeamMember,
  onGoToCareTeam,
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
  const [timelineUserRoles, setTimelineUserRoles] = useState([]);
  const [timelineDatePickerAnchor, setTimelineDatePickerAnchor] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pendingMoodKey, setPendingMoodKey] = useState(null);
  const [moodPulseKey, setMoodPulseKey] = useState(null);
  const [moodToastOpen, setMoodToastOpen] = useState(false);
  const [moodToastMessage, setMoodToastMessage] = useState('');
  const moodSaveTimerRef = useRef(null);
  const moodPulseTimerRef = useRef(null);
  const lastMoodPersistAtRef = useRef(0);
  const pendingMoodValueRef = useRef(null);
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
  const activeChildProfileCompletion = useMemo(
    () => getChildProfileCompletion(activeChild || {}),
    [activeChild]
  );
  const moodSnapshot = useMemo(() => getMoodSnapshot(activeChildEntries), [activeChildEntries]);
  const snapshotMood = useMemo(() => getMoodOption(moodSnapshot.raw), [moodSnapshot.raw]);
  const activeMood = useMemo(() => (
    pendingMoodKey
      ? MOOD_OPTIONS.find((option) => option.key === pendingMoodKey) || snapshotMood
      : snapshotMood
  ), [pendingMoodKey, snapshotMood]);
  const calendarIndicators = useMemo(() => {
    const indicatorMap = new Map();

    activeChildEntries.forEach((entry) => {
      if (!entry) return;
      const entryDate = getTimelineEntryDate(entry) || (entry.timestamp?.toDate?.() ? entry.timestamp.toDate() : new Date(entry.timestamp));
      if (Number.isNaN(entryDate.getTime())) return;

      const calendarKey = getCalendarDateKey(entryDate);
      if (!calendarKey) {
        return;
      }

      const category = String(
        entry.collection
        || entry.category
        || entry.type
        || entry.timelineType
        || entry.actionType
        || entry.logCategory
        || ''
      ).toLowerCase();

      const hasActivity = category === 'activity'
        || (entry.collection === 'dailyCare' && entry.actionType === 'activity');

      const hasIncident = category === 'incident'
        || category === 'behavior'
        || entry.entryType === 'incident'
        || Boolean(entry.incidentStyle)
        || isBehaviorIncidentEntry(entry)
        || entry.collection === 'incidents';

      const nextValue = indicatorMap.get(calendarKey) || { hasActivity: false, hasIncident: false };
      nextValue.hasActivity = nextValue.hasActivity || hasActivity;
      nextValue.hasIncident = nextValue.hasIncident || hasIncident;
      indicatorMap.set(calendarKey, nextValue);
    });

    return indicatorMap;
  }, [activeChildEntries]);
  const activeChildCareTeam = useMemo(
    () => careTeamsByChildId[activeChild?.id] || [],
    [activeChild?.id, careTeamsByChildId]
  );
  const activeChildRole = getUserRoleForChild?.(activeChild?.id) || null;
  const hasChatAvailable = useMemo(
    () => activeChildCareTeam.some((member) => String(member?.role || '').toLowerCase() !== USER_ROLES.CARE_OWNER),
    [activeChildCareTeam]
  );
  const activeChildInitial = (activeChild?.name?.trim()?.[0] || 'M').toUpperCase();
  const activeChildMoodLabel = useMemo(() => {
    const rawName = String(activeChild?.name || '').trim();
    if (!rawName) {
      return 'How is this child?';
    }

    const firstName = rawName.split(/\s+/)[0] || rawName;
    return `How is ${firstName}?`;
  }, [activeChild?.name]);
  const profileProgress = Math.max(0, Math.min(100, activeChildProfileCompletion || 0));
  const todayLabel = 'Today';
  const searchPlaceholder = `Search ${activeChild?.name || 'today'}...`;
  const handleEditActiveChild = () => {
    if (!activeChild || !onEditChild) {
      return;
    }

    onEditChild(activeChild);
  };

  useEffect(() => {
    setSearchText('');
    setActiveEntryTypes([]);
    setTimelineImportantOnly(false);
    setTimelineTagFilters([]);
    setTimelineUserRoles([]);
    setTimelineFilterSheetOpen(false);
    setTimelineDatePickerAnchor(null);
    setIsCalendarOpen(false);
    setMobileSwitchSheetOpen(false);
    setMobileActionsSheetOpen(false);
    setSelectedDate(new Date());
    setPendingMoodKey(null);
    setMoodPulseKey(null);
    pendingMoodValueRef.current = null;
    lastMoodPersistAtRef.current = 0;
    if (moodSaveTimerRef.current) {
      window.clearTimeout(moodSaveTimerRef.current);
      moodSaveTimerRef.current = null;
    }
    if (moodPulseTimerRef.current) {
      window.clearTimeout(moodPulseTimerRef.current);
      moodPulseTimerRef.current = null;
    }
  }, [activeChild?.id]);

  useEffect(() => {
    if (!pendingMoodKey) {
      return;
    }

    if (pendingMoodKey === snapshotMood.key) {
      setPendingMoodKey(null);
    }
  }, [pendingMoodKey, snapshotMood.key]);

  useEffect(() => () => {
    if (moodSaveTimerRef.current) {
      window.clearTimeout(moodSaveTimerRef.current);
    }
    if (moodPulseTimerRef.current) {
      window.clearTimeout(moodPulseTimerRef.current);
    }
  }, []);

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
    if (isE2EMockEnabled()) {
      const mockCareTeams = getE2EMockData().careTeamsByChildId || {};
      setCareTeamsByChildId(mockCareTeams);
      return undefined;
    }

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
    userRoles: timelineUserRoles.length > 0 ? timelineUserRoles : undefined,
    importantOnly: timelineImportantOnly || undefined,
    tagFilters: timelineTagFilters.length > 0 ? timelineTagFilters : undefined,
  }), [activeEntryTypes, searchText, timelineImportantOnly, timelineTagFilters, timelineUserRoles]);

  if (!activeChild) {
    return null;
  }

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
    setIsCalendarOpen(false);
  };

  const handleTimelineDatePickerClose = () => {
    setTimelineDatePickerAnchor(null);
    setIsCalendarOpen(false);
  };

  const openTimelineCalendar = (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    setTimelineDatePickerAnchor(event.currentTarget);
    setIsCalendarOpen(true);
  };

  const MobileCalendarDay = (props) => {
    const { day, outsideCurrentMonth, ...other } = props;
    const dayKey = getCalendarDateKey(day);
    const indicators = dayKey ? calendarIndicators.get(dayKey) : null;

    return (
      <Box sx={{ position: 'relative' }}>
        <PickersDay {...other} day={day} outsideCurrentMonth={outsideCurrentMonth} />
        {(indicators?.hasActivity || indicators?.hasIncident) ? (
          <Box
            sx={{
              position: 'absolute',
              bottom: 4,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.35,
              pointerEvents: 'none',
            }}
          >
            {indicators?.hasActivity ? (
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: '#5FB6B2',
                  border: `1px solid ${colors.landing.surface}`,
                  boxShadow: `0 0 0 1px ${colors.landing.surface}`,
                }}
              />
            ) : null}
            {indicators?.hasIncident ? (
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: '#D14343',
                  border: `1px solid ${colors.landing.surface}`,
                  boxShadow: `0 0 0 1px ${colors.landing.surface}`,
                }}
              />
            ) : null}
          </Box>
        ) : null}
      </Box>
    );
  };

  const toggleTimelineTagFilter = (tagKey) => {
    setTimelineTagFilters((prev) => (
      prev.includes(tagKey)
        ? prev.filter((key) => key !== tagKey)
        : [...prev, tagKey]
    ));
  };

  const handleMoodSelect = async (option) => {
    if (!activeChild?.id) {
      return;
    }

    const moodOption = option || MOOD_OPTIONS[2];
    const moodValue = moodOption.label;
    const now = Date.now();
    setPendingMoodKey(moodOption.key);
    setMoodPulseKey(moodOption.key);
    pendingMoodValueRef.current = moodValue;

    if (moodPulseTimerRef.current) {
      window.clearTimeout(moodPulseTimerRef.current);
    }
    moodPulseTimerRef.current = window.setTimeout(() => {
      setMoodPulseKey((current) => (current === moodOption.key ? null : current));
    }, 220);

    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(10);
    }

    if (moodSaveTimerRef.current) {
      window.clearTimeout(moodSaveTimerRef.current);
    }

    const elapsedSincePersist = now - (lastMoodPersistAtRef.current || 0);
    const delay = Math.max(
      MOOD_DEBOUNCE_MS,
      elapsedSincePersist < MOOD_COOLDOWN_MS ? MOOD_COOLDOWN_MS - elapsedSincePersist : 0
    );

    moodSaveTimerRef.current = window.setTimeout(async () => {
      const resolvedMoodValue = pendingMoodValueRef.current || moodValue;

      try {
        await logMood(activeChild.id, resolvedMoodValue);
        lastMoodPersistAtRef.current = Date.now();

        const optimisticMoodEntry = buildOptimisticMoodEntry({
          childId: activeChild.id,
          moodValue: resolvedMoodValue,
          moodOption: getMoodOption(resolvedMoodValue),
        });

        window.dispatchEvent(new CustomEvent('captureez:timeline-entry-created', {
          detail: optimisticMoodEntry,
        }));

        setMoodToastMessage('Mood logged ✓');
        setMoodToastOpen(true);
      } catch (error) {
        console.error('Error logging mood from dashboard:', error);
        window.dispatchEvent(new CustomEvent('captureez:timeline-refresh', {
          detail: { childId: activeChild.id },
        }));
      } finally {
        setPendingMoodKey(null);
      }
    }, delay);
  };

  return (
    <Box
      ref={rootRef}
      sx={{
        px: { xs: 1.05, sm: 1.5 },
        pt: { xs: 1, sm: 1.25 },
        pb: 10,
        touchAction: 'pan-y',
        bgcolor: '#FFFFFF',
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
          p: 1.25,
          borderRadius: '22px',
          border: `1px solid ${colors.landing.borderLight}`,
          bgcolor: '#FFFFFF',
          boxShadow: `0 10px 24px ${colors.landing.shadowSoft}`,
          mb: 1.15,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.15 }}>
          <ButtonBase
            onClick={openSwitchMenu}
            sx={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              textAlign: 'left',
              borderRadius: '18px',
              p: 0,
            }}
          >
            <Avatar
              sx={{
                width: 46,
                height: 46,
                bgcolor: '#D9E7D7',
                color: '#1F2937',
                fontWeight: 900,
                fontSize: '1rem',
                border: `1px solid ${alpha(colors.brand.ink, 0.16)}`,
                boxShadow: `0 6px 14px ${colors.landing.shadowSoft}`,
              }}
            >
              {activeChildInitial}
            </Avatar>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55, flexWrap: 'wrap' }}>
                <Typography
                sx={{
                  fontSize: '1rem',
                  lineHeight: 1.1,
                  fontWeight: 900,
                  color: TEXT_PRIMARY,
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
                >
                  {activeChild?.name || 'Madison Bear'}
                </Typography>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.35,
                    px: 0.65,
                    py: 0.22,
                    borderRadius: 999,
                    bgcolor: '#F3F4F6',
                    color: TEXT_PRIMARY,
                  }}
                >
                  <Typography sx={{ fontSize: '0.78rem', lineHeight: 1 }}>{activeMood.emoji}</Typography>
                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, lineHeight: 1, color: TEXT_SECONDARY }}>
                    {activeMood.label}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </ButtonBase>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
            <ButtonBase
              onClick={handleEditActiveChild}
              disabled={!activeChild || !onEditChild}
              aria-label={`Edit ${activeChild?.name || 'child profile'}`}
              sx={{
                flexShrink: 0,
                width: 48,
                height: 48,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                touchAction: 'manipulation',
                '&.Mui-disabled': {
                  opacity: 1,
                },
              }}
            >
              <Box sx={{ position: 'relative', width: 46, height: 46, display: 'grid', placeItems: 'center' }}>
                <CircularProgress
                  variant="determinate"
                  value={profileProgress}
                  size={46}
                  thickness={4.2}
                  sx={{ color: colors.brand.ink, position: 'absolute', left: 0, top: 0 }}
                />
                <Typography sx={{ fontSize: '0.66rem', fontWeight: 900, color: TEXT_PRIMARY }}>
                  {profileProgress}%
                </Typography>
              </Box>
            </ButtonBase>

            {hasChatAvailable && onMessages ? (
              <IconButton
                onClick={() => onMessages?.(activeChild)}
                aria-label="Open child chat"
                data-cy="mobile-child-chat"
                sx={{
                  flexShrink: 0,
                  width: 42,
                  height: 42,
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
              data-cy="mobile-child-actions"
              sx={{
                flexShrink: 0,
                width: 42,
                height: 42,
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
      </Paper>

      <Box sx={{ mb: 1.15 }}>
        <Typography sx={{ fontSize: '0.9rem', fontWeight: 900, letterSpacing: '-0.01em', color: TEXT_PRIMARY, mb: 0.55 }}>
          Quick Log
        </Typography>
        <DashboardActionBoard
          child={activeChild}
          onTrack={onTrack}
          onOpenMedicalLog={onOpenMedicalLog}
          onOpenSleepLog={onOpenSleepLog}
          onOpenFoodLog={onOpenFoodLog}
          onQuickEntry={onQuickEntry}
          sx={{ mb: 0.55 }}
        />
      </Box>

      <Box
        sx={{
          px: 0.15,
          py: 0.05,
          mb: 0.65,
        }}
      >
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.06em', color: TEXT_SECONDARY, mb: 0.3 }}>
          {activeChildMoodLabel}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.45, overflowX: 'auto', pb: 0.05, WebkitOverflowScrolling: 'touch', alignItems: 'flex-start' }}>
          {MOOD_OPTIONS.map((option) => {
            const isSelected = option.key === activeMood.key;
            const isPulsing = option.key === moodPulseKey;
            return (
              <ButtonBase
                key={option.key}
                onClick={() => handleMoodSelect(option)}
                aria-pressed={isSelected}
                sx={{
                  flexShrink: 0,
                  minWidth: 0,
                  width: 60,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: 0.18,
                  px: 0,
                  py: 0,
                  borderRadius: 0,
                  backgroundColor: 'transparent',
                  transition: 'transform 140ms ease, background-color 180ms ease, box-shadow 180ms ease',
                  '&:hover': {
                    backgroundColor: 'transparent',
                  },
                  '&:focus-visible': {
                    outline: `2px solid ${option.tint}`,
                    outlineOffset: 3,
                  },
                  '&:active .moodEmojiBubble': {
                    transform: 'scale(0.94)',
                  },
                }}
              >
                <Box
                  className="moodEmojiBubble"
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: isSelected ? alpha(option.tint, 0.2) : 'transparent',
                    boxShadow: isSelected ? `0 0 0 10px ${alpha(option.tint, 0.08)}, 0 4px 10px ${alpha(option.tint, 0.12)}` : 'none',
                    transition: 'background-color 180ms ease, box-shadow 180ms ease, transform 140ms ease',
                    transform: isSelected ? 'translateY(-1px) scale(1.1)' : 'translateY(0) scale(1)',
                    animation: isPulsing ? 'moodPulse 220ms cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
                    '@keyframes moodPulse': {
                      '0%': { transform: 'translateY(0) scale(1)' },
                      '45%': { transform: 'translateY(-1px) scale(1.18)' },
                      '100%': { transform: 'translateY(-1px) scale(1.1)' },
                    },
                  }}
                >
                  <Typography sx={{ fontSize: '2.05rem', lineHeight: 1 }}>{option.emoji}</Typography>
                </Box>
                <Typography
                  sx={{
                    minHeight: 14,
                    fontSize: '0.62rem',
                    fontWeight: 500,
                    lineHeight: 1,
                    color: isSelected ? TEXT_PRIMARY : TEXT_MUTED,
                    opacity: 1,
                    transform: isSelected ? 'translateY(0)' : 'translateY(-2px)',
                    transition: 'opacity 160ms ease, transform 160ms ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {option.label}
                </Typography>
              </ButtonBase>
            );
          })}
        </Box>
      </Box>

      <Paper
        ref={timelineRef}
        elevation={0}
        sx={{
          borderRadius: '22px',
          border: `1px solid ${colors.landing.borderLight}`,
          boxShadow: `0 14px 34px ${colors.landing.shadowSoft}`,
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          mb: 2,
        }}
      >
        <Box sx={{ p: 1.25, pb: 1.1, borderBottom: `1px solid ${colors.landing.borderLight}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}>
            <ButtonBase
              onClick={openTimelineCalendar}
              aria-label="Open calendar"
              aria-haspopup="dialog"
              sx={{
                position: 'relative',
                zIndex: 2,
                pointerEvents: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.35,
                pl: 0,
                pr: 0.2,
                py: 0.1,
                borderRadius: 1,
                color: TEXT_PRIMARY,
                touchAction: 'manipulation',
              }}
            >
              <Typography sx={{ fontSize: '0.92rem', fontWeight: 900, color: TEXT_PRIMARY, lineHeight: 1 }}>
                {todayLabel}
              </Typography>
              <KeyboardArrowDownIcon sx={{ fontSize: 18, color: TEXT_SECONDARY }} />
            </ButtonBase>
          </Box>

          <TextField
            fullWidth
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder={searchPlaceholder}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: colors.landing.textMuted }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '16px',
                bgcolor: colors.landing.surface,
                '& fieldset': {
                  borderColor: colors.landing.borderLight,
                },
              },
            }}
          />
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            maxHeight: { xs: 'clamp(240px, calc(100dvh - 560px), 420px)' },
            overflowY: 'auto',
            px: 1.05,
            py: 1.05,
            background: `linear-gradient(180deg, #FFFFFF 0%, ${colors.landing.sageLight} 100%)`,
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
            calendarEntries={activeChildEntries}
          />
        </Box>
      </Paper>

      <Snackbar
        open={moodToastOpen}
        onClose={() => setMoodToastOpen(false)}
        autoHideDuration={1600}
        message={moodToastMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        ContentProps={{
          sx: {
            borderRadius: 999,
            bgcolor: colors.brand.ink,
            color: '#FFFFFF',
            fontWeight: 800,
            px: 1.5,
            boxShadow: `0 10px 24px ${colors.landing.shadowSoft}`,
          },
        }}
      />

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

          <Box sx={{ px: 0.25, pb: 1.25 }}>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: colors.landing.textMuted, mb: 0.2 }}>
              More
            </Typography>
          </Box>

          <ChildActionsMenuContent
            child={activeChild}
            userRole={activeChildRole}
            careTeamCount={activeChildCareTeam.length}
            onGoToCareTeam={(child) => {
              closeMobileChildSheet();
              onGoToCareTeam?.(child);
            }}
            onEditChild={(child) => {
              closeMobileChildSheet();
              onEditChild?.(child);
            }}
            onInviteTeamMember={(childId) => {
              closeMobileChildSheet();
              onInviteTeamMember?.(childId);
            }}
            onDeleteChild={(child) => {
              closeMobileChildSheet();
              onDeleteChild?.(child);
            }}
            onPrepForTherapy={(child) => {
              closeMobileChildSheet();
              onDailyReport?.(child);
            }}
            onImportLogs={(child) => {
              closeMobileChildSheet();
              onImportLogs?.(child);
            }}
            onOpenBathroomLog={(child) => {
              closeMobileChildSheet();
              onOpenBathroomLog?.(child);
            }}
          />
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
            activeChild={activeChild}
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
                setTimelineUserRoles([]);
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

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.25 }}>
            <FormControl size="small" sx={{ minWidth: 0, flex: '1 1 180px' }}>
              <InputLabel>Who logged it</InputLabel>
              <Select
                multiple
                value={timelineUserRoles}
                label="Who logged it"
                onChange={(event) => {
                  const value = event.target.value;
                  setTimelineUserRoles(typeof value === 'string' ? value.split(',') : value);
                }}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(Array.isArray(selected) ? selected : []).map((value) => {
                      const option = timelineUserRoleOptions.find((item) => item.value === value);
                      return (
                        <Chip key={value} label={option?.label || value} size="small" />
                      );
                    })}
                  </Box>
                )}
              >
                {timelineUserRoleOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              onClick={() => setTimelineDatePickerAnchor((prev) => prev || document.body)}
              startIcon={<CalendarTodayIcon sx={{ fontSize: 16 }} />}
              sx={{
                minHeight: 40,
                flex: '1 1 180px',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 800,
                color: colors.landing.heroText,
                borderColor: colors.landing.borderLight,
                bgcolor: colors.landing.surface,
              }}
            >
              Jump to date
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
        open={isCalendarOpen}
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
