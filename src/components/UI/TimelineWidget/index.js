import React, { useState } from 'react';
import { Box, Paper, Collapse } from '@mui/material';
import MiniCalendar from '../MiniCalendar';
import { UnifiedTimeline, TimelineFullModal } from '../../Timeline';
import { useTimelineProgress } from '../../../hooks/useTimelineProgress';
import { useChildContext } from '../../../contexts/ChildContext';
import QuickNoteLog from '../../Dashboard/QuickNoteLog';
import TimelineWidgetHeader from './TimelineWidgetHeader';
import TimelineWidgetContent from './TimelineWidgetContent';
import useTimelineWidgetSummary from './useTimelineWidgetSummary';

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
  const [showQuickNote, setShowQuickNote] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timelineFilters, setTimelineFilters] = useState({});
  const { setCurrentChildId } = useChildContext();

  const childSpecificEntries = entries.filter(
    (entry) => entry.childId === child?.id || entry.child?.id === child?.id
  );
  const timeline = useTimelineProgress(childSpecificEntries, dailyCareStatus);
  const summary = useTimelineWidgetSummary(childSpecificEntries);

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
    borderBottomColor: 'timeline.border'
  };

  const contentStyles = {
    p: { xs: 1.5, md: 2 }
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
    } else {
      if (dayEntries?.length > 0) {
        console.log('Day clicked:', { day, dayEntries, date });
      }
    }
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
        <Box className="timeline-widget__header" sx={headerStyles}>
          <TimelineWidgetHeader
            loggedToday={summary.loggedToday}
            lastEntry={summary.lastEntry}
            daysLoggedThisWeek={summary.daysLoggedThisWeek}
            expanded={expanded}
            showUnifiedLog={showUnifiedLog}
            selectedDate={selectedDate}
            filters={timelineFilters}
            onFiltersChange={setTimelineFilters}
            onDateChange={setSelectedDate}
            onToggleExpanded={() => setExpanded((prev) => !prev)}
            onAddLog={() => {
              setCurrentChildId(child?.id);
              setShowQuickNote(true);
            }}
            formatTimeAgo={timeline.formatTimeAgo}
          />
        </Box>

        <Collapse in={expanded}>
          <Box className="timeline-widget__content" sx={contentStyles}>
            <TimelineWidgetContent
              variant={variant}
              timeline={timeline}
              daysLoggedThisWeek={summary.daysLoggedThisWeek}
              showUnifiedLog={showUnifiedLog}
              child={child}
              selectedDate={selectedDate}
              timelineFilters={timelineFilters}
              onFiltersChange={setTimelineFilters}
              onViewFullTimeline={handleViewFullTimeline}
              renderMiniCalendar={(props) => (
                <MiniCalendar
                  entries={childSpecificEntries}
                  onDayClick={handleDayClick}
                  currentMonth={new Date()}
                  selectedDate={selectedDate}
                  {...props}
                />
              )}
            />
          </Box>
        </Collapse>
      </Paper>

      <TimelineFullModal
        open={showTimelineModal}
        onClose={() => setShowTimelineModal(false)}
        child={child}
        entries={childSpecificEntries}
        onDayClick={handleDayClick}
      />

      <QuickNoteLog
        childId={child?.id}
        childName={child?.name}
        open={showQuickNote}
        onClose={() => setShowQuickNote(false)}
        onLogged={() => {
          setSelectedDate(new Date());
          setExpanded(true);
        }}
      />
    </>
  );
};

export default TimelineWidget;
