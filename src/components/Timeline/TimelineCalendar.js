import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Grid,
  Chip,
  Tooltip,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { TIMELINE_TYPES, getTimelineEntryGroup } from '../../services/timelineService';
import { getTypeColor } from './utils/colors';

const TimelineCalendar = ({ entries, onDayClick, filters }) => {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoverAnchor, setHoverAnchor] = useState(null);
  const [hoverData, setHoverData] = useState(null);

  // Get the first day of the current month and year
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysInMonth = lastDayOfMonth.getDate();

  // Generate calendar data
  const calendarData = useMemo(() => {
    const data = {};
    
    // Group entries by date
    entries.forEach(entry => {
      const entryDate = entry.timestamp?.toDate ? entry.timestamp.toDate() : new Date(entry.timestamp);
      const dateKey = entryDate.toDateString();
      
      if (!data[dateKey]) {
        data[dateKey] = {};
      }
      
      if (!data[dateKey][entry.type]) {
        data[dateKey][entry.type] = [];
      }
      
      data[dateKey][entry.type].push(entry);
    });
    
    return data;
  }, [entries]);

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayHover = (event, day, dayEntries) => {
    if (Object.keys(dayEntries).length > 0) {
      setHoverAnchor(event.currentTarget);
      setHoverData({ day, dayEntries, date: new Date(currentDate.getFullYear(), currentDate.getMonth(), day) });
    }
  };

  const handleHoverClose = () => {
    setHoverAnchor(null);
    setHoverData(null);
  };

  const isToday = (day) => {
    const today = new Date();
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return checkDate.toDateString() === today.toDateString();
  };

  const isDayInFuture = (day) => {
    const today = new Date();
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return checkDate > today;
  };

  const getDayEntries = (day) => {
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateKey = dayDate.toDateString();
    return calendarData[dateKey] || {};
  };

  const renderDayDots = (dayEntries) => {
    const types = Object.keys(dayEntries);
    if (types.length === 0) return null;

    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 0.5, 
          position: 'absolute',
          bottom: 4,
          left: 0,
          right: 0,
          flexWrap: 'wrap',
          px: 0.5
        }}
      >
        {types.slice(0, 6).map(type => {
          const group = getTimelineEntryGroup(type) || type;
          const color = getTypeColor(theme, group);
          const count = dayEntries[type].length;
          return (
            <Box key={type}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: color,
                border: '1px solid white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                position: 'relative'
              }}
            >
              {count > 1 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -3,
                    right: -3,
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: theme.palette.error.main,
                    border: '1px solid white',
                    fontSize: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                >
                  {count > 9 ? '9+' : count}
                </Box>
              )}
            </Box>
          );
        })}
        {types.length > 6 && (
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: theme.palette.grey[600],
              border: '1px solid white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '6px',
              color: 'white',
              fontWeight: 'bold'
            }}
          >
            +
          </Box>
        )}
      </Box>
    );
  };

  const getDayStats = (dayEntries) => {
    const totalEntries = Object.values(dayEntries).reduce((sum, arr) => sum + arr.length, 0);
    const typeCount = Object.keys(dayEntries).length;
    return { totalEntries, typeCount };
  };

  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden'
      }}
    >
      {/* Calendar Header */}
      <Box 
        sx={{ 
          p: 2,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            color: 'text.primary'
          }}
        >
          {monthYear}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton 
            size="small"
            onClick={() => navigateMonth(-1)} 
            sx={{
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1)
              }
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton 
            size="small"
            onClick={goToToday}
            sx={{
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1)
              }
            }}
          >
            <TodayIcon />
          </IconButton>
          <IconButton 
            size="small"
            onClick={() => navigateMonth(1)}
            sx={{
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1)
              }
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Week Days Header */}
      <Box sx={{ bgcolor: alpha(theme.palette.grey[100], 0.5) }}>
        <Grid container spacing={0}>
          {weekDays.map((day, index) => (
            <Grid item xs key={day}>
              <Box 
                sx={{ 
                  py: 1, 
                  textAlign: 'center'
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 600,
                    color: 'text.secondary',
                    fontSize: '0.75rem'
                  }}
                >
                  {day.slice(0, 3)}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Calendar Grid */}
      <Grid container spacing={0}>
        {calendarDays.map((day, index) => {
          if (day === null) {
            return (
              <Grid item xs key={`empty-${index}`}>
                <Box 
                  sx={{ 
                    height: 100,
                    borderRight: (index + 1) % 7 !== 0 ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : 'none',
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    bgcolor: alpha(theme.palette.grey[200], 0.3)
                  }} 
                />
              </Grid>
            );
          }

          const dayEntries = getDayEntries(day);
          const { totalEntries, typeCount } = getDayStats(dayEntries);
          const isCurrentDay = isToday(day);
          const isFuture = isDayInFuture(day);
          const isWeekend = (index % 7 === 0 || index % 7 === 6);

          return (
            <Grid item xs key={day}>
              <Box
                sx={{
                  height: 120,
                  borderRight: (index + 1) % 7 !== 0 ? `1px solid ${alpha(theme.palette.divider, 0.2)}` : 'none',
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  cursor: totalEntries > 0 ? 'pointer' : 'default',
                  bgcolor: isCurrentDay 
                    ? alpha(theme.palette.primary.main, 0.1)
                    : isWeekend 
                      ? alpha(theme.palette.grey[50], 0.8)
                      : 'background.paper',
                  opacity: isFuture ? 0.6 : 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: totalEntries > 0 
                      ? alpha(theme.palette.primary.main, 0.08)
                      : isCurrentDay 
                        ? alpha(theme.palette.primary.main, 0.12)
                        : alpha(theme.palette.grey[100], 0.8)
                  },
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  p: 1
                }}
                onClick={() => totalEntries > 0 && onDayClick(day, dayEntries)}
                onMouseEnter={(e) => handleDayHover(e, day, dayEntries)}
                onMouseLeave={handleHoverClose}
              >
                {/* Day Number */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: isCurrentDay ? 700 : 500,
                      color: isCurrentDay 
                        ? theme.palette.primary.main 
                        : isFuture 
                          ? 'text.disabled'
                          : 'text.primary',
                      fontSize: '1.1rem',
                      lineHeight: 1
                    }}
                  >
                    {day}
                  </Typography>

                  {/* Today indicator */}
                  {isCurrentDay && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: theme.palette.primary.main,
                        boxShadow: '0 0 0 2px white',
                        mt: 0.5
                      }}
                    />
                  )}
                </Box>

                {/* Entry Dots at Bottom */}
                {renderDayDots(dayEntries)}
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {/* Footer Summary */}
      <Box 
        sx={{ 
          p: 2, 
          textAlign: 'center',
          bgcolor: alpha(theme.palette.background.default, 0.3),
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {entries.length} total entries in {monthYear}
        </Typography>
      </Box>

      {/* Hover Popup */}
      <Popover
        open={Boolean(hoverAnchor)}
        anchorEl={hoverAnchor}
        onClose={handleHoverClose}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        disableRestoreFocus
        sx={{
          pointerEvents: 'none',
          '& .MuiPopover-paper': {
            maxWidth: 320,
            maxHeight: 400,
            pointerEvents: 'auto'
          }
        }}
      >
        {hoverData && (
          <Box sx={{ p: 2 }}>
            {/* Popup Header */}
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              {hoverData.date.toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric'
              })}
            </Typography>
            
            {/* Entry Summary */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {Object.values(hoverData.dayEntries).reduce((sum, arr) => sum + arr.length, 0)} total entries
              </Typography>
            </Box>

            {/* Entry Types */}
            <List dense sx={{ p: 0 }}>
              {Object.entries(hoverData.dayEntries).map(([type, typeEntries]) => {
                const typeConfig = Object.values(TIMELINE_TYPES).find(t => t.type === type);
                const count = typeEntries.length;
                const group = getTimelineEntryGroup(type) || type;
                const color = getTypeColor(theme, group);
                return (
                  <ListItem key={type} sx={{ px: 0, py: 0.5 }}>
                    <ListItemAvatar sx={{ minWidth: 36 }}>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: color, fontSize: '0.8rem' }}>
                        {typeConfig?.icon || '📝'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{typeConfig?.label || type}</Typography>}
                      secondary={<Typography variant="caption" color="text.secondary">{count} {count === 1 ? 'entry' : 'entries'}</Typography>}
                    />
                  </ListItem>
                );
              })}
            </List>

            <Divider sx={{ my: 1 }} />

            {/* Quick Preview of Latest Entries */}
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
              Latest entries:
            </Typography>
            {Object.values(hoverData.dayEntries)
              .flat()
              .sort((a, b) => {
                const aTime = a.timestamp?.toDate?.() || new Date(a.timestamp);
                const bTime = b.timestamp?.toDate?.() || new Date(b.timestamp);
                return bTime - aTime;
              })
              .slice(0, 3)
              .map((entry, index) => (
                <Typography 
                  key={index}
                  variant="caption" 
                  color="text.secondary"
                  sx={{ 
                    display: 'block',
                    mb: 0.5,
                    fontSize: '0.7rem'
                  }}
                >
                  • {entry.title}
                </Typography>
              ))
            }

            <Typography 
              variant="caption" 
              color={theme.palette.primary.main} 
              sx={{ 
                display: 'block',
                mt: 1,
                fontWeight: 600,
                cursor: 'pointer'
              }}
              onClick={() => {
                handleHoverClose();
                onDayClick(hoverData.day, hoverData.dayEntries);
              }}
            >
              Click to view all details →
            </Typography>
          </Box>
        )}
      </Popover>
    </Paper>
  );
};

export default TimelineCalendar;
