import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Avatar,
  Box,
  CircularProgress,
  Button,
  Chip,
  ListItemIcon,
  Paper,
  Popover,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Assignment as ReportsIcon,
  BuildOutlined as ToolsIcon,
  AutoAwesomeOutlined as AutoAwesomeIcon,
  DeleteOutline as DeleteIcon,
  EditOutlined as EditIcon,
  FileUpload as FileUploadIcon,
  ForumOutlined as ForumIcon,
  NoteAltOutlined as NoteAltOutlinedIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Search as SearchIcon,
  MedicalServicesOutlined as MedicalServicesOutlinedIcon,
  Timeline as TimelineIcon,
  Add as AddIcon,
  PriorityHigh as PriorityHighIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { useDashboardView } from '../shared/DashboardViewContext';
import UnifiedTimeline from '../../Timeline/UnifiedTimeline';
import { getChildCareTeam } from '../../../services/childAccessService';
import { getLogTypeByEntry } from '../../../constants/logTypeRegistry';
import colors from '../../../assets/theme/colors';

const countTodayEntries = (entries = []) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const counts = {
    meds: 0,
    meals: 0,
    sleep: 0,
  };

  entries.forEach((entry) => {
    const entryDate = entry.timestamp?.toDate?.() ? entry.timestamp.toDate() : new Date(entry.timestamp);
    if (Number.isNaN(entryDate.getTime()) || entryDate < todayStart) {
      return;
    }

    const meta = getLogTypeByEntry(entry);
    const category = meta?.category || entry.category || entry.type || '';

    if (category === 'medication') counts.meds += 1;
    else if (category === 'food') counts.meals += 1;
    else if (category === 'sleep') counts.sleep += 1;
  });

  return counts;
};

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
    border: colors.semantic.neutral,
  },
];

const timelineFilters = [
  { key: null, label: 'All', emoji: null, filled: true, color: colors.brand.ink },
  { key: 'medication', label: 'Meds', emoji: '💊', color: colors.brand.ink },
  { key: 'sleep', label: 'Sleep', emoji: '😴', color: colors.brand.deep },
  { key: 'food', label: 'Food', emoji: '🍽️', color: colors.semantic.warning },
  { key: 'bathroom', label: 'Toilet', emoji: '🚽', color: colors.semantic.success },
];

