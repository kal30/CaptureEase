import React, { useState } from 'react';
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
  Button,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Timeline as TimelineIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import TimelineProgressRing from './TimelineProgressRing';
import MiniCalendar from './MiniCalendar';
import { UnifiedTimeline, TimelineFullModal, TimelineFilters } from '../Timeline';
import { useTimelineProgress } from '../../hooks/useTimelineProgress';
import { useNavigate } from 'react-router-dom';
import { useChildContext } from '../../contexts/ChildContext';

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
  defaultExpanded = false,
  variant = 'full',
  showUnifiedLog = true
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigate = useNavigate();
  const { setCurrentChildId } = useChildContext();
  
  // Debug: Log current state
  console.log('TimelineWidget state:', {
    childId: child?.id,
    childName: child?.name,
    selectedDate,
    entriesCount: entries.length,
    childSpecificEntriesCount: entries.filter(entry => 
      entry.childId === child?.id || entry.child?.id === child?.id
    ).length
  });
 // 'daily' or 'recent'
  const [timelineFilters, setTimelineFilters] = useState({}); // Unified timeline filters
  
  // Filter entries to ensure they belong to the current child
  const childSpecificEntries = entries.filter(entry => 
    entry.childId === child?.id || entry.child?.id === child?.id
  );
  
  const timeline = useTimelineProgress(childSpecificEntries, dailyCareStatus);
  
  // Component styles - mobile-first responsive
  const widgetStyles = {
    bgcolor: 'background.paper',
    border: '1px solid',
    borderColor: 'timeline.border',
    borderRadius: { xs: 2, md: 2 },
    overflow: 'hidden',
    transition: 'box-shadow 0.2s ease',
    '&:hover': {
      boxShadow: '0 2px 8px rgba(109, 40, 217, 0.1)'
    }
  };

  const headerStyles = {
    p: { xs: 1.5, md: 2 },
    bgcolor: 'timeline.background',
    borderBottom: expanded ? '1px solid' : 'none',
    borderBottomColor: 'timeline.border',
    cursor: 'pointer'
  };

  const contentStyles = {
    p: { xs: 1.5, md: 2 }
  };

  // Mobile-responsive progress ring size
  const getRingSize = () => {
    if (variant === 'compact') return 'small';
    return 'medium'; // Let CSS handle responsive sizing
  };

  const handleProgressRingClick = (e) => {
    if (e) {
      e.stopPropagation();
    }
    console.log('Progress ring clicked for child:', child?.id, child?.name);
    if (!expanded) {
      setExpanded(true);
    }
  };

  const handleViewFullTimeline = () => {
    setShowTimelineModal(true);
  };

  const handleDayClick = (day, dayEntries, date) => {
    // Handle day click from mini calendar or timeline calendar
    console.log('Day clicked for child:', child?.id, child?.name, { day, date, entriesCount: dayEntries?.length || 0 });
    if (showUnifiedLog) {
      setSelectedDate(date);
      if (!expanded) {
        setExpanded(true);
      }
    } else {
      // Legacy behavior
      if (dayEntries?.length > 0) {
        console.log('Day clicked:', { day, dayEntries, date });
      }
    }
  };


  // Render recent entries list
  const renderRecentEntries = () => {
    if (!timeline.recentEntries.length) {
      return (
        <Box className="timeline-widget__empty-state" sx={{ textAlign: 'center', py: 3 }}>
          <TimelineIcon sx={{ fontSize: 32, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            No recent activity
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Start logging daily activities to see them here
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
              borderRadius: 1,
              mb: index < timeline.recentEntries.length - 1 ? 1 : 0,
              bgcolor: 'background.default'
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
                sx: { fontWeight: 500, mb: 0.5 }
              }}
              secondaryTypographyProps={{
                variant: 'caption',
                color: 'text.secondary'
              }}
            />
          </ListItem>
        ))}
      </List>
    );
  };

  // Render activity metrics
  const renderMetrics = () => {
    const mostActiveType = timeline.getMostActiveType();
    const streak = timeline.getActivityStreak();
    const metrics = timeline.metrics || { todayCount: 0, weekCount: 0, totalCount: 0 };

    return (
      <Box className="timeline-widget__metrics" sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
          {metrics.todayCount > 0 && (
            <Chip
              label={`${metrics.todayCount} today`}
              size="small"
              color="primary"
              variant="filled"
            />
          )}
          {metrics.weekCount > 0 && (
            <Chip
              label={`${metrics.weekCount} this week`}
              size="small"
              variant="outlined"
            />
          )}
          {streak > 0 && (
            <Chip
              label={`${streak} day streak`}
              size="small"
              color="success"
              variant="outlined"
            />
          )}
        </Box>
        {mostActiveType && (
          <Typography variant="caption" color="text.secondary">
            Most active: {mostActiveType.icon} {mostActiveType.label} ({mostActiveType.count} entries)
          </Typography>
        )}
      </Box>
    );
  };


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
            currentMonth={new Date()}
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
            gap: { xs: 1.5, md: 2 },
            flexWrap: { xs: 'nowrap', sm: 'nowrap' }
          }}>
            {/* Progress Ring */}
            <TimelineProgressRing
              status={timeline.dailyCareStatus}
              completionRate={timeline.completionRate}
              size={getRingSize()}
              onClick={handleProgressRingClick}
            />
            
            {/* Header Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ 
                      fontWeight: 600, 
                      color: 'text.primary',
                      fontSize: { xs: '0.9rem', md: '1rem' }
                    }}
                  >
                    Logs
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: { xs: '0.7rem', md: '0.75rem' },
                      display: 'block',
                      lineHeight: 1.2
                    }}
                  >
                    {timeline.hasActivity ? 
                      `${timeline.metrics?.totalCount || 0} total entries` : 
                      'No activity yet'
                    }
                  </Typography>
                  {expanded && (
                    <Button
                      size="small"
                      variant="text"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentChildId(child?.id);
                        navigate('/log');
                      }}
                      sx={{ px: 0, textTransform: 'none' }}
                    >
                      Detailed log
                    </Button>
                  )}
                </Box>
                
                {/* Timeline Filters */}
                {showUnifiedLog && expanded && (
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
            {variant === 'full' && renderMetrics()}
            
            {showUnifiedLog ? (
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
                    currentMonth={new Date()}
                    selectedDate={selectedDate}
                  />
                </Box>
                
                {/* Unified Timeline */}
                <Box sx={{ 
                  flex: { xs: 'none', md: 1 }, 
                  minWidth: 0,
                  width: { xs: '100%', md: 'auto' }
                }}>
                  <UnifiedTimeline 
                    child={child}
                    selectedDate={selectedDate}
                    filters={timelineFilters}
                    onFiltersChange={setTimelineFilters}
                    showFilters={false}
                  />
                </Box>
              </Box>
            ) : renderLegacyContent()}
            
            {/* Action Buttons */}
            {timeline.hasActivity && (
              <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'center' }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<CalendarIcon />}
                  onClick={handleViewFullTimeline}
                  sx={{ fontSize: '0.75rem' }}
                >
                  View Full Timeline
                </Button>
              </Box>
            )}
          </Box>
        </Collapse>
      </Paper>

      {/* Full Timeline Modal */}
      <TimelineFullModal
        open={showTimelineModal}
        onClose={() => setShowTimelineModal(false)}
        child={child}
        entries={childSpecificEntries}
        onDayClick={handleDayClick}
      />
    </>
  );
};

export default TimelineWidget;
