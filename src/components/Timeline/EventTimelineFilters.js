import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  TextField,
  IconButton,
  Collapse,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Divider,
  Tooltip,
  Badge
} from '@mui/material';
import {
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
  DateRange as DateRangeIcon,
  Category as CategoryIcon,
  Source as SourceIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

/**
 * EventTimelineFilters - Filter controls for Event-based Timeline
 *
 * Features:
 * - Child selection dropdown
 * - Date range picker (start/end dates)
 * - Bucket/category filter
 * - Source filter (SMS, WhatsApp, Web, etc.)
 * - Text search
 * - Filter summary and clear functionality
 *
 * @param {Object} props
 * @param {Object} props.filters - Current filter state
 * @param {Function} props.onFiltersChange - Callback when filters change
 * @param {Function} props.onChildChange - Callback when child selection changes
 * @param {Array} props.children - Available children
 * @param {Object} props.currentChild - Currently selected child
 * @param {Object} props.metrics - Timeline metrics for filter counts
 */
const EventTimelineFilters = ({
  filters = {},
  onFiltersChange,
  onChildChange,
  children = [],
  currentChild,
  metrics = {}
}) => {
  const [expanded, setExpanded] = useState(false);
  const [searchText, setSearchText] = useState(filters.searchText || '');

  // Available source options based on metrics
  const sourceOptions = [
    { value: 'sms', label: 'SMS', icon: '💬', count: metrics.sourceCounts?.sms || 0 },
    { value: 'whatsapp', label: 'WhatsApp', icon: '💚', count: metrics.sourceCounts?.whatsapp || 0 },
    { value: 'web', label: 'Web', icon: '🌐', count: metrics.sourceCounts?.web || 0 },
    { value: 'email', label: 'Email', icon: '📧', count: metrics.sourceCounts?.email || 0 },
    { value: 'app', label: 'App', icon: '📱', count: metrics.sourceCounts?.app || 0 }
  ].filter(option => option.count > 0);

  // Available bucket options (from metrics or common categories)
  const bucketOptions = metrics.buckets || [
    'Medical', 'Behavior', 'Mood', 'Sleep', 'Nutrition', 'Activities', 'Education', 'Social', 'Therapy'
  ];

  // Handle filter changes
  const handleChildChange = useCallback((event) => {
    const childId = event.target.value;
    const child = children.find(c => c.id === childId);
    if (child && onChildChange) {
      onChildChange(childId);
    }
  }, [children, onChildChange]);

  const handleDateRangeChange = useCallback((field, date) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: date
      }
    });
  }, [filters, onFiltersChange]);

  const handleSourcesChange = useCallback((event, newSources) => {
    onFiltersChange({
      ...filters,
      sources: newSources
    });
  }, [filters, onFiltersChange]);

  const handleBucketsChange = useCallback((event) => {
    const value = event.target.value;
    onFiltersChange({
      ...filters,
      buckets: typeof value === 'string' ? value.split(',') : value
    });
  }, [filters, onFiltersChange]);

  const handleSearchChange = useCallback((event) => {
    const value = event.target.value;
    setSearchText(value);
    onFiltersChange({
      ...filters,
      searchText: value || undefined
    });
  }, [filters, onFiltersChange]);

  const clearAllFilters = useCallback(() => {
    setSearchText('');
    onFiltersChange({
      childId: filters.childId // Keep child selection
    });
  }, [filters.childId, onFiltersChange]);

  // Count active filters
  const activeFilterCount = [
    filters.dateRange?.startDate,
    filters.dateRange?.endDate,
    filters.sources?.length > 0,
    filters.buckets?.length > 0,
    filters.searchText
  ].filter(Boolean).length;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper variant="outlined" sx={{ mb: 3 }}>
        {/* Filter Header */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Badge badgeContent={activeFilterCount} color="primary">
                <FilterIcon color="action" />
              </Badge>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Timeline Filters
              </Typography>
            </Box>

            {/* Quick search */}
            <TextField
              size="small"
              placeholder="Search events..."
              value={searchText}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
              }}
              sx={{ minWidth: 200 }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {activeFilterCount > 0 && (
              <Tooltip title="Clear all filters">
                <IconButton size="small" onClick={clearAllFilters}>
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            )}
            <IconButton onClick={() => setExpanded(!expanded)}>
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>

        {/* Expanded Filter Controls */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Stack spacing={3}>
              {/* Row 1: Child Selection and Date Range */}
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                {/* Child Selection */}
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Child</InputLabel>
                  <Select
                    value={currentChild?.id || ''}
                    onChange={handleChildChange}
                    label="Child"
                    startAdornment={<PersonIcon sx={{ fontSize: 16, mr: 0.5 }} />}
                  >
                    {children.map((child) => (
                      <MenuItem key={child.id} value={child.id}>
                        {child.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Date Range */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <DateRangeIcon sx={{ color: 'text.secondary' }} />
                  <DatePicker
                    label="Start Date"
                    value={filters.dateRange?.startDate}
                    onChange={(date) => handleDateRangeChange('startDate', date)}
                    slotProps={{ textField: { size: 'small' } }}
                  />
                  <Typography variant="body2" color="text.secondary">to</Typography>
                  <DatePicker
                    label="End Date"
                    value={filters.dateRange?.endDate}
                    onChange={(date) => handleDateRangeChange('endDate', date)}
                    slotProps={{ textField: { size: 'small' } }}
                  />
                </Box>
              </Stack>

              {/* Row 2: Sources */}
              {sourceOptions.length > 0 && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                    <SourceIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                    SOURCES
                  </Typography>
                  <ToggleButtonGroup
                    value={filters.sources || []}
                    onChange={handleSourcesChange}
                    size="small"
                    sx={{ flexWrap: 'wrap', gap: 0.5 }}
                  >
                    {sourceOptions.map((source) => (
                      <ToggleButton
                        key={source.value}
                        value={source.value}
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          fontSize: '0.75rem',
                          textTransform: 'none',
                          border: '1px solid',
                          borderColor: 'divider',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}
                      >
                        <span>{source.icon}</span>
                        {source.label}
                        <Chip
                          label={source.count}
                          size="small"
                          sx={{
                            height: 16,
                            fontSize: '0.6rem',
                            ml: 0.5
                          }}
                        />
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </Box>
              )}

              {/* Row 3: Buckets/Categories */}
              {bucketOptions.length > 0 && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                    <CategoryIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                    CATEGORIES
                  </Typography>
                  <FormControl size="small" sx={{ minWidth: 250 }}>
                    <InputLabel>Filter by category</InputLabel>
                    <Select
                      value={filters.buckets || []}
                      onChange={handleBucketsChange}
                      multiple
                      label="Filter by category"
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      {bucketOptions.map((bucket) => (
                        <MenuItem key={bucket} value={bucket}>
                          {bucket}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}
            </Stack>

            {/* Active Filters Summary */}
            {activeFilterCount > 0 && (
              <>
                <Divider sx={{ mt: 2, mb: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
                  </Typography>
                  <Typography
                    variant="caption"
                    color="primary"
                    sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={clearAllFilters}
                  >
                    Clear all
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </Collapse>
      </Paper>
    </LocalizationProvider>
  );
};

export default EventTimelineFilters;