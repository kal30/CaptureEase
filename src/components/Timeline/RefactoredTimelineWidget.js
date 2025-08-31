import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Collapse,
  IconButton,
  Button,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';

// Refactored components
import TimelineProgressRing from '../UI/TimelineProgressRing';
import TimelineRecentEntries from './TimelineRecentEntries';
import TimelineMetrics from './TimelineMetrics';
import TimelineDailyView from './_depracatedTab/TimelineDailyView';
import TimelineFullModal from './TimelineFullModal';

// Hooks
import { useTimelineProgress } from '../../hooks/useTimelineProgress';
import { useUnifiedDailyLog } from '../../hooks/useUnifiedDailyLog';

/**
 * RefactoredTimelineWidget - Cleaner, modular timeline component
 * Broken down from 560-line monolithic component into focused pieces
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
const RefactoredTimelineWidget = ({
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
    return 'medium';
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
    if (showUnifiedLog) {
      setSelectedDate(date);
      setViewMode('daily');
      if (!expanded) {
        setExpanded(true);
      }
      console.log('Daily log updated for:', { day, date, entriesCount: dayEntries?.length || 0 });
    } else {
      if (dayEntries?.length > 0) {
        console.log('Day clicked:', { day, dayEntries, date });
      }
    }
  };

  const handleViewModeChange = (event, newMode) => {
    setViewMode(newMode);
  };

  // Helper functions for entry display
  const getEntryIcon = (entry) => {
    // This would contain logic to return appropriate icons based on entry type
    // For now, returning null to use default
    return null;
  };

  const formatEntryTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Paper
        className={`timeline-widget timeline-widget--${variant}`}
        elevation={0}
        sx={widgetStyles}
      >
        {/* Header */}
        <Box
          onClick={() => setExpanded(!expanded)}
          sx={headerStyles}
          className="timeline-widget__header"
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            gap: 1
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <TimelineProgressRing
                progress={timeline.progress}
                size={getRingSize()}
                onClick={handleProgressRingClick}
                showPercentage={variant === 'full'}
              />
              
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  variant={variant === 'compact' ? 'body2' : 'subtitle1'} 
                  sx={{ fontWeight: 600, color: 'timeline.text' }}
                >
                  Daily Progress & Timeline
                </Typography>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ display: 'block' }}
                >
                  {timeline.todayCount > 0 
                    ? `${timeline.todayCount} activities logged today`
                    : 'No activities logged today'
                  }
                </Typography>
              </Box>
            </Box>

            <IconButton 
              size="small" 
              sx={{ color: 'timeline.text' }}
              onClick={(e) => e.stopPropagation()}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>

        {/* Expandable Content */}
        <Collapse in={expanded}>
          <Box sx={contentStyles} className="timeline-widget__content">
            {/* Metrics (only in full variant) */}
            {variant === 'full' && (
              <TimelineMetrics 
                timeline={timeline}
                metrics={timeline.metrics}
              />
            )}
            
            {/* Main Content */}
            {showUnifiedLog ? (
              <TimelineDailyView
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                selectedDate={selectedDate}
                onDayClick={handleDayClick}
                dailyLog={dailyLog}
                entries={entries}
              />
            ) : (
              <TimelineRecentEntries
                entries={timeline.recentEntries}
                getEntryIcon={getEntryIcon}
                formatEntryTime={formatEntryTime}
              />
            )}
            
            {/* Action Buttons */}
            {timeline.hasActivity && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
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
              </>
            )}
          </Box>
        </Collapse>
      </Paper>

      {/* Full Timeline Modal */}
      <TimelineFullModal
        open={showTimelineModal}
        onClose={() => setShowTimelineModal(false)}
        child={child}
        entries={entries}
        onDayClick={handleDayClick}
      />
    </>
  );
};

export default RefactoredTimelineWidget;
