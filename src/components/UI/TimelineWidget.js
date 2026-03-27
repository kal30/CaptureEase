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
import { alpha } from '@mui/material/styles';
import MiniCalendar from './MiniCalendar';
import { UnifiedTimeline, TimelineFullModal, TimelineFilters } from '../Timeline';
import { useTimelineProgress } from '../../hooks/useTimelineProgress';

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

  const [timelineFilters, setTimelineFilters] = useState({}); // Unified timeline filters
  
  const childSpecificEntries = entries;
  
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
    p: { xs: 1.25, md: 1.5 }
  };

  const handleViewFullTimeline = () => {
    setShowTimelineModal(true);
  };

  const handleDayClick = (day, dayEntries, date) => {
    if (showUnifiedLog) {
      setSelectedDate(date);
      if (!expanded) {
        setExpanded(true);
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
              borderRadius: 2.5,
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
                      fontWeight: 600, 
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
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      setSelectedDate(yesterday);
                      console.log('Switched to yesterday:', yesterday.toDateString());
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {timeline.hasActivity ? `${timeline.metrics?.totalCount || 0} total entries` : ''}
                  </Typography>
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
                  width: { xs: '100%', md: 'auto' },
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
