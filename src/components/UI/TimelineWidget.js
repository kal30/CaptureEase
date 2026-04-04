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

  const [timelineFilters, setTimelineFilters] = useState({}); // Unified timeline filters
  
  const childSpecificEntries = entries;
  
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

      <UnifiedTimeline 
        child={child}
        selectedDate={selectedDate}
        filters={timelineFilters}
        onFiltersChange={setTimelineFilters}
        onEmptyStateClick={handleEmptyStateClick}
        showFilters={false}
        showDaySummary={false}
        mobileTimeLayout={true}
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
