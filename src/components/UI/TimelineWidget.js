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
  Modal,
  Stack,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Timeline as TimelineIcon,
  CalendarMonth as CalendarIcon,
  ViewDay as DayViewIcon,
  ViewList as ListViewIcon
} from '@mui/icons-material';
import TimelineProgressRing from './TimelineProgressRing';
import TimelineCalendar from '../Timeline/TimelineCalendar';
import MiniCalendar from './MiniCalendar';
import DailyLogEntry from './DailyLogEntry';
import { useTimelineProgress } from '../../hooks/useTimelineProgress';
import { useUnifiedDailyLog } from '../../hooks/useUnifiedDailyLog';

/**
 * TimelineWidget - Self-contained timeline component with progress visualization and unified daily log
 * Mobile-friendly, uses existing UI components, minimal sx usage
 * 
 * @param {Object} props
 * @param {Object} props.child - Child object
 * @param {Array} props.entries - Timeline entries for the child
 * @param {Array} props.incidents - Incident entries for the child (optional)
 * @param {Object} props.dailyCareStatus - Daily care completion status
 * @param {boolean} props.defaultExpanded - Whether widget starts expanded
 * @param {string} props.variant - Display variant: 'compact', 'full'
 * @param {boolean} props.showUnifiedLog - Whether to show enhanced daily log (default: true)
 */
const TimelineWidget = ({
  child,
  entries = [],
  incidents = [],
  dailyCareStatus = {},
  defaultExpanded = false,
  variant = 'full',
  showUnifiedLog = true
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'recent'
  
  const timeline = useTimelineProgress(entries, dailyCareStatus);
  const dailyLog = useUnifiedDailyLog(entries, incidents, selectedDate);
  
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
    if (showUnifiedLog) {
      setSelectedDate(date);
      setViewMode('daily');
      if (!expanded) {
        setExpanded(true);
      }
      console.log('Daily log updated for:', { day, date, entriesCount: dayEntries?.length || 0 });
    } else {
      // Legacy behavior
      if (dayEntries?.length > 0) {
        console.log('Day clicked:', { day, dayEntries, date });
      }
    }
  };

  const handleViewModeChange = (event, newMode) => {
    setViewMode(newMode);
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

  // Render unified daily log with enhanced features
  const renderUnifiedDailyLog = () => {
    return (
      <>
        {/* View Mode Tabs */}
        <Box sx={{ mb: 2 }}>
          <Tabs
            value={viewMode}
            onChange={handleViewModeChange}
            variant="fullWidth"
            sx={{
              minHeight: 32,
              '& .MuiTab-root': {
                minHeight: 32,
                fontSize: '0.75rem',
                py: 0.5
              }
            }}
          >
            <Tab
              icon={<DayViewIcon sx={{ fontSize: 16 }} />}
              iconPosition="start"
              label={`Daily Log (${dailyLog.totalCount})`}
              value="daily"
              sx={{ textTransform: 'none' }}
            />
            <Tab
              icon={<ListViewIcon sx={{ fontSize: 16 }} />}
              iconPosition="start"
              label={`Recent Activity (${timeline.recentEntries.length})`}
              value="recent"
              sx={{ textTransform: 'none' }}
            />
          </Tabs>
        </Box>

        {/* Content based on view mode */}
        {viewMode === 'daily' ? (
          <>
            {/* Calendar and Daily Log */}
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
                  entries={[...entries, ...incidents]}
                  onDayClick={handleDayClick}
                  currentMonth={selectedDate}
                  selectedDate={selectedDate}
                />
              </Box>
              
              {/* Daily Log Entries */}
              <Box sx={{ 
                flex: { xs: 'none', md: 1 }, 
                minWidth: 0,
                width: { xs: '100%', md: 'auto' }
              }}>
                {renderDailyLogEntries()}
              </Box>
            </Box>
          </>
        ) : (
          /* Legacy Recent Entries View */
          renderLegacyContent()
        )}
      </>
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
    );
  };

  // Render daily log entries using the new DailyLogEntry component
  const renderDailyLogEntries = () => {
    if (!dailyLog.hasEntries) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <TimelineIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No activity for {selectedDate.toLocaleDateString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select a different date or start logging activities
          </Typography>
        </Box>
      );
    }

    return (
      <Stack spacing={1} sx={{ maxHeight: 400, overflowY: 'auto' }}>
        {/* Day Summary */}
        <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            {selectedDate.toDateString()}
          </Typography>
          
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
            <Chip
              label={`${dailyLog.totalCount} entries`}
              size="small"
              color="primary"
              variant="outlined"
            />
            
            {dailyLog.incidentCount > 0 && (
              <Chip
                label={`${dailyLog.incidentCount} incidents`}
                size="small"
                color="warning"
                variant="outlined"
              />
            )}
            
            {dailyLog.stats.highSeverityCount > 0 && (
              <Chip
                label={`${dailyLog.stats.highSeverityCount} high severity`}
                size="small"
                color="error"
                variant="outlined"
              />
            )}
            
            {dailyLog.stats.pendingFollowUps > 0 && (
              <Chip
                label={`${dailyLog.stats.pendingFollowUps} pending follow-ups`}
                size="small"
                color="info"
                variant="outlined"
              />
            )}
          </Stack>
        </Box>

        {/* Entries List */}
        <Divider sx={{ my: 1 }} />
        
        {dailyLog.entries.map((entry, index) => (
          <DailyLogEntry
            key={entry.id}
            entry={entry}
            formatTime={dailyLog.formatTime}
            formatRelativeTime={dailyLog.formatRelativeTime}
            getEntryTypeInfo={dailyLog.getEntryTypeInfo}
            defaultExpanded={index === 0 && dailyLog.entries.length === 1}
          />
        ))}
      </Stack>
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
            
            {showUnifiedLog ? renderUnifiedDailyLog() : renderLegacyContent()}
            
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