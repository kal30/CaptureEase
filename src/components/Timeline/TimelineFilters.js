import React, { useState } from 'react';
import {
  Box,
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
import {
  Person as PersonIcon,
  Today as DateIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  CalendarToday as CalendarIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from '@mui/icons-material';
import MiniCalendar from '../UI/MiniCalendar';

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
  hideDateFilter = false,
  sx = {}
}) => {
  const [datePickerAnchor, setDatePickerAnchor] = useState(null);
  const [categoryMenuAnchor, setCategoryMenuAnchor] = useState(null);
  const [searchText, setSearchText] = useState(filters.searchText || '');

  const IMPORTANT_FILTER_VALUES = ['incident', 'importantMoment'];
  const CATEGORY_FILTER_VALUES = ['behavior', 'milestone', 'sleep', 'food', 'mood', 'health', 'journal'];

  const categoryFilterOptions = [
    { value: 'behavior', label: 'Behavior', icon: '🌋' },
    { value: 'milestone', label: 'Win', icon: '⭐' },
    { value: 'sleep', label: 'Sleep', icon: '😴' },
    { value: 'food', label: 'Food', icon: '🍽️' },
    { value: 'mood', label: 'Anxiety', icon: '😰' },
    { value: 'health', label: 'Medication', icon: '💊' },
    { value: 'journal', label: 'Daily Log', icon: '📓' },
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

  const importantMomentsSelected = IMPORTANT_FILTER_VALUES.some((value) => filters.entryTypes?.includes(value));
  const selectedCategoryType = (filters.entryTypes || []).find((type) => CATEGORY_FILTER_VALUES.includes(type));

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

  if (compact) {
    // Compact mode for header display
    return (
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', ...sx }}>
        {/* Search Field */}
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
            '& .MuiOutlinedInput-root': {
              height: 24,
              '& input': {
                py: 0,
                fontSize: '0.75rem'
              }
            }
          }}
        />

        {/* Date Picker */}
        {!hideDateFilter && (
          <>
            <Chip
              size="small"
              icon={<CalendarIcon sx={{ fontSize: 14 }} />}
              label={selectedDate?.toLocaleDateString() || 'Select Date'}
              onClick={handleDatePickerOpen}
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 24 }}
            />
            
            <Popover
              open={Boolean(datePickerAnchor)}
              anchorEl={datePickerAnchor}
              onClose={handleDatePickerClose}
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

        <Chip
          label="⭐ Important Moments"
          size="small"
          variant={importantMomentsSelected ? 'filled' : 'outlined'}
          color={importantMomentsSelected ? 'secondary' : 'default'}
          onClick={() => {
            const currentTypes = filters.entryTypes || [];
            const remainingTypes = currentTypes.filter((type) => !IMPORTANT_FILTER_VALUES.includes(type));
            onFiltersChange({
              ...filters,
              entryTypes: importantMomentsSelected
                ? (remainingTypes.length > 0 ? remainingTypes : undefined)
                : [...remainingTypes, ...IMPORTANT_FILTER_VALUES],
            });
          }}
          sx={{ fontSize: '0.7rem', height: 24 }}
        />

        <Chip
          label="All"
          deleteIcon={<ArrowDropDownIcon />}
          onDelete={handleCategoryMenuOpen}
          onClick={handleCategoryMenuOpen}
          size="small"
          variant={selectedCategoryType ? 'filled' : 'outlined'}
          sx={{ fontSize: '0.7rem', height: 24 }}
        />

        <Popover
          open={Boolean(categoryMenuAnchor)}
          anchorEl={categoryMenuAnchor}
          onClose={handleCategoryMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          <Box sx={{ p: 1, minWidth: 180 }}>
            <MenuItem onClick={() => setCategoryTypeFilter(undefined)}>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>All entries</Typography>
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            {categoryFilterOptions.map((option) => (
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
            sx={{ width: 24, height: 24 }}
            title="Clear all filters"
          >
            <ClearIcon sx={{ fontSize: 14 }} />
          </IconButton>
        )}
      </Box>
    );
  }

  // Full mode for main timeline display
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2, ...sx }}>
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
            borderColor: 'divider',
            '&.Mui-selected': {
              bgcolor: 'secondary.50',
              borderColor: 'secondary.main',
              color: 'secondary.main'
            }
          }}
        >
          ⭐ Important Moments
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
          sx={{ minWidth: 160 }}
        />
      </Box>

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <>
          <Divider sx={{ mb: 1 }} />
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
