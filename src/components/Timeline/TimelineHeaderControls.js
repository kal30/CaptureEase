import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Popover,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  CalendarToday as CalendarTodayIcon,
  FilterListRounded as FilterListRoundedIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import MiniCalendar from '../UI/MiniCalendar';
import { getTimelineFilterSections, LOG_TYPES } from '../../constants/logTypeRegistry';
import colors from '../../assets/theme/colors';
import { getActiveTimelineFilterCount } from './utils/filterCounts';

const isSameDay = (dateA, dateB) => (
  Boolean(dateA && dateB)
  && dateA.getFullYear() === dateB.getFullYear()
  && dateA.getMonth() === dateB.getMonth()
  && dateA.getDate() === dateB.getDate()
);

const getTimelineHeaderLabel = (date = new Date()) => {
  if (isSameDay(date, new Date())) {
    return 'Today';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const TimelineHeaderControls = ({
  filters = {},
  onFiltersChange,
  selectedDate,
  onDateChange,
  streakLabel = '',
  activeFiltersCount,
  calendarEntries = [],
  mobileLayout = false,
  showFiltersButton = true,
  onOpenAdvancedFilters,
  sx = {},
}) => {
  const [datePickerAnchor, setDatePickerAnchor] = useState(null);
  const { entryType } = useMemo(() => getTimelineFilterSections(), []);
  const activeEntryTypes = Array.isArray(filters.entryTypes) ? filters.entryTypes : [];
  const searchText = filters.searchText || '';
  const mobileHeaderLabel = getTimelineHeaderLabel(selectedDate);
  const activeStreakLabel = streakLabel || 'No streak yet';
  const computedActiveFiltersCount = typeof activeFiltersCount === 'number'
    ? activeFiltersCount
    : getActiveTimelineFilterCount(filters, selectedDate);
  const filtersLabel = computedActiveFiltersCount > 0
    ? `Filters (${computedActiveFiltersCount})`
    : 'Filters';

  const updateFilters = (nextFilters) => {
    onFiltersChange?.({
      ...filters,
      ...nextFilters,
    });
  };

  const handleDateChange = (newDate) => {
    onDateChange?.(newDate);
    updateFilters({ selectedDate: newDate });
    setDatePickerAnchor(null);
  };

  const handleDatePickerOpen = (event) => {
    setDatePickerAnchor(event.currentTarget);
  };

  const handleDatePickerClose = () => {
    setDatePickerAnchor(null);
  };

  const toggleEntryType = (typeKey) => {
    const nextTypes = activeEntryTypes.includes(typeKey)
      ? activeEntryTypes.filter((key) => key !== typeKey)
      : [...activeEntryTypes, typeKey];

    updateFilters({
      entryTypes: nextTypes.length > 0 ? nextTypes : undefined,
    });
  };

  const handleSearchChange = (event) => {
    updateFilters({
      searchText: event.target.value || undefined,
    });
  };

  const getEntryTypePalette = (typeKey) => LOG_TYPES[typeKey]?.palette || null;

  const sharedChipSx = (active, chipPalette, fallbackColor) => ({
    flex: '0 0 auto',
    scrollSnapAlign: 'start',
    height: 36,
    borderRadius: '12px',
    fontWeight: 800,
    px: 1,
    color: active ? (chipPalette?.text || fallbackColor) : colors.landing.textMuted,
    bgcolor: active ? alpha(chipPalette?.bg || fallbackColor, 0.9) : colors.landing.surface,
    border: `2px solid ${active ? (chipPalette?.border || fallbackColor) : colors.landing.borderLight}`,
    '& .MuiChip-label': {
      px: 1.5,
    },
    '&:hover': {
      bgcolor: active ? alpha(chipPalette?.bg || fallbackColor, 1) : colors.landing.surfaceSoft,
    },
  });

  return (
    <Box sx={{ ...sx }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: mobileLayout ? 1 : 1.25, alignItems: 'stretch' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            minWidth: 0,
          }}
        >
          <Button
            onClick={handleDatePickerOpen}
            startIcon={<CalendarTodayIcon sx={{ fontSize: 16 }} />}
            endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 18 }} />}
            sx={{
              px: 0,
              py: 0.25,
              minWidth: 0,
              color: colors.landing.heroText,
              textTransform: 'none',
              fontWeight: 900,
              fontSize: mobileLayout ? '1rem' : '1.02rem',
              letterSpacing: '-0.02em',
              justifyContent: 'flex-start',
              alignItems: 'center',
              flexShrink: 0,
              '&:hover': {
                bgcolor: 'transparent',
              },
            }}
          >
            {mobileHeaderLabel}
          </Button>

          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.45,
              px: 0.85,
              py: 0.45,
              borderRadius: '9999px',
              bgcolor: activeStreakLabel && activeStreakLabel !== 'No streak yet'
                ? alpha(colors.landing.cyanPop, 0.16)
                : colors.landing.sageLight,
              border: `1px solid ${activeStreakLabel && activeStreakLabel !== 'No streak yet'
                ? alpha(colors.landing.cyanPop, 0.4)
                : colors.landing.borderLight}`,
              color: colors.landing.heroText,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              maxWidth: mobileLayout ? '46%' : 'none',
            }}
          >
            <Typography sx={{ fontSize: '0.78rem', lineHeight: 1 }}>🔥</Typography>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1 }}>
              {activeStreakLabel}
            </Typography>
          </Box>
        </Box>

        {mobileLayout ? (
          <>
            <TextField
              fullWidth
              placeholder="Search..."
              value={searchText}
              onChange={handleSearchChange}
              size="small"
              InputProps={{
                startAdornment: <SearchIcon sx={{ fontSize: 18, mr: 0.75, color: colors.landing.textMuted }} />,
              }}
              sx={{
                flex: 1,
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
              {entryType.items.map((filter) => {
                const active = activeEntryTypes.includes(filter.value);
                const chipPalette = getEntryTypePalette(filter.value);
                return (
                  <Chip
                    key={filter.value}
                    label={filter.icon ? `${filter.icon} ${filter.label}` : filter.label}
                    onClick={() => toggleEntryType(filter.value)}
                    sx={{ ...sharedChipSx(active, chipPalette, colors.brand.deep), flex: '0 0 auto', scrollSnapAlign: 'start' }}
                  />
                );
              })}

              {showFiltersButton ? (
                <Chip
                  icon={<FilterListRoundedIcon sx={{ fontSize: 18 }} />}
                  label={filtersLabel}
                  onClick={onOpenAdvancedFilters}
                  sx={{
                    flex: '0 0 auto',
                    scrollSnapAlign: 'start',
                    height: 36,
                    borderRadius: '12px',
                    fontWeight: 800,
                    px: 1,
                    color: colors.landing.textMuted,
                    bgcolor: colors.landing.surface,
                    border: `2px solid ${colors.landing.borderLight}`,
                    '& .MuiChip-label': {
                      px: 1.5,
                    },
                    '&:hover': {
                      bgcolor: colors.landing.surfaceSoft,
                    },
                  }}
                />
              ) : null}
            </Stack>
          </>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <TextField
                fullWidth
                placeholder="Search..."
                value={searchText}
                onChange={handleSearchChange}
                size="small"
                InputProps={{
                  startAdornment: <SearchIcon sx={{ fontSize: 18, mr: 0.75, color: colors.landing.textMuted }} />,
                }}
                sx={{
                  flex: 1,
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

              {showFiltersButton ? (
                <Chip
                  icon={<FilterListRoundedIcon sx={{ fontSize: 18 }} />}
                  label={filtersLabel}
                  onClick={onOpenAdvancedFilters}
                  sx={{
                    flex: '0 0 auto',
                    height: 40,
                    borderRadius: '12px',
                    fontWeight: 800,
                    px: 1,
                    color: colors.landing.textMuted,
                    bgcolor: colors.landing.surface,
                    border: `2px solid ${colors.landing.borderLight}`,
                    '& .MuiChip-label': {
                      px: 1.5,
                    },
                    '&:hover': {
                      bgcolor: colors.landing.surfaceSoft,
                    },
                  }}
                />
              ) : null}
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              {entryType.items.map((filter) => {
                const active = activeEntryTypes.includes(filter.value);
                const chipPalette = getEntryTypePalette(filter.value);
                return (
                  <Chip
                    key={filter.value}
                    label={filter.icon ? `${filter.icon} ${filter.label}` : filter.label}
                    onClick={() => toggleEntryType(filter.value)}
                    sx={{
                      ...sharedChipSx(active, chipPalette, colors.brand.deep),
                      flex: '0 1 auto',
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        )}
      </Box>

      <Popover
        open={Boolean(datePickerAnchor)}
        anchorEl={datePickerAnchor}
        onClose={handleDatePickerClose}
        disableScrollLock
        disablePortal
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        disableAutoFocus
      >
        <Box sx={{ p: 1 }}>
          <MiniCalendar
            entries={calendarEntries}
            onDayClick={(day, dayEntries, date) => handleDateChange(date)}
            currentMonth={selectedDate || new Date()}
            selectedDate={selectedDate}
          />
        </Box>
      </Popover>
    </Box>
  );
};

export default TimelineHeaderControls;
