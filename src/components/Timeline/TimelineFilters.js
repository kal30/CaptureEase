import React, { useState } from 'react';
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
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
  Warning as IncidentIcon,
  EventNote as JournalIcon,
  Assignment as DailyLogIcon,
  CheckCircle as FollowUpIcon,
  Person as PersonIcon,
  Today as DateIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';

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
  summary = {},
  compact = false,
  sx = {}
}) => {
  const [datePickerAnchor, setDatePickerAnchor] = useState(null);
  const [searchText, setSearchText] = useState(filters.searchText || '');

  const handleEntryTypeFilter = (event, newTypes) => {
    onFiltersChange({
      ...filters,
      entryTypes: newTypes
    });
  };

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

  // Entry type options with icons and counts
  const entryTypeOptions = [
    { 
      value: 'incident', 
      label: 'Incidents', 
      icon: <IncidentIcon sx={{ fontSize: 16 }} />,
      count: summary.incidentCount || 0,
      color: 'error'
    },
    { 
      value: 'journal', 
      label: 'Journal', 
      icon: <JournalIcon sx={{ fontSize: 16 }} />,
      count: summary.journalCount || 0,
      color: 'info'
    },
    { 
      value: 'dailyLog', 
      label: 'Care Logs', 
      icon: <DailyLogIcon sx={{ fontSize: 16 }} />,
      count: summary.dailyLogCount || 0,
      color: 'primary'
    },
    { 
      value: 'followUp', 
      label: 'Follow-ups', 
      icon: <FollowUpIcon sx={{ fontSize: 16 }} />,
      count: summary.followUpCount || 0,
      color: 'success'
    }
  ];

  // User role options
  const userRoleOptions = [
    { value: 'primary_parent', label: '👑 Primary Parent' },
    { value: 'co_parent', label: '👨‍👩‍👧‍👦 Co-Parent' },
    { value: 'family_member', label: '👵 Family' },
    { value: 'caregiver', label: '🤱 Caregiver' },
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
        >
          <Box sx={{ p: 1 }}>
            <TextField
              type="date"
              size="small"
              value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
              onChange={(e) => handleDateChange(new Date(e.target.value))}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </Popover>

        {/* Entry Type Chips */}
        {entryTypeOptions.map((option) => {
          const isActive = filters.entryTypes?.includes(option.value);
          return (
            <Chip
              key={option.value}
              label={`${option.label} (${option.count})`}
              size="small"
              variant={isActive ? 'filled' : 'outlined'}
              color={isActive ? option.color : 'default'}
              onClick={() => {
                const newTypes = isActive 
                  ? (filters.entryTypes || []).filter(type => type !== option.value)
                  : [...(filters.entryTypes || []), option.value];
                onFiltersChange({
                  ...filters,
                  entryTypes: newTypes.length > 0 ? newTypes : undefined
                });
              }}
              sx={{ fontSize: '0.7rem', height: 24 }}
            />
          );
        })}

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
        <ToggleButtonGroup
          value={filters.entryTypes || []}
          onChange={handleEntryTypeFilter}
          size="small"
          sx={{ flexWrap: 'wrap', gap: 0.5 }}
        >
          {entryTypeOptions.map((option) => (
            <ToggleButton
              key={option.value}
              value={option.value}
              disabled={option.count === 0}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.5,
                py: 0.5,
                fontSize: '0.75rem',
                textTransform: 'none',
                border: '1px solid',
                borderColor: 'divider',
                '&.Mui-selected': {
                  bgcolor: `${option.color}.50`,
                  borderColor: `${option.color}.main`,
                  color: `${option.color}.main`
                }
              }}
            >
              {option.icon}
              {option.label}
              <Chip 
                label={option.count} 
                size="small" 
                sx={{ 
                  height: 16, 
                  fontSize: '0.6rem',
                  ml: 0.5,
                  bgcolor: option.count > 0 ? `${option.color}.100` : 'action.disabled'
                }} 
              />
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
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