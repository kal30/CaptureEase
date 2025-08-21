import React, { useState } from 'react';
import {
  Box,
  TextField,
  Chip,
  Typography,
  Card,
  CardContent,
  Collapse,
  IconButton,
  Grid,
  Button,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  DateRange as DateRangeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { TIMELINE_TYPES } from '../../services/timelineService';

const TimelineFilters = ({ filters, onFiltersChange, totalEntries, filteredEntries }) => {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();

  const handleFilterChange = (newFilters) => {
    onFiltersChange({ ...filters, ...newFilters });
  };

  const handleTypeToggle = (type) => {
    const currentTypes = filters.types || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    handleFilterChange({ types: newTypes });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      types: [],
      startDate: null,
      endDate: null,
      searchText: '',
      author: ''
    });
  };

  const hasActiveFilters = 
    (filters.types && filters.types.length > 0) ||
    filters.startDate ||
    filters.endDate ||
    filters.searchText ||
    filters.author;

  const activeFilterCount = [
    filters.types?.length > 0,
    filters.startDate,
    filters.endDate,
    filters.searchText,
    filters.author
  ].filter(Boolean).length;

  return (
    <Card elevation={0} sx={{ mb: 3, border: `1px solid ${theme.palette.divider}` }}>
      <CardContent sx={{ pb: expanded ? 2 : '16px !important' }}>
        {/* Header with Search and Filter Toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: expanded ? 2 : 0 }}>
          {/* Search Field */}
          <TextField
            placeholder="Search timeline entries..."
            variant="outlined"
            size="small"
            value={filters.searchText || ''}
            onChange={(e) => handleFilterChange({ searchText: e.target.value })}
            sx={{ flex: 1, maxWidth: 400 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: filters.searchText && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => handleFilterChange({ searchText: '' })}
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          {/* Results Count */}
          <Typography variant="body2" color="text.secondary">
            {filteredEntries} of {totalEntries} entries
          </Typography>

          {/* Filter Toggle Button */}
          <Button
            variant="outlined"
            size="small"
            startIcon={<FilterIcon />}
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setExpanded(!expanded)}
            sx={{
              color: hasActiveFilters ? theme.palette.primary.main : 'text.secondary',
              borderColor: hasActiveFilters ? theme.palette.primary.main : theme.palette.divider,
              bgcolor: hasActiveFilters ? alpha(theme.palette.primary.main, 0.04) : 'transparent'
            }}
          >
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="text"
              size="small"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              color="secondary"
            >
              Clear
            </Button>
          )}
        </Box>

        {/* Expanded Filters */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Grid container spacing={3}>
            {/* Entry Type Filters */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Entry Types
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Object.values(TIMELINE_TYPES).map(type => {
                  const isSelected = filters.types?.includes(type.type);
                  return (
                    <Chip
                      key={type.type}
                      label={`${type.icon} ${type.label}`}
                      variant={isSelected ? 'filled' : 'outlined'}
                      onClick={() => handleTypeToggle(type.type)}
                      sx={{
                        bgcolor: isSelected ? alpha(type.color, 0.1) : 'transparent',
                        borderColor: isSelected ? type.color : theme.palette.divider,
                        color: isSelected ? type.color : 'text.secondary',
                        '&:hover': {
                          bgcolor: alpha(type.color, 0.1),
                          borderColor: type.color
                        }
                      }}
                    />
                  );
                })}
              </Box>
            </Grid>

            {/* Date Range Filters */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Date Range
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  label="From"
                  type="date"
                  size="small"
                  value={filters.startDate ? filters.startDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleFilterChange({ 
                    startDate: e.target.value ? new Date(e.target.value) : null 
                  })}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    max: filters.endDate ? filters.endDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
                  }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="To"
                  type="date"
                  size="small"
                  value={filters.endDate ? filters.endDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleFilterChange({ 
                    endDate: e.target.value ? new Date(e.target.value) : null 
                  })}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    min: filters.startDate ? filters.startDate.toISOString().split('T')[0] : undefined,
                    max: new Date().toISOString().split('T')[0]
                  }}
                  sx={{ flex: 1 }}
                />
              </Box>
            </Grid>

            {/* Author Filter */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Author
              </Typography>
              <TextField
                placeholder="Filter by author name..."
                variant="outlined"
                size="small"
                fullWidth
                value={filters.author || ''}
                onChange={(e) => handleFilterChange({ author: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            {/* Quick Date Filters */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Quick Filters
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {[
                  { label: 'Today', days: 0 },
                  { label: 'Last 7 days', days: 7 },
                  { label: 'Last 30 days', days: 30 },
                  { label: 'Last 90 days', days: 90 }
                ].map(({ label, days }) => {
                  const startDate = new Date();
                  startDate.setDate(startDate.getDate() - days);
                  
                  return (
                    <Chip
                      key={label}
                      label={label}
                      variant="outlined"
                      size="small"
                      onClick={() => handleFilterChange({
                        startDate: days === 0 ? new Date() : startDate,
                        endDate: new Date()
                      })}
                      sx={{
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          borderColor: theme.palette.primary.main
                        }
                      }}
                    />
                  );
                })}
              </Box>
            </Grid>
          </Grid>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default TimelineFilters;