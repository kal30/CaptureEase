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
  Modal
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Timeline as TimelineIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import TimelineProgressRing from './TimelineProgressRing';
import TimelineCalendar from '../Timeline/TimelineCalendar';
import MiniCalendar from './MiniCalendar';
import { useTimelineProgress } from '../../hooks/useTimelineProgress';

/**
 * TimelineWidget - Self-contained timeline component with progress visualization
 * Mobile-friendly, uses existing UI components, minimal sx usage
 * 
 * @param {Object} props
 * @param {Object} props.child - Child object
 * @param {Array} props.entries - Timeline entries for the child
 * @param {Object} props.dailyCareStatus - Daily care completion status
 * @param {boolean} props.defaultExpanded - Whether widget starts expanded
 * @param {string} props.variant - Display variant: 'compact', 'full'
 */
const TimelineWidget = ({
  child,
  entries = [],
  dailyCareStatus = {},
  defaultExpanded = false,
  variant = 'full'
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  
  const timeline = useTimelineProgress(entries, dailyCareStatus);
  
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
    if (!expanded) {
      setExpanded(true);
    }
  };

  const handleViewFullTimeline = () => {
    setShowTimelineModal(true);
  };

  const handleDayClick = (day, dayEntries, date) => {
    // Handle day click from mini calendar or timeline calendar
    if (dayEntries?.length > 0) {
      // Could expand to show day details, for now just log
      console.log('Day clicked:', { day, dayEntries, date });
      // Future: Could open a day detail modal or expand inline
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
          <Chip
            label={`${metrics.todayCount} today`}
            size="small"
            color={timeline.hasActivityToday() ? 'primary' : 'default'}
            variant={timeline.hasActivityToday() ? 'filled' : 'outlined'}
          />
          <Chip
            label={`${metrics.weekCount} this week`}
            size="small"
            variant="outlined"
          />
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
              >
                {timeline.hasActivity ? 
                  `${timeline.metrics?.totalCount || 0} total entries` : 
                  'No activity yet'
                }
              </Typography>
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
            
            {/* Main Content: Mini Calendar + Recent Entries */}
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
                  entries={entries}
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
      <Modal
        open={showTimelineModal}
        onClose={() => setShowTimelineModal(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Paper
          sx={{
            maxWidth: '90vw',
            maxHeight: '90vh',
            width: 800,
            overflow: 'auto',
            borderRadius: 2
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6">
              Timeline for {child?.name}
            </Typography>
          </Box>
          <Box sx={{ p: 2 }}>
            <TimelineCalendar
              entries={entries}
              onDayClick={handleDayClick}
              filters={{}}
            />
          </Box>
        </Paper>
      </Modal>
    </>
  );
};

export default TimelineWidget;