import React, { useMemo, useRef, useState } from 'react';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import MonthNavigationControls from './MonthNavigationControls';
import { useSwipeGesture } from '../../hooks/useSwipeGesture';
import colors from '../../assets/theme/colors';
import { getCalendarDateKey, getCalendarEntryDateKey, getCalendarDateKeys } from '../../utils/calendarDateKey';
import { buildCalendarDayStatusMap, getCalendarDayStatus } from '../Timeline/utils/calendarDayStatus';

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
  activityDateKeys = [],
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
    const todayKey = getCalendarDateKey(today);
    
    // Get first day of month and adjust to start on Sunday
    const firstDayOfMonth = new Date(monthToDisplay);
    
    // Start from Sunday of the week containing the first day
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());
    
    // Generate days (6 weeks = 42 days to cover all possible month layouts)
    const days = [];
    const entriesByDay = {};
    const activityKeys = activityDateKeys.length > 0
      ? new Set(activityDateKeys)
      : getCalendarDateKeys(entries);
    const dayStatusMap = buildCalendarDayStatusMap(entries, Array.from(activityKeys));
    
    // Group entries by day
    entries.forEach(entry => {
      const dateKey = getCalendarEntryDateKey(entry);
      if (!dateKey) return;
      
      if (!entriesByDay[dateKey]) {
        entriesByDay[dateKey] = [];
      }
      entriesByDay[dateKey].push(entry);
    });
    
    // Generate 42 days (6 weeks) to ensure full month coverage
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dateKey = getCalendarDateKey(currentDate);
      const dayEntries = entriesByDay[dateKey] || [];
      const isToday = getCalendarDateKey(currentDate) === todayKey;
      // Compare only date parts, not time, to properly identify future dates
      const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      const isFuture = currentDateOnly > todayDateOnly;
      const isCurrentMonth = currentDate.getMonth() === monthToDisplay.getMonth();
      const isSelected = selectedDate && getCalendarDateKey(currentDate) === getCalendarDateKey(selectedDate);
      const dayStatus = getCalendarDayStatus(dayStatusMap.get(dateKey) || {});
      
      days.push({
        date: currentDate,
        day: currentDate.getDate(),
        dateKey,
        entries: dayEntries,
        ...dayStatus,
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
  }, [entries, displayMonth, selectedDate, activityDateKeys]);

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
    width: { xs: 38, sm: 34, md: 28 },
    height: { xs: 50, sm: 46, md: 42 },
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.15,
    py: 0.3,
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
    minHeight: { xs: 44, md: 36 }, // Meet accessibility touch target requirements
    '&:hover': dayData.isCurrentMonth && (dayData.isToday || !dayData.isFuture) ? {
      bgcolor: dayData.isToday ? 'primary.dark' : 
               dayData.isSelected ? 'action.focus' :
               'action.hover',
      transform: { xs: 'scale(1.05)', md: 'scale(1.1)' }
    } : {}
  });

  const logMarkerStyles = {
    position: 'absolute',
    bottom: { xs: 3, md: 2 },
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 2,
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const regularLogMarkerStyles = {
    width: { xs: 7, md: 6 },
    height: { xs: 7, md: 6 },
    borderRadius: '9999px',
    bgcolor: '#2BA7A0',
    border: '1px solid #FFFFFF',
    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.18)',
  };

  const incidentMarkerStyles = {
    width: { xs: 8, md: 7 },
    height: { xs: 8, md: 7 },
    borderRadius: '2px',
    bgcolor: '#D14343',
    border: '1px solid #FFFFFF',
    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.18)',
    transform: 'rotate(45deg)',
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
            className={`mini-calendar__day ${(dayData.hasLogs || dayData.hasIncident) ? 'mini-calendar__day--active' : ''} ${dayData.isToday ? 'mini-calendar__day--today' : ''} ${!dayData.isCurrentMonth ? 'mini-calendar__day--other-month' : ''}`}
          >
            <Typography
              variant="caption"
            sx={{
              fontSize: 'inherit',
              fontWeight: 'inherit',
              color: dayData.isToday ? 'primary.contrastText' : 'inherit',
              lineHeight: 1,
              position: 'relative',
              zIndex: 1,
            }}
          >
            {dayData.day}
          </Typography>
          {/* Day status marker */}
          {dayData.isCurrentMonth && (dayData.hasLogs || dayData.hasIncident) ? (
            <Box
              aria-hidden="true"
              sx={{
                ...logMarkerStyles,
                ...(dayData.isToday || dayData.isSelected
                  ? {
                      bottom: { xs: 7, md: 5 },
                      top: 'auto',
                    }
                  : {
                      bottom: { xs: 3, md: 2 },
                    }),
              }}
            >
              {dayData.hasIncident ? (
                <Box
                  sx={{
                    ...(dayData.isToday || dayData.isSelected
                      ? {
                          width: 6.5,
                          height: 6.5,
                          borderRadius: '2px',
                          bgcolor: '#FFFFFF',
                          border: '1px solid rgba(255, 255, 255, 0.95)',
                          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.25)',
                          transform: 'rotate(45deg)',
                        }
                      : incidentMarkerStyles),
                  }}
                />
              ) : (
                <Box
                  sx={{
                    ...(dayData.isToday || dayData.isSelected
                      ? {
                          width: 6,
                          height: 6,
                          borderRadius: '9999px',
                          bgcolor: '#FFFFFF',
                          border: '1px solid rgba(255, 255, 255, 0.95)',
                          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.25)',
                        }
                      : regularLogMarkerStyles),
                  }}
                />
              )}
            </Box>
          ) : null}
          </Box>
        ))}
      </Box>
      
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.25,
          mt: 1,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.45 }}>
          <Box sx={{ width: 7, height: 7, borderRadius: '9999px', bgcolor: '#2BA7A0' }} />
          <Typography variant="caption" sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>
            Logs
          </Typography>
        </Box>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.45 }}>
          <Box sx={{ width: 7, height: 7, borderRadius: '2px', bgcolor: '#D14343', transform: 'rotate(45deg)' }} />
          <Typography variant="caption" sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>
            Incident
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default MiniCalendar;
