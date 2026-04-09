import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Popover,
  useMediaQuery,
  Stack,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Timeline as TimelineIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import MiniCalendar from './MiniCalendar';
import { UnifiedTimeline, TimelineFilters } from '../Timeline';
import { useTimelineProgress } from '../../hooks/useTimelineProgress';
import { trackRenderDebug, useMountDebug } from '../../utils/renderDebug';
import { CATEGORY_COLORS } from '../../constants/categoryColors';
import { getCanonicalEntryDisplayInfo, getLogTypeByCategory, getLogTypeByEntry } from '../../constants/logTypeRegistry';

/**
 * TimelineWidget - Self-contained timeline component with progress visualization and unified daily log
 * Mobile-friendly, uses existing UI components, minimal sx usage
 * 
 * @param {Object} props
 * @param {Object} props.child - Child object
 * @param {Array} props.entries - Timeline entries for the child
 * @param {Object} props.dailyCareStatus - Daily care completion status
 * @param {boolean} props.defaultExpanded - Whether widget starts expanded
 * @param {string} props.variant - Display variant: 'compact', 'full'
 * @param {boolean} props.showUnifiedLog - Whether to show enhanced daily log (default: true)
 */
const TimelineWidget = ({
  child,
  entries = [],
  dailyCareStatus = {},
  onQuickEntry,
  defaultExpanded = false,
  expanded: controlledExpanded,
  variant = 'full',
  showUnifiedLog = true,
  forceMobileLayout = false,
}) => {
  const theme = useTheme();
  const isMobileBreakpoint = useMediaQuery(theme.breakpoints.down('md'));
  const isMobile = forceMobileLayout || isMobileBreakpoint;
  useMountDebug('TimelineWidget');
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mobileCalendarAnchor, setMobileCalendarAnchor] = useState(null);
  const [focusedEntryId, setFocusedEntryId] = useState(null);

  const [timelineFilters, setTimelineFilters] = useState({}); // Unified timeline filters
  
  const childSpecificEntries = entries;
  const searchText = timelineFilters.searchText?.trim() || '';
  
  const timeline = useTimelineProgress(childSpecificEntries, dailyCareStatus);
  trackRenderDebug('TimelineWidget', {
    childId: child?.id || 'none',
    expanded,
    selectedDate: selectedDate.toDateString(),
    entries: entries.length,
    recentEntries: timeline.recentEntries.length,
  });

  useEffect(() => {
    if (typeof controlledExpanded === 'boolean') {
      setExpanded(controlledExpanded);
    }
  }, [controlledExpanded]);

  useEffect(() => {
    if (!searchText) {
      setFocusedEntryId(null);
    }
  }, [searchText]);

  useEffect(() => {
    const handleTimelineFocusDate = (event) => {
      const detail = event?.detail || {};
      if (detail.childId && detail.childId !== child?.id) {
        return;
      }

      const nextDate = detail.date
        ? new Date(detail.date)
        : detail.timestamp
          ? new Date(detail.timestamp)
          : null;

      if (!nextDate || Number.isNaN(nextDate.getTime())) {
        return;
      }

      setSelectedDate(nextDate);
      setExpanded(true);
    };

    window.addEventListener('captureez:timeline-focus-date', handleTimelineFocusDate);
    return () => window.removeEventListener('captureez:timeline-focus-date', handleTimelineFocusDate);
  }, [child?.id]);
  
  // Component styles - mobile-first responsive
  const widgetStyles = {
    bgcolor: 'background.paper',
    border: 'none',
    borderRadius: { xs: 0.6, md: 0.6 },
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    '&:hover': {
      boxShadow: '0 8px 28px rgba(15, 23, 42, 0.07)',
    }
  };

  const headerStyles = {
    p: { xs: 2, md: 3 },
    bgcolor: 'rgba(248, 250, 252, 0.92)',
    borderBottom: expanded ? '1px solid' : 'none',
    borderBottomColor: 'rgba(148, 163, 184, 0.16)',
    cursor: 'pointer',
  };

  const contentStyles = {
    p: { xs: 2, md: 3 }
  };

  const handleDayClick = (day, dayEntries, date) => {
    if (showUnifiedLog) {
      setSelectedDate(date);
      if (!expanded) {
        setExpanded(true);
      }
    }
  };

  const handleMobileDateChange = (date) => {
    setSelectedDate(date);
    setMobileCalendarAnchor(null);
    if (!expanded) {
      setExpanded(true);
    }
  };

  const handleEmptyStateClick = () => {
    onQuickEntry?.(child, 'quick_note');
  };

  const normalizeSearchableText = (entry) => [
    entry.text,
    entry.description,
    entry.summary,
    entry.content,
    entry.notes,
    entry.note,
    entry.title,
    entry.categoryLabel,
    entry.categoryId,
    entry.category,
    entry.incidentCategoryLabel,
    entry.incidentType,
    entry.resolution,
    ...(entry.triggers || []),
    ...(entry.interventions || []),
    ...(entry.tags || []),
  ].filter(Boolean).join(' ').toLowerCase();

  const getSearchCategoryLabel = (entry) => {
    const categoryDisplay = getCanonicalEntryDisplayInfo(entry);
    const categoryType = getLogTypeByEntry(entry);
    const categoryMeta = getLogTypeByCategory(categoryType.category || entry.category || entry.type);

    if (entry.collection === 'incidents') {
      return entry.incidentCategoryLabel || entry.incidentType || 'Incident';
    }
    if (entry.collection === 'dailyCare') {
      return entry.categoryLabel || entry.categoryId || 'Habit';
    }
    if (entry.collection === 'therapyNotes') {
      return entry.title || 'Therapy Note';
    }
    if (entry.collection === 'dailyLogs') {
      return entry.titlePrefix || entry.title || entry.label || categoryDisplay.label || entry.category || entry.type || 'Log';
    }
    return entry.title || entry.category || entry.type || 'Entry';
  };

  const searchResults = React.useMemo(() => {
    if (!searchText) {
      return [];
    }

    const searchTerm = searchText.toLowerCase();
    const entryTypeFilters = timelineFilters.entryTypes || [];
    const userRoleFilters = timelineFilters.userRoles || [];

    const filtered = childSpecificEntries
      .filter((entry) => {
        if (entryTypeFilters.length > 0 && !entryTypeFilters.includes(entry.type)) {
          return false;
        }

        if (userRoleFilters.length > 0 && !userRoleFilters.includes(entry.userRole)) {
          return false;
        }

        return normalizeSearchableText(entry).includes(searchTerm);
      })
      .map((entry) => {
        const entryDate = entry.timestamp?.toDate ? entry.timestamp.toDate() : new Date(entry.timestamp);
        const previewSource = entry.text || entry.summary || entry.content || entry.description || entry.notes || entry.note || '';
        const preview = String(previewSource).trim().replace(/\s+/g, ' ');
        const categoryKey = entry.category || entry.type || 'log';
        const categoryColors = CATEGORY_COLORS[categoryKey] || CATEGORY_COLORS.log;

        return {
          ...entry,
          entryDate,
          preview: preview.length > 100 ? `${preview.slice(0, 100)}...` : preview,
          displayCategory: getSearchCategoryLabel(entry),
          categoryColors,
          timeLabel: entryDate.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
      })
      .sort((a, b) => b.entryDate - a.entryDate);

    const grouped = [];
    const byDate = new Map();

    filtered.forEach((entry) => {
      const dateKey = entry.entryDate.toDateString();
      if (!byDate.has(dateKey)) {
        const group = {
          dateKey,
          date: entry.entryDate,
          entries: [],
        };
        byDate.set(dateKey, group);
        grouped.push(group);
      }

      byDate.get(dateKey).entries.push(entry);
    });

    return grouped;
  }, [childSpecificEntries, searchText, timelineFilters.entryTypes, timelineFilters.userRoles]);

  const searchResultStats = React.useMemo(() => {
    const resultCount = searchResults.reduce((sum, group) => sum + group.entries.length, 0);
    return { resultCount, dayCount: searchResults.length };
  }, [searchResults]);

  const handleSearchResultClick = React.useCallback((entry) => {
    setSelectedDate(entry.entryDate);
    setFocusedEntryId(entry.id);
    setExpanded(true);
  }, []);

  const renderSearchResults = () => {
    if (!searchText) {
      return null;
    }

    if (searchResultStats.resultCount === 0) {
      return (
        <Box
          sx={{
            mt: 1.5,
            p: 2,
            borderRadius: 0.35,
            bgcolor: 'rgba(248, 250, 252, 0.92)',
            border: '1px solid rgba(148, 163, 184, 0.16)',
          }}
        >
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
            No entries found for "{searchText}".
          </Typography>
          <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
            Clear search to return to the normal day view.
          </Typography>
        </Box>
      );
    }

    return (
      <Box
        sx={{
          mt: 1.5,
          p: 1.5,
          borderRadius: 0.35,
          bgcolor: 'rgba(248, 250, 252, 0.92)',
          border: '1px solid rgba(148, 163, 184, 0.16)',
        }}
      >
        <Typography sx={{ fontSize: '0.92rem', fontWeight: 800, color: 'text.primary', mb: 1 }}>
          {searchResultStats.resultCount} result{searchResultStats.resultCount === 1 ? '' : 's'} across {searchResultStats.dayCount} day{searchResultStats.dayCount === 1 ? '' : 's'}
        </Typography>

        <Stack spacing={1.25}>
          {searchResults.map((group) => (
            <Box key={group.dateKey}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: 'text.secondary', mb: 0.75 }}>
                {group.date.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Typography>

              <Stack spacing={0.75}>
                {group.entries.map((entry) => (
                  <Box
                    key={entry.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSearchResultClick(entry)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleSearchResultClick(entry);
                      }
                    }}
                    sx={{
                      p: 1,
                      borderRadius: 0.35,
                      bgcolor: '#fff',
                      border: '1px solid rgba(148, 163, 184, 0.18)',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.6, flexWrap: 'wrap' }}>
                          <Chip
                            label={entry.displayCategory}
                            size="small"
                            sx={{
                              height: 22,
                              borderRadius: 0.35,
                              bgcolor: entry.categoryColors.bg,
                              color: entry.categoryColors.text,
                              border: `1px solid ${entry.categoryColors.border}`,
                              fontSize: '0.72rem',
                              fontWeight: 700,
                            }}
                          />
                          <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: 'text.secondary' }}>
                            {entry.timeLabel}
                          </Typography>
                        </Box>

                        <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: 'text.primary', lineHeight: 1.3 }}>
                          {entry.title || entry.displayCategory}
                        </Typography>

                        {entry.preview ? (
                          <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', lineHeight: 1.35, mt: 0.35 }}>
                            {entry.preview}
                          </Typography>
                        ) : null}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    );
  };

  const getMobileDateLabel = () => {
    const today = new Date();
    const isToday =
      today.getFullYear() === selectedDate.getFullYear() &&
      today.getMonth() === selectedDate.getMonth() &&
      today.getDate() === selectedDate.getDate();

    if (isToday) {
      return 'Today';
    }

    return selectedDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };


  // Render recent entries list
  const renderRecentEntries = () => {
    if (!timeline.recentEntries.length) {
      return (
        <Box
          className="timeline-widget__empty-state"
          onClick={handleEmptyStateClick}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleEmptyStateClick();
            }
          }}
          role="button"
          tabIndex={0}
          sx={{
            textAlign: 'center',
            py: 3,
            px: 2,
            borderRadius: 0.35,
            cursor: 'pointer',
            transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
              backgroundColor: 'action.hover',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
            },
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'primary.main',
              outlineOffset: 2,
            },
          }}
        >
          <TimelineIcon sx={{ fontSize: 24, color: 'text.disabled', mb: 0.5 }} />
          <Typography variant="body2" color="text.secondary">
            No recent activity
          </Typography>
          <Typography variant="caption" color="text.secondary">
            No entries yet today — tap to log something
          </Typography>
        </Box>
      );
    }

    return (
      <List className="timeline-widget__entries" dense>
        {timeline.recentEntries.map((entry, index) => (
          <ListItem
            key={`${entry.type}-${entry.id}`}
            className={`timeline-widget__entry timeline-widget__entry--${entry.type}`}
            sx={{
              borderRadius: 0.35,
              mb: index < timeline.recentEntries.length - 1 ? 1 : 0,
              bgcolor: '#ffffff',
              border: `1px solid ${alpha(entry.color, 0.14)}`,
              boxShadow: '0 6px 16px rgba(15, 23, 42, 0.045)',
              px: 1.25,
              py: 0.75,
            }}
          >
            <ListItemAvatar>
              <Avatar
                sx={{
                  bgcolor: entry.color,
                  width: 32,
                  height: 32,
                  fontSize: '0.875rem'
                }}
              >
                {entry.icon}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={entry.title}
              secondary={timeline.formatTimeAgo(entry.timestamp)}
              primaryTypographyProps={{
                variant: 'body2',
                sx: { fontWeight: 500, mb: 0.25, lineHeight: 1.25 }
              }}
              secondaryTypographyProps={{
                variant: 'caption',
                color: 'text.secondary',
                sx: {
                  fontSize: '0.7rem',
                  fontWeight: 500,
                }
              }}
            />
          </ListItem>
        ))}
      </List>
    );
  };

  const renderMobileTimelineContent = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box
          sx={{
            pl: 0.8,
            pr: 0.55,
            py: 0.45,
            borderRadius: 0.35,
            bgcolor: 'rgba(255, 255, 255, 0.82)',
            border: '1px solid',
            borderColor: 'rgba(148, 163, 184, 0.12)',
            display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          mb: 0.1,
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        }}
      >
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{
            display: 'flex',
            gap: 0.75,
            flexShrink: 0,
            minWidth: 'fit-content',
          }}
        >
          <TimelineFilters
            filters={timelineFilters}
            onFiltersChange={setTimelineFilters}
            selectedDate={selectedDate}
            onDateChange={(date) => setSelectedDate(date)}
            summary={{}}
            compact={true}
            mobileLayout={true}
            hideDateFilter={true}
          />
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            flexShrink: 1,
            minWidth: 0,
          }}
        >
          <Chip
            label={getMobileDateLabel()}
            onClick={(event) => {
              event.stopPropagation();
              setMobileCalendarAnchor(event.currentTarget);
            }}
            variant="filled"
            color="primary"
            sx={{
              height: 30,
              fontSize: '0.76rem',
              fontWeight: 700,
              flex: '0 0 auto',
              bgcolor: 'primary.main',
              color: '#fff',
              borderRadius: 0.35,
              '& .MuiChip-label': {
                px: 1.2,
              },
            }}
          />
          <IconButton
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              setMobileCalendarAnchor(event.currentTarget);
            }}
            sx={{
              width: 30,
              height: 30,
              flex: '0 0 auto',
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: '#fff',
              borderRadius: 0.35,
            }}
          >
            <CalendarIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>

      {renderSearchResults()}

      <UnifiedTimeline 
        child={child}
        selectedDate={selectedDate}
        filters={timelineFilters}
        onFiltersChange={setTimelineFilters}
        onEmptyStateClick={handleEmptyStateClick}
        showFilters={false}
        showDaySummary={false}
        mobileTimeLayout={true}
        focusEntryId={focusedEntryId}
      />

      <Popover
        open={Boolean(mobileCalendarAnchor)}
        anchorEl={mobileCalendarAnchor}
        onClose={() => setMobileCalendarAnchor(null)}
        disableScrollLock
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        disableAutoFocus
      >
        <Box sx={{ p: 1 }}>
          <MiniCalendar
            entries={childSpecificEntries}
            onDayClick={(day, dayEntries, date) => handleMobileDateChange(date)}
            currentMonth={selectedDate}
            selectedDate={selectedDate}
          />
        </Box>
      </Popover>
    </Box>
  );

  // Render legacy content (original recent entries + calendar)
  const renderLegacyContent = () => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {renderSearchResults()}

        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 2, sm: 2, md: 3 }, 
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'flex-start' }
        }}>
          {/* Mini Calendar */}
          <Box sx={{ 
            flexShrink: 0,
            width: { xs: '100%', md: 'auto' },
            display: 'flex',
            justifyContent: { xs: 'center', md: 'flex-start' }
          }}>
            <MiniCalendar
              entries={childSpecificEntries}
              onDayClick={handleDayClick}
              currentMonth={selectedDate}
            />
          </Box>
          
          {/* Recent Entries */}
          <Box sx={{ 
            flex: { xs: 'none', md: 1 }, 
            minWidth: 0,
            width: { xs: '100%', md: 'auto' }
          }}>
            {renderRecentEntries()}
          </Box>
        </Box>
      </Box>
    );
  };


  return (
    <>
      <Paper
        className={`timeline-widget timeline-widget--${variant}`}
        id={`timeline-widget-${child?.id || 'default'}`}
        elevation={0}
        sx={widgetStyles}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        {/* Widget Header */}
        <Box
          className="timeline-widget__header"
          sx={headerStyles}
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 1, md: 1.5 },
            flexWrap: { xs: 'nowrap', sm: 'nowrap' }
          }}>
            {/* Header Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ 
                      fontWeight: 700, 
                      color: 'text.primary',
                      fontSize: { xs: '0.9rem', md: '1rem' }
                    }}
                  >
                    Daily Progress & Timeline
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: { xs: '0.7rem', md: '0.75rem' },
                      display: 'block',
                      lineHeight: 1.2
                      ,color: '#6c757d'
                    }}
                  >
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Typography>
                </Box>
                
                {/* Timeline Filters */}
                {showUnifiedLog && expanded && !isMobile && (
                  <Box onClick={(e) => e.stopPropagation()}>
                    <TimelineFilters
                      filters={timelineFilters}
                      onFiltersChange={setTimelineFilters}
                      selectedDate={selectedDate}
                      onDateChange={(date) => setSelectedDate(date)}
                      summary={{}}
                      compact={true}
                    />
                  </Box>
                )}
              </Box>
            </Box>

            {/* Expand/Collapse Button */}
            <IconButton 
              size="small" 
              className="timeline-widget__toggle"
              sx={{ 
                width: { xs: 36, md: 40 },
                height: { xs: 36, md: 40 }
              }}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>

        {/* Expandable Content */}
        <Collapse in={expanded}>
          <Box 
            className="timeline-widget__content" 
            sx={contentStyles}
            onClick={(e) => e.stopPropagation()}
          >
            {showUnifiedLog ? (
              isMobile ? (
                renderMobileTimelineContent()
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  gap: { xs: 2, sm: 2, md: 3 }, 
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: { xs: 'stretch', md: 'flex-start' }
                }}>
                  {/* Mini Calendar */}
                  <Box sx={{ 
                    flexShrink: 0,
                    width: { xs: '100%', md: 'auto' },
                    display: 'flex',
                    justifyContent: { xs: 'center', md: 'flex-start' }
                  }}>
                    <MiniCalendar
                      entries={childSpecificEntries}
                      onDayClick={handleDayClick}
                      currentMonth={selectedDate}
                      selectedDate={selectedDate}
                    />
                  </Box>
                  
                  {/* Unified Timeline */}
                  <Box sx={{ 
                    flex: { xs: 'none', md: 1 }, 
                    minWidth: 0,
                    width: { xs: '100%', md: 'auto' },
                  }}>
                    <UnifiedTimeline 
                      child={child}
                      selectedDate={selectedDate}
                      filters={timelineFilters}
                      onFiltersChange={setTimelineFilters}
                      onEmptyStateClick={handleEmptyStateClick}
                      showFilters={false}
                      showDaySummary={false}
                    />
                  </Box>
                </Box>
              )
            ) : renderLegacyContent()}
            
          </Box>
        </Collapse>
      </Paper>

    </>
  );
};

export default TimelineWidget;
