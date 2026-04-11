import React, { useMemo, useRef, useState } from 'react';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import MonthNavigationControls from './MonthNavigationControls';
import { useSwipeGesture } from '../../hooks/useSwipeGesture';
import colors from '../../assets/theme/colors';

const toMonthStart = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const getMonthKey = (date) => `${date.getFullYear()}-${date.getMonth()}`;

/**
 * MiniCalendar - Full month calendar view showing activity dots
 * KISS principle: Simple, focused, single responsibility
 * Mobile-first responsive design
 * 
 * @param {Object} props
 * @param {Array} props.entries - Timeline entries to show as activity dots
 * @param {function} props.onDayClick - Handler for day clicks (day, dayEntries, date)
 * @param {Date} props.currentMonth - Month to display (default: current month)
 * @param {Date} props.selectedDate - Currently selected date to highlight (optional)
 */
const MiniCalendar = ({
  entries = [],
  onDayClick,
  currentMonth,
  selectedDate = null
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const initialMonthKey = currentMonth
    ? getMonthKey(currentMonth)
    : null;
  const normalizedInitialMonth = useMemo(
    () => toMonthStart(currentMonth || new Date()),
    [initialMonthKey]
  );
  // State for current displayed month
  const [displayMonth, setDisplayMonth] = useState(normalizedInitialMonth);
  const lastControlledMonthKeyRef = useRef(initialMonthKey);
  
  // Only sync from the controlled month when the parent month actually changes.
  // Do not sync from selectedDate, or month navigation in the popover gets reset.
  React.useEffect(() => {
    const nextMonthKey = currentMonth ? getMonthKey(currentMonth) : null;
    if (nextMonthKey && nextMonthKey !== lastControlledMonthKeyRef.current) {
      lastControlledMonthKeyRef.current = nextMonthKey;
      setDisplayMonth((currentDisplayMonth) => {
        return getMonthKey(currentDisplayMonth) === nextMonthKey
          ? currentDisplayMonth
          : toMonthStart(currentMonth);
      });
    }
  }, [currentMonth]);

  // Month navigation handlers
  const goToPreviousMonth = () => {
    setDisplayMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setDisplayMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Swipe gesture for mobile
  const swipeRef = useSwipeGesture({
    onSwipeLeft: goToNextMonth,  // Swipe left = next month
    onSwipeRight: goToPreviousMonth  // Swipe right = previous month
  });

  // Generate full month calendar data
  const calendarData = useMemo(() => {
    const today = new Date();
    const monthToDisplay = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), 1);
    
    // Get first day of month and adjust to start on Sunday
    const firstDayOfMonth = new Date(monthToDisplay);
    
    // Start from Sunday of the week containing the first day
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());
    
    // Generate days (6 weeks = 42 days to cover all possible month layouts)
    const days = [];
    const entriesByDay = {};
    
    // Group entries by day
    entries.forEach(entry => {
      const entryDate = entry.timestamp?.toDate?.() || new Date(entry.timestamp);
      const dateKey = entryDate.toDateString();
      
      if (!entriesByDay[dateKey]) {
        entriesByDay[dateKey] = [];
      }
      entriesByDay[dateKey].push(entry);
    });
    
    // Generate 42 days (6 weeks) to ensure full month coverage
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dateKey = currentDate.toDateString();
      const dayEntries = entriesByDay[dateKey] || [];
      const isToday = currentDate.toDateString() === today.toDateString();
      // Compare only date parts, not time, to properly identify future dates
      const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      const isFuture = currentDateOnly > todayDateOnly;
      const isCurrentMonth = currentDate.getMonth() === monthToDisplay.getMonth();
      const isSelected = selectedDate && currentDate.toDateString() === selectedDate.toDateString();
      
      days.push({
        date: currentDate,
        day: currentDate.getDate(),
        dateKey,
        entries: dayEntries,
        hasActivity: dayEntries.length > 0,
        isToday,
        isFuture,
        isCurrentMonth,
        isSelected
      });
    }
    
    return { 
      days, 
      monthName: monthToDisplay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
  }, [entries, displayMonth, selectedDate]);

  const handleDayClick = (e, dayData) => {
    // Allow clicking on any current month day that is today or in the past
    if (dayData.isCurrentMonth && (dayData.isToday || !dayData.isFuture) && onDayClick) {
      e.stopPropagation();
      onDayClick(dayData.day, dayData.entries, dayData.date);
    }
  };

  // Mobile-first responsive styles
  const containerStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: { xs: 0.75, md: 0.5 },
    p: { xs: 1.5, md: 1 },
    bgcolor: 'background.paper',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 2,
    width: '100%',
    maxWidth: { xs: 320, sm: 280, md: 240 }
  };

  const dayStyles = (dayData) => ({
    width: { xs: 36, sm: 32, md: 24 },
    height: { xs: 36, sm: 32, md: 28 },
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.15,
    borderRadius: '50%',
    fontSize: { xs: '0.85rem', md: '0.75rem' },
    fontWeight: dayData.isToday || dayData.isSelected ? 600 : 400,
    color: dayData.isSelected && !dayData.isToday ? 'white' :
           !dayData.isCurrentMonth ? 'text.disabled' : 
           dayData.isFuture ? 'text.secondary' : 
           'text.primary',
    bgcolor: dayData.isToday ? 'primary.main' : 
             dayData.isSelected ? 'secondary.main' : 
             'transparent',
    border: dayData.isSelected && !dayData.isToday ? '2px solid' : 'none',
    borderColor: dayData.isSelected && !dayData.isToday ? 'secondary.dark' : 'transparent',
    cursor: dayData.isCurrentMonth && (dayData.isToday || !dayData.isFuture) ? 'pointer' : 'default',
    position: 'relative',
    transition: 'all 0.2s ease',
    opacity: dayData.isCurrentMonth ? 1 : 0.4,
    minHeight: { xs: 44, md: 28 }, // Meet accessibility touch target requirements
    '&:hover': dayData.isCurrentMonth && (dayData.isToday || !dayData.isFuture) ? {
      bgcolor: dayData.isToday ? 'primary.dark' : 
               dayData.isSelected ? 'action.focus' :
               'action.hover',
      transform: { xs: 'scale(1.05)', md: 'scale(1.1)' }
    } : {}
  });

  const activityDotStyles = {
    width: { xs: 7, md: 6 },
    height: { xs: 7, md: 6 },
    borderRadius: '50%',
    bgcolor: colors.app.calendar.eventDot,
    border: `1px solid ${colors.landing.surface}`,
    boxShadow: '0 1px 3px rgba(0,0,0,0.24)',
    mt: 0.1,
    flexShrink: 0,
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Box 
      className="mini-calendar" 
      sx={{ width: '100%' }}
      ref={isMobile ? swipeRef : null}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Month Navigation */}
      <MonthNavigationControls
        currentMonth={displayMonth}
        onPreviousMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
        showControls={true}
      />

      {/* Calendar Container */}
      <Box sx={containerStyles}>
        {/* Week day headers */}
        {weekDays.map((day, index) => (
          <Typography
            key={day + index}
            variant="caption"
            sx={{
              fontSize: { xs: '0.7rem', md: '0.6rem' },
              fontWeight: 600,
              color: 'text.secondary',
              textAlign: 'center',
              mb: { xs: 1, md: 0.5 },
              display: { xs: 'block', md: 'block' }
            }}
          >
            {/* Show full day name on mobile, abbreviated on desktop */}
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              {day.slice(0, 3)}
            </Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
              {day.charAt(0)}
            </Box>
          </Typography>
        ))}
        
        {/* Calendar days */}
        {calendarData.days.map((dayData, index) => (
          <Box
            key={dayData.dateKey}
            sx={dayStyles(dayData)}
            onClick={(e) => handleDayClick(e, dayData)}
            className={`mini-calendar__day ${dayData.hasActivity ? 'mini-calendar__day--active' : ''} ${dayData.isToday ? 'mini-calendar__day--today' : ''} ${!dayData.isCurrentMonth ? 'mini-calendar__day--other-month' : ''}`}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: 'inherit',
                fontWeight: 'inherit',
                color: dayData.isToday ? 'primary.contrastText' : 'inherit'
              }}
            >
              {dayData.day}
            </Typography>
            
            {/* Activity dot */}
            {dayData.hasActivity && dayData.isCurrentMonth && (
              <Box sx={activityDotStyles} />
            )}
          </Box>
        ))}
      </Box>
      
      {/* Legend - only show on mobile */}
      <Box sx={{ 
        display: { xs: 'flex', md: 'none' },
        alignItems: 'center', 
        justifyContent: 'center',
        gap: 0.5, 
        mt: 1 
      }}>
        <Box sx={{ 
          width: 8, 
          height: 8,
          borderRadius: '50%',
          bgcolor: 'timeline.progress'
        }} />
        <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
          Has Activity
        </Typography>
      </Box>
    </Box>
  );
};

export default MiniCalendar;