const MobileCaptureDashboard = ({
  children = [],
  allEntries = {},
  onRefreshDashboard,
  onQuickEntry,
  onEditChild,
  onDeleteChild,
  onDailyReport,
  onOpenSleepLog,
  onOpenFoodLog,
  onOpenBathroomLog,
  onOpenMedicalLog,
  onMessages,
  onAddChildClick,
  onImportLogs,
}) => {
  const { activeChildId } = useDashboardView();
  const [searchText, setSearchText] = useState('');
  const [activeEntryType, setActiveEntryType] = useState(null);
  const [selectedDate] = useState(new Date());
  const [toolsAnchor, setToolsAnchor] = useState(null);
  const [childMenuAnchor, setChildMenuAnchor] = useState(null);
  const [careTeamCount, setCareTeamCount] = useState(null);
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
  const activeChildPhoto = activeChild?.profilePhoto || activeChild?.photoURL || activeChild?.avatarUrl || '';
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
    setActiveEntryType(null);
  }, [activeChild?.id]);

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

  useEffect(() => {
    let isMounted = true;

    if (!activeChild?.id || !onMessages) {
      setCareTeamCount(null);
      return undefined;
    }

    const loadCareTeamCount = async () => {
      try {
        const members = await getChildCareTeam(activeChild.id);
        if (isMounted) {
          setCareTeamCount(Array.isArray(members) ? members.length : 0);
        }
      } catch (error) {
        if (isMounted) {
          setCareTeamCount(0);
        }
      }
    };

    loadCareTeamCount();

    return () => {
      isMounted = false;
    };
  }, [activeChild?.id, onMessages]);

  const todaySummary = useMemo(() => {
    if (!activeChild?.id) {
      return { meds: 0, meals: 0, sleep: 0 };
    }
    return countTodayEntries(allEntries[activeChild.id] || []);
  }, [activeChild?.id, allEntries]);

  const timelineFiltersValue = useMemo(() => ({
    searchText: searchText || undefined,
    entryTypes: activeEntryType ? [activeEntryType] : undefined,
  }), [activeEntryType, searchText]);

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

  const handleTimelineClick = () => {
    timelineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleToolsOpen = (event) => {
    setToolsAnchor(event.currentTarget);
  };

  const handleToolsClose = () => {
    setToolsAnchor(null);
  };

  const handleChildMenuOpen = (event) => {
    setChildMenuAnchor(event.currentTarget);
  };

  const handleChildMenuClose = () => {
    setChildMenuAnchor(null);
  };

  const toolsMenuItems = [
    {
      label: 'Medical log',
      onClick: () => onOpenMedicalLog?.(activeChild),
      icon: <MedicalServicesOutlinedIcon sx={{ fontSize: 17 }} />,
    },
    {
      label: 'Import logs',
      onClick: () => onImportLogs?.(activeChild),
      icon: <AddIcon sx={{ fontSize: 17, transform: 'rotate(45deg)' }} />,
    },
    {
      label: 'Daily report',
      onClick: () => onDailyReport?.(activeChild),
      icon: <ReportsIcon sx={{ fontSize: 17 }} />,
    },
    {
      label: 'Add child',
      onClick: () => onAddChildClick?.(),
      icon: <AddIcon sx={{ fontSize: 17 }} />,
    },
  ];

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
          borderRadius: '14px',
          overflow: 'hidden',
          border: `1px solid ${colors.landing.borderLight}`,
          boxShadow: `0 16px 36px ${colors.landing.shadowSoft}`,
          mb: 1.5,
        }}
      >
        <Box
          sx={{
            p: 2,
            backgroundColor: colors.landing.panelSoft,
            color: colors.landing.heroText,
            position: 'relative',
            minHeight: 96,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, mt: 0.75 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '1.35rem', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', color: colors.landing.heroText }}>
                {activeChild.name}
              </Typography>
            </Box>

            <Button
              onClick={handleChildMenuOpen}
              aria-label="Child actions"
              endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 18 }} />}
              sx={{
                flexShrink: 0,
                minHeight: 42,
                px: 1.1,
                py: 0.5,
                borderRadius: '12px',
                bgcolor: colors.landing.surface,
                color: colors.landing.heroText,
                border: `1px solid ${colors.landing.borderMedium}`,
                boxShadow: `0 4px 12px ${colors.landing.shadowSoft}`,
                textTransform: 'none',
                fontWeight: 800,
                '&:hover': {
                  bgcolor: colors.landing.surfaceSoft,
                  borderColor: colors.landing.borderMedium,
                },
              }}
            >
              <Avatar
                src={activeChildPhoto}
                alt={activeChild.name}
                sx={{
                  width: 32,
                  height: 32,
                  mr: 0.8,
                  border: `1px solid ${colors.landing.borderMedium}`,
                  bgcolor: colors.roles.careOwner.primary,
                  color: colors.landing.surface,
                  fontSize: '0.85rem',
                  fontWeight: 800,
                }}
              >
                {!activeChildPhoto ? activeChild.name?.[0]?.toUpperCase() : null}
              </Avatar>
            </Button>
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
              '&:hover': {
                borderColor: colors.brand.deep,
                borderWidth: '2px',
                bgcolor: colors.landing.surface,
              },
            }}
          >
            Quick Note (auto-classified)
          </Button>

          <Paper
            variant="outlined"
            sx={{
              mt: 1.1,
              p: 1.2,
              borderRadius: '14px',
              bgcolor: colors.landing.sageLight,
              borderColor: colors.landing.borderLight,
            }}
          >
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: colors.landing.textMuted, mb: 0.7 }}>
              Today
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
              <Box>
                <Typography sx={{ color: colors.brand.ink, fontWeight: 900, fontSize: '1.15rem', lineHeight: 1 }}>
                  {todaySummary.meds}
                </Typography>
                <Typography sx={{ color: colors.landing.textMuted, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  meds
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ color: colors.semantic.warning, fontWeight: 900, fontSize: '1.15rem', lineHeight: 1 }}>
                  {todaySummary.meals}
                </Typography>
                <Typography sx={{ color: colors.landing.textMuted, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  meals
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ color: colors.brand.deep, fontWeight: 900, fontSize: '1.15rem', lineHeight: 1 }}>
                  {todaySummary.sleep}
                </Typography>
                <Typography sx={{ color: colors.landing.textMuted, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  sleep
                </Typography>
              </Box>
            </Box>
          </Paper>
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
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: colors.landing.textMuted, mb: 1 }}>
            Timeline
          </Typography>
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
              pb: 0.25,
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {timelineFilters.map((filter) => {
              const active = filter.key === activeEntryType || (filter.key === null && !activeEntryType);
              return (
                <Chip
                  key={filter.label}
                  label={filter.emoji ? `${filter.emoji} ${filter.label}` : filter.label}
                  onClick={() => setActiveEntryType(filter.key)}
                  sx={{
                    flex: '0 0 auto',
                    height: 36,
                    borderRadius: 9999,
                    fontWeight: 800,
                    px: 1,
                    color: active ? colors.landing.heroText : filter.color,
                    bgcolor: active ? filter.color : colors.landing.surface,
                    border: `1px solid ${filter.color}`,
                    '& .MuiChip-label': {
                      px: 1.1,
                    },
                    '&:hover': {
                      bgcolor: active ? filter.color : alpha(filter.color, 0.08),
                    },
                  }}
                />
              );
            })}
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
              const nextEntryTypes = nextFilters?.entryTypes || [];
              setActiveEntryType(nextEntryTypes[0] || null);
            }}
            showFilters={false}
            showDaySummary={false}
            mobileTimeLayout={true}
          />
        </Box>
      </Paper>

      <Paper
        elevation={6}
        sx={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1300,
          borderRadius: 0,
          borderTop: `1px solid ${colors.landing.borderLight}`,
          bgcolor: colors.landing.surface,
          boxShadow: `0 -10px 30px ${colors.landing.shadowSoft}`,
        }}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
          <Button
            onClick={handleTimelineClick}
            sx={{
              minHeight: 62,
              borderRadius: 0,
              textTransform: 'none',
              fontWeight: 800,
              color: colors.landing.heroText,
            }}
          >
            <Stack spacing={0.2} alignItems="center">
              <TimelineIcon sx={{ fontSize: 20 }} />
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 700 }}>Timeline</Typography>
            </Stack>
          </Button>

          <Button
            onClick={() => onDailyReport?.(activeChild)}
            sx={{
              minHeight: 62,
              borderRadius: 0,
              textTransform: 'none',
              fontWeight: 800,
              color: colors.landing.heroText,
            }}
          >
            <Stack spacing={0.2} alignItems="center">
              <ReportsIcon sx={{ fontSize: 20 }} />
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 700 }}>Reports</Typography>
            </Stack>
          </Button>

          <Button
            onClick={handleToolsOpen}
            sx={{
              minHeight: 62,
              borderRadius: 0,
              textTransform: 'none',
              fontWeight: 800,
              color: colors.landing.heroText,
            }}
          >
            <Stack spacing={0.2} alignItems="center">
              <ToolsIcon sx={{ fontSize: 20 }} />
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 700 }}>Tools</Typography>
            </Stack>
          </Button>
        </Box>
      </Paper>

      <Popover
        open={Boolean(childMenuAnchor)}
        anchorEl={childMenuAnchor}
        onClose={handleChildMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        disableScrollLock
        PaperProps={{
          sx: {
            mt: 0.8,
            borderRadius: '18px',
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            boxShadow: `0 24px 60px ${colors.landing.shadowPanel}`,
            border: `1px solid ${colors.landing.borderLight}`,
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{ p: 1, minWidth: 228 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 1.1,
              mb: 0.75,
              borderRadius: '14px',
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

          {onMessages && (careTeamCount ?? 0) > 1 ? (
            <MenuItem
              onClick={() => {
                handleChildMenuClose();
                onMessages?.(activeChild);
              }}
              sx={{ gap: 1.1, py: 1.25, px: 1.5, minHeight: 48, borderRadius: '12px' }}
            >
              <ListItemIcon sx={{ minWidth: 34 }}>
                <ForumIcon sx={{ fontSize: 17, color: colors.brand.ink }} />
              </ListItemIcon>
              <Typography sx={{ fontWeight: 700 }}>Start chat</Typography>
            </MenuItem>
          ) : null}

          <MenuItem
            onClick={() => {
              handleChildMenuClose();
              onDailyReport?.(activeChild);
            }}
            sx={{ gap: 1.1, py: 1.25, px: 1.5, minHeight: 48, borderRadius: '12px' }}
          >
            <ListItemIcon sx={{ minWidth: 34 }}>
              <AutoAwesomeIcon sx={{ fontSize: 17, color: colors.brand.ink }} />
            </ListItemIcon>
            <Typography sx={{ fontWeight: 700 }}>Prep for therapy</Typography>
          </MenuItem>

          <MenuItem
            onClick={() => {
              handleChildMenuClose();
              onImportLogs?.(activeChild);
            }}
            sx={{ gap: 1.1, py: 1.25, px: 1.5, minHeight: 48, borderRadius: '12px' }}
          >
            <ListItemIcon sx={{ minWidth: 34 }}>
              <FileUploadIcon sx={{ fontSize: 17, color: colors.brand.ink }} />
            </ListItemIcon>
            <Typography sx={{ fontWeight: 700 }}>Import .xlsx or .docx</Typography>
          </MenuItem>

          <MenuItem
            onClick={() => {
              handleChildMenuClose();
              onEditChild?.(activeChild);
            }}
            sx={{ gap: 1.1, py: 1.25, px: 1.5, minHeight: 48, borderRadius: '12px' }}
          >
            <ListItemIcon sx={{ minWidth: 34 }}>
              <EditIcon sx={{ fontSize: 17, color: colors.brand.ink }} />
            </ListItemIcon>
            <Typography sx={{ fontWeight: 700 }}>Edit child</Typography>
          </MenuItem>

          {typeof onDeleteChild === 'function' ? (
            <MenuItem
              onClick={() => {
                handleChildMenuClose();
                onDeleteChild?.(activeChild);
              }}
              sx={{ gap: 1.1, py: 1.25, px: 1.5, minHeight: 48, borderRadius: '12px', color: 'error.main' }}
            >
              <ListItemIcon sx={{ minWidth: 34 }}>
                <DeleteIcon sx={{ fontSize: 17, color: 'error.main' }} />
              </ListItemIcon>
              <Typography sx={{ fontWeight: 700, color: 'error.main' }}>Delete child</Typography>
            </MenuItem>
          ) : null}
        </Box>
      </Popover>

      <Popover
        open={Boolean(toolsAnchor)}
        anchorEl={toolsAnchor}
        onClose={handleToolsClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        disableScrollLock
      >
        <Box sx={{ p: 0.75, minWidth: 220 }}>
          {toolsMenuItems.map((item) => (
            <MenuItem
              key={item.label}
              onClick={() => {
                handleToolsClose();
                item.onClick?.();
              }}
              sx={{ gap: 1.1, py: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 34 }}>
                {item.icon}
              </ListItemIcon>
              <Typography sx={{ fontWeight: 700 }}>{item.label}</Typography>
            </MenuItem>
          ))}
        </Box>
      </Popover>
    </Box>
  );
};

export default MobileCaptureDashboard;
