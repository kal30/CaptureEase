import React, { useState } from 'react';
import {
  Box,
  Button,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  TextField,
  Typography,
  Paper,
  Divider,
  IconButton,
  Popover
} from '@mui/material';
import { useMediaQuery, useTheme } from '@mui/material';
import {
  Person as PersonIcon,
  Today as DateIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  CalendarToday as CalendarIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from '@mui/icons-material';
import MiniCalendar from '../UI/MiniCalendar';
import { getTimelineFilterSections, SPECIAL_FILTER_TYPES } from '../../constants/logTypeRegistry';
import colors from '../../assets/theme/colors';

/**
 * TimelineFilters - Filter controls for unified timeline
 * Allows filtering by entry type, user role, and date navigation
 * 
 * @param {Object} props
 * @param {Object} props.filters - Current filter state
 * @param {Function} props.onFiltersChange - Callback when filters change
 * @param {Date} props.selectedDate - Currently selected date
 * @param {Object} props.summary - Timeline data summary for counts
 * @param {boolean} props.compact - Whether to show compact version
 * @param {Object} props.sx - Material-UI sx prop for styling
 * @param {Function} props.onDateChange - Callback when date changes
 */
const TimelineFilters = ({
  filters = {},
  onFiltersChange,
  selectedDate,
  onDateChange,
  summary: _summary = {},
  compact = false,
  mobileLayout = false,
  hideDateFilter = false,
  sx = {}
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [datePickerAnchor, setDatePickerAnchor] = useState(null);
  const [categoryMenuAnchor, setCategoryMenuAnchor] = useState(null);
  const [searchText, setSearchText] = useState(filters.searchText || '');
  const [searchExpanded, setSearchExpanded] = useState(Boolean(filters.searchText));

  const { allEntries, entryType, flaggedAs } = getTimelineFilterSections();
  const IMPORTANT_FILTER_VALUES = [SPECIAL_FILTER_TYPES.importantMoment.value];
  const CATEGORY_FILTER_VALUES = [
    ...entryType.items.map((option) => option.value),
    ...flaggedAs.items.map((option) => option.value),
    'health',
  ];

  const handleUserRoleFilter = (event) => {
    const value = event.target.value;
    onFiltersChange({
      ...filters,
      userRoles: value === '' ? [] : (typeof value === 'string' ? [value] : value)
    });
  };

  const handleDateChange = (newDate) => {
    if (onDateChange) {
      onDateChange(newDate);
    }
    onFiltersChange({
      ...filters,
      selectedDate: newDate
    });
    setDatePickerAnchor(null);
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchText(value);
    onFiltersChange({
      ...filters,
      searchText: value || undefined
    });
  };

  const clearAllFilters = () => {
    setSearchText('');
    setSearchExpanded(false);
    onFiltersChange({});
  };

  const handleDatePickerOpen = (event) => {
    setDatePickerAnchor(event.currentTarget);
  };

  const handleDatePickerClose = () => {
    setDatePickerAnchor(null);
  };

  const handleCategoryMenuOpen = (event) => {
    setCategoryMenuAnchor(event.currentTarget);
  };

  const handleCategoryMenuClose = () => {
    setCategoryMenuAnchor(null);
  };

  const setCategoryTypeFilter = (categoryValue) => {
    const currentTypes = filters.entryTypes || [];
    const preservedTypes = currentTypes.filter((type) => !CATEGORY_FILTER_VALUES.includes(type));

    onFiltersChange({
      ...filters,
      entryTypes: categoryValue ? [...preservedTypes, categoryValue] : (preservedTypes.length > 0 ? preservedTypes : undefined),
    });
    handleCategoryMenuClose();
  };

  const clearEntryTypeFilters = () => {
    onFiltersChange({
      ...filters,
      entryTypes: undefined,
    });
    handleCategoryMenuClose();
  };

  const importantMomentsSelected = IMPORTANT_FILTER_VALUES.some((value) => filters.entryTypes?.includes(value));
  const selectedCategoryType = (filters.entryTypes || []).find((type) => CATEGORY_FILTER_VALUES.includes(type));
  const selectedCategoryOption = [...entryType.items, ...flaggedAs.items].find((option) => option.value === selectedCategoryType);
  const filterTriggerLabel = selectedCategoryOption
    ? `${selectedCategoryOption.icon} ${selectedCategoryOption.label}`
    : importantMomentsSelected
      ? `⭐ ${SPECIAL_FILTER_TYPES.importantMoment.titlePrefix}`
      : 'Filters';

  // User role options - CLEAN VERSION
  const userRoleOptions = [
    { value: 'care_owner', label: '👑 Care Owner' },
    { value: 'care_partner', label: '👨‍👩‍👧‍👦 Care Partner' },
    { value: 'caregiver', label: '👤 Caregiver' },
    { value: 'therapist', label: '🩺 Therapist' }
  ];

  const activeFiltersCount = Object.keys(filters).filter(key => 
    key !== 'selectedDate' && filters[key]?.length > 0
  ).length;
  const useCompactMobileLayout = compact && (mobileLayout || isMobile);
  const mobileControlHeight = 30;

  if (compact) {
    // Compact mode for header display
    return (
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              alignItems: 'center',
              flexWrap: useCompactMobileLayout ? 'nowrap' : 'wrap',
              overflowX: useCompactMobileLayout ? 'auto' : 'visible',
              overflowY: 'hidden',
              WebkitOverflowScrolling: 'touch',
              overscrollBehaviorX: 'contain',
              scrollSnapType: useCompactMobileLayout ? 'x proximity' : 'none',
              pb: useCompactMobileLayout ? 0.25 : 0,
              pr: useCompactMobileLayout ? 0.5 : 0,
              position: 'static',
              backgroundColor: 'transparent',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': {
                display: 'none',
              },
              ...(useCompactMobileLayout
                ? {
                    width: '100%',
                    minWidth: 0,
                  }
                : {}),
              ...sx,
            }}
          >
        {useCompactMobileLayout ? (
          searchExpanded || searchText ? (
            <TextField
              size="small"
              placeholder="Search entries..."
              value={searchText}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />,
                endAdornment: (
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSearchExpanded(false);
                      setSearchText('');
                      onFiltersChange({
                        ...filters,
                        searchText: undefined,
                      });
                    }}
                    sx={{ mr: -0.5 }}
                  >
                    <ClearIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                ),
                sx: { height: mobileControlHeight, fontSize: '0.78rem' }
              }}
              sx={{
                minWidth: 170,
                width: 'auto',
                flex: useCompactMobileLayout ? '0 0 auto' : '1 1 220px',
                mr: 0.5,
                contain: 'none',
                transform: 'none',
                willChange: 'auto',
                '& .MuiInputBase-root': {
                  borderRadius: '0 !important',
                },
                '& .MuiOutlinedInput-root': {
                  height: mobileControlHeight,
                  borderRadius: '0 !important',
                  contain: 'none',
                  transform: 'none',
                  willChange: 'auto',
                  backgroundColor: colors.app.cards.background,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderRadius: '0 !important',
                  },
                  '& .MuiInputBase-input': {
                    height: '100%',
                    boxSizing: 'border-box',
                  },
                  '& input': {
                    py: 0,
                    fontSize: '0.8rem',
                    color: theme.palette.text.primary,
                    WebkitTextFillColor: theme.palette.text.primary,
                  },
                  '& .MuiSvgIcon-root': {
                    color: theme.palette.text.secondary,
                  }
                }
              }}
            />
              ) : (
                <Button
                  startIcon={<SearchIcon sx={{ fontSize: 16 }} />}
                  onClick={() => setSearchExpanded(true)}
                  variant="outlined"
                  sx={{
                height: mobileControlHeight,
                px: 1.2,
                pl: 1.2,
                minWidth: 'auto',
                flex: useCompactMobileLayout ? '0 0 auto' : '1 1 220px',
                mr: 0.5,
                borderRadius: 0.25,
                textTransform: 'none',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'text.primary',
                borderColor: colors.app.cards.border,
                backgroundColor: colors.app.cards.shadowPanel,
                boxShadow: 'none',
                contain: 'none',
                transform: 'none',
                willChange: 'auto',
                '&:hover': {
                  backgroundColor: colors.app.cards.background,
                  borderColor: colors.app.cards.border,
                },
              }}
            >
              Search
            </Button>
          )
        ) : (
          <TextField
            size="small"
            placeholder="Search entries..."
            value={searchText}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />,
              sx: { height: 24, fontSize: '0.75rem' }
            }}
            sx={{
              minWidth: 120,
              width: 'auto',
              flex: '0 0 auto',
              '& .MuiInputBase-root': {
                borderRadius: '0 !important',
              },
              '& .MuiOutlinedInput-root': {
                height: isMobile ? 28 : 24,
                borderRadius: '0 !important',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderRadius: '0 !important',
                },
                '& input': {
                  py: 0,
                  fontSize: isMobile ? '0.8rem' : '0.75rem'
                }
              }
            }}
          />
        )}

        {/* Date Picker */}
        {!hideDateFilter && (
          <>
            <Chip
              size="small"
              icon={<CalendarIcon sx={{ fontSize: 14 }} />}
              label={selectedDate?.toLocaleDateString() || 'Select Date'}
              onClick={handleDatePickerOpen}
              variant="outlined"
              sx={{ fontSize: useCompactMobileLayout ? '0.78rem' : '0.7rem', height: useCompactMobileLayout ? 30 : 24, flex: '0 0 auto', borderRadius: 0.35 }}
            />
            
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
                  entries={[]} 
                  onDayClick={(day, dayEntries, date) => handleDateChange(date)}
                  currentMonth={selectedDate || new Date()}
                  selectedDate={selectedDate}
                />
              </Box>
            </Popover>
          </>
        )}

              <Button
              endIcon={<ArrowDropDownIcon />}
              onClick={handleCategoryMenuOpen}
              variant={selectedCategoryType || importantMomentsSelected ? 'contained' : 'outlined'}
              color={selectedCategoryType || importantMomentsSelected ? 'primary' : 'inherit'}
              sx={{
            fontSize: useCompactMobileLayout ? '0.78rem' : '0.7rem',
            height: useCompactMobileLayout ? mobileControlHeight : 24,
            flex: '0 0 auto',
            px: useCompactMobileLayout ? 1.2 : 1,
            minWidth: 'auto',
              borderRadius: useCompactMobileLayout ? 9999 : undefined,
                textTransform: 'none',
                fontWeight: 700,
                color: selectedCategoryType || importantMomentsSelected ? undefined : 'text.primary',
              borderColor: selectedCategoryType || importantMomentsSelected ? undefined : colors.app.cards.border,
              backgroundColor: selectedCategoryType || importantMomentsSelected ? undefined : colors.app.cards.shadowPanel,
            boxShadow: 'none',
            contain: 'none',
            transform: 'none',
              willChange: 'auto',
              '&:hover': {
                backgroundColor: selectedCategoryType || importantMomentsSelected ? undefined : colors.app.cards.background,
                borderColor: selectedCategoryType || importantMomentsSelected ? undefined : colors.app.cards.border,
              },
            }}
        >
          {filterTriggerLabel}
        </Button>

        <Popover
          open={Boolean(categoryMenuAnchor)}
          anchorEl={categoryMenuAnchor}
          onClose={handleCategoryMenuClose}
          disableScrollLock
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          <Box sx={{ p: 0.75, minWidth: 180 }}>
            <MenuItem onClick={clearEntryTypeFilters}>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>{allEntries.label}</Typography>
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />

            <Typography
              sx={{
                px: 1,
                pb: 0.5,
                pt: 0.25,
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'text.secondary',
              }}
            >
              {entryType.label}
            </Typography>
            {entryType.items.map((option) => (
              <MenuItem key={option.value} onClick={() => setCategoryTypeFilter(option.value)}>
                <Typography sx={{ mr: 1, fontSize: '1rem' }}>{option.icon}</Typography>
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>{option.label}</Typography>
              </MenuItem>
            ))}

            <Divider sx={{ my: 0.5 }} />
            <Typography
              sx={{
                px: 1,
                pb: 0.5,
                pt: 0.25,
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'text.secondary',
              }}
            >
              {flaggedAs.label}
            </Typography>
            <MenuItem
              onClick={() => {
                const currentTypes = filters.entryTypes || [];
                const remainingTypes = currentTypes.filter((type) => !IMPORTANT_FILTER_VALUES.includes(type));
                onFiltersChange({
                  ...filters,
                  entryTypes: importantMomentsSelected
                    ? (remainingTypes.length > 0 ? remainingTypes : undefined)
                    : [...remainingTypes, ...IMPORTANT_FILTER_VALUES],
                });
                handleCategoryMenuClose();
              }}
            >
              <Typography sx={{ mr: 1, fontSize: '1rem' }}>⭐</Typography>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>{SPECIAL_FILTER_TYPES.importantMoment.label}</Typography>
            </MenuItem>
            {flaggedAs.items.map((option) => (
              <MenuItem key={option.value} onClick={() => setCategoryTypeFilter(option.value)}>
                <Typography sx={{ mr: 1, fontSize: '1rem' }}>{option.icon}</Typography>
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>{option.label}</Typography>
              </MenuItem>
            ))}
          </Box>
        </Popover>

        {/* Clear All Filters */}
        {(Object.keys(filters).length > 0 || searchText) && (
            <IconButton
              size="small"
              onClick={clearAllFilters}
              sx={{
                width: useCompactMobileLayout ? 30 : 24,
                height: useCompactMobileLayout ? 30 : 24,
                flex: '0 0 auto',
                borderRadius: 9999,
                backgroundColor: colors.app.cards.shadowPanel,
                border: `1px solid ${colors.app.cards.border}`,
              }}
            title="Clear all filters"
          >
            <ClearIcon sx={{ fontSize: useCompactMobileLayout ? 16 : 14 }} />
          </IconButton>
        )}
      </Box>
    );
  }

  // Full mode for main timeline display
  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 1.5, md: 2 },
        mb: 2,
        borderRadius: { xs: 0.35, md: 0.35 },
        ...sx,
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
          Timeline Filters
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Filter timeline entries by type, who logged them, or jump to a specific date
        </Typography>
      </Box>

      {/* Entry Type Filters */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
          ENTRY TYPES
        </Typography>
        <ToggleButton
          value="importantMoments"
          selected={importantMomentsSelected}
          onChange={() => {
            const currentTypes = filters.entryTypes || [];
            const remainingTypes = currentTypes.filter((type) => !IMPORTANT_FILTER_VALUES.includes(type));
            onFiltersChange({
              ...filters,
              entryTypes: importantMomentsSelected
                ? (remainingTypes.length > 0 ? remainingTypes : undefined)
                : [...remainingTypes, ...IMPORTANT_FILTER_VALUES],
            });
          }}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1.5,
            py: 0.5,
            fontSize: '0.75rem',
            textTransform: 'none',
            border: '1px solid',
            borderColor: colors.app.cards.border,
            borderRadius: 0.35,
            '&.Mui-selected': {
              bgcolor: colors.app.dailyCare.background,
              borderColor: colors.app.dailyCare.primary,
              color: colors.app.dailyCare.primary
            }
          }}
        >
          ⭐ {SPECIAL_FILTER_TYPES.importantMoment.label}
        </ToggleButton>
      </Box>

      {/* User Role Filter */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Who logged it</InputLabel>
          <Select
            value={filters.userRoles || []}
            onChange={handleUserRoleFilter}
            multiple
            label="Who logged it"
            startAdornment={<PersonIcon sx={{ fontSize: 16, mr: 0.5 }} />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => {
                  const option = userRoleOptions.find(opt => opt.value === value);
                  return (
                    <Chip key={value} label={option?.label || value} size="small" />
                  );
                })}
              </Box>
            )}
          >
            {userRoleOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Date Picker */}
        <TextField
          type="date"
          label="Jump to date"
          size="small"
          value={selectedDate.toISOString().split('T')[0]}
          onChange={handleDateChange}
          InputProps={{
            startAdornment: <DateIcon sx={{ fontSize: 16, mr: 0.5 }} />
          }}
          sx={{ minWidth: 160, '& .MuiOutlinedInput-root': { borderRadius: 0.35, backgroundColor: colors.app.cards.background } }}
        />
      </Box>

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <>
          <Divider sx={{ mb: 1, borderColor: colors.app.cards.border }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
            </Typography>
            <Typography 
              variant="caption" 
              color="primary" 
              sx={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={clearAllFilters}
            >
              Clear all filters
            </Typography>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default TimelineFilters;
