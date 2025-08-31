import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Grid,
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
import { TIMELINE_TYPES } from '../../services/timelineService';

const SimpleTimelineCalendar = ({ entries, onDayClick, filters }) => {
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

  const renderDayDots = (dayEntries) => {
    const types = Object.keys(dayEntries);
    if (types.length === 0) return null;

    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 0.3, 
          position: 'absolute',
          bottom: 2,
          left: 0,
          right: 0,
          flexWrap: 'wrap',
          px: 0.5
        }}
      >
        {types.slice(0, 4).map(type => {
          const typeConfig = Object.values(TIMELINE_TYPES).find(t => t.type === type);
          
          return (
            <Box
              key={type}
              sx={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                bgcolor: typeConfig?.color || theme.palette.grey[400]
              }}
            />
          );
        })}
        {types.length > 4 && (
          <Typography
            variant="caption"
            sx={{
              fontSize: '6px',
              color: 'text.secondary',
              fontWeight: 700
            }}
          >
            +{types.length - 4}
          </Typography>
        )}
      </Box>
    );
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

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        maxWidth: 400,
        mx: 'auto'
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
            color: 'text.primary',
            fontSize: '1rem'
          }}
        >
          {monthYear}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton 
            size="small"
            onClick={() => navigateMonth(-1)}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small"
            onClick={goToToday}
          >
            <TodayIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small"
            onClick={() => navigateMonth(1)}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Week Days Header */}
      <Box sx={{ bgcolor: alpha(theme.palette.grey[100], 0.3) }}>
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
                  variant="caption" 
                  sx={{ 
                    fontWeight: 600,
                    color: 'text.secondary',
                    fontSize: '0.7rem'
                  }}
                >
                  {day}
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
                    height: 32,
                    borderRight: (index + 1) % 7 !== 0 ? `1px solid ${alpha(theme.palette.divider, 0.3)}` : 'none',
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`
                  }} 
                />
              </Grid>
            );
          }

          const dayEntries = getDayEntries(day);
          const totalEntries = Object.values(dayEntries).reduce((sum, arr) => sum + arr.length, 0);
          const isCurrentDay = isToday(day);
          const isFuture = isDayInFuture(day);

          return (
            <Grid item xs key={day}>
              <Box
                sx={{
                  height: 32,
                  borderRight: (index + 1) % 7 !== 0 ? `1px solid ${alpha(theme.palette.divider, 0.3)}` : 'none',
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                  cursor: totalEntries > 0 ? 'pointer' : 'default',
                  bgcolor: isCurrentDay 
                    ? alpha(theme.palette.primary.main, 0.1)
                    : 'background.paper',
                  opacity: isFuture ? 0.5 : 1,
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: totalEntries > 0 
                      ? alpha(theme.palette.primary.main, 0.05)
                      : isCurrentDay 
                        ? alpha(theme.palette.primary.main, 0.12)
                        : alpha(theme.palette.grey[50], 0.5)
                  },
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={() => totalEntries > 0 && onDayClick(day, dayEntries)}
                onMouseEnter={(e) => handleDayHover(e, day, dayEntries)}
                onMouseLeave={handleHoverClose}
              >
                {/* Day Number */}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: isCurrentDay ? 700 : 400,
                    color: isCurrentDay 
                      ? theme.palette.primary.main 
                      : isFuture 
                        ? 'text.disabled'
                        : 'text.primary',
                    fontSize: '0.75rem'
                  }}
                >
                  {day}
                </Typography>

                {/* Entry Dots at Bottom */}
                {renderDayDots(dayEntries)}
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {/* Hover Popup */}
      <Popover
        open={Boolean(hoverAnchor)}
        anchorEl={hoverAnchor}
        onClose={handleHoverClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        disableRestoreFocus
        sx={{
          pointerEvents: 'none',
          '& .MuiPopover-paper': {
            maxWidth: 280,
            maxHeight: 300,
            pointerEvents: 'auto'
          }
        }}
      >
        {hoverData && (
          <Box sx={{ p: 2 }}>
            {/* Popup Header */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              {hoverData.date.toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'short', 
                day: 'numeric'
              })}
            </Typography>
            
            {/* Entry Summary */}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              {Object.values(hoverData.dayEntries).reduce((sum, arr) => sum + arr.length, 0)} entries
            </Typography>

            {/* Entry Types */}
            <List dense sx={{ p: 0 }}>
              {Object.entries(hoverData.dayEntries).map(([type, typeEntries]) => {
                const typeConfig = Object.values(TIMELINE_TYPES).find(t => t.type === type);
                const count = typeEntries.length;
                
                return (
                  <ListItem key={type} sx={{ px: 0, py: 0.25 }}>
                    <ListItemAvatar sx={{ minWidth: 28 }}>
                      <Avatar
                        sx={{
                          width: 20,
                          height: 20,
                          bgcolor: typeConfig?.color || theme.palette.grey[400],
                          fontSize: '0.6rem'
                        }}
                      >
                        {typeConfig?.icon || '📝'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
                          {typeConfig?.label || type} ({count})
                        </Typography>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>

            <Typography 
              variant="caption" 
              color={theme.palette.primary.main} 
              sx={{ 
                display: 'block',
                mt: 1,
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.7rem'
              }}
              onClick={() => {
                handleHoverClose();
                onDayClick(hoverData.day, hoverData.dayEntries);
              }}
            >
              Click for details →
            </Typography>
          </Box>
        )}
      </Popover>
    </Paper>
  );
};

export default SimpleTimelineCalendar;

