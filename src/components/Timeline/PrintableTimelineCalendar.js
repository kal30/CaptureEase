import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { TIMELINE_TYPES } from '../../services/timelineService';

const PrintableTimelineCalendar = ({ entries, onDayClick, filters }) => {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const isWeekend = (day) => {
    const dayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
  };

  const getDayEntries = (day) => {
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateKey = dayDate.toDateString();
    return calendarData[dateKey] || {};
  };

  const renderDayIndicators = (dayEntries) => {
    const types = Object.keys(dayEntries);
    if (types.length === 0) return null;

    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 0.5,
          mt: 0.5,
          flexWrap: 'wrap'
        }}
      >
        {types.slice(0, 5).map(type => {
          const typeConfig = Object.values(TIMELINE_TYPES).find(t => t.type === type);
          
          return (
            <Box
              key={type}
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: typeConfig?.color || theme.palette.grey[600],
                '@media print': {
                  bgcolor: typeConfig?.color || '#666'
                }
              }}
            />
          );
        })}
        {types.length > 5 && (
          <Typography
            variant="caption"
            sx={{
              fontSize: '8px',
              color: theme.palette.text.secondary,
              fontWeight: 600
            }}
          >
            +{types.length - 5}
          </Typography>
        )}
      </Box>
    );
  };

  // Generate calendar weeks
  const weeks = [];
  let currentWeek = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day);
    
    // If we've filled a week (7 days) or reached the last day
    if (currentWeek.length === 7) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  }
  
  // Add remaining empty cells if needed
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: 'white',
        '@media print': {
          border: '2px solid #000',
          boxShadow: 'none',
          bgcolor: 'white'
        }
      }}
    >
      {/* Calendar Header */}
      <Box 
        sx={{ 
          p: 2,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`,
          '@media print': {
            borderBottom: '2px solid #000'
          }
        }}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 700,
            color: 'text.primary',
            '@media print': {
              color: '#000',
              fontSize: '1.5rem'
            }
          }}
        >
          {monthYear}
        </Typography>
        
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 0.5,
            '@media print': {
              display: 'none'
            }
          }}
        >
          <IconButton 
            size="small"
            onClick={() => navigateMonth(-1)}
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton 
            size="small"
            onClick={goToToday}
          >
            <TodayIcon />
          </IconButton>
          <IconButton 
            size="small"
            onClick={() => navigateMonth(1)}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Calendar Table */}
      <Table 
        sx={{ 
          '& .MuiTableCell-root': {
            border: `1px solid ${theme.palette.divider}`,
            '@media print': {
              border: '1px solid #000'
            }
          }
        }}
      >
        {/* Week Days Header */}
        <TableHead>
          <TableRow>
            {weekDays.map((day) => (
              <TableCell
                key={day}
                align="center"
                sx={{
                  bgcolor: theme.palette.grey[100],
                  fontWeight: 700,
                  py: 1,
                  '@media print': {
                    bgcolor: '#f5f5f5',
                    color: '#000',
                    fontSize: '0.875rem'
                  }
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {day}
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        {/* Calendar Body */}
        <TableBody>
          {weeks.map((week, weekIndex) => (
            <TableRow key={weekIndex}>
              {week.map((day, dayIndex) => {
                const dayOfWeek = dayIndex;
                const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;
                const dayEntries = day ? getDayEntries(day) : {};
                const totalEntries = Object.values(dayEntries).reduce((sum, arr) => sum + arr.length, 0);
                const isCurrentDay = day ? isToday(day) : false;

                return (
                  <TableCell
                    key={dayIndex}
                    align="center"
                    sx={{
                      height: 120,
                      width: '14.28%',
                      verticalAlign: 'top',
                      bgcolor: day 
                        ? isCurrentDay
                          ? theme.palette.primary.light + '20'
                          : isWeekendDay
                            ? theme.palette.grey[50]
                            : 'white'
                        : theme.palette.grey[100],
                      cursor: totalEntries > 0 ? 'pointer' : 'default',
                      position: 'relative',
                      p: 1,
                      '@media print': {
                        bgcolor: day 
                          ? isCurrentDay
                            ? '#e3f2fd'
                            : isWeekendDay
                              ? '#fafafa'
                              : 'white'
                          : '#f5f5f5',
                        height: '100px'
                      },
                      '&:hover': {
                        bgcolor: day && totalEntries > 0 
                          ? theme.palette.primary.light + '10'
                          : undefined
                      }
                    }}
                    onClick={() => day && totalEntries > 0 && onDayClick(day, dayEntries)}
                  >
                    {day && (
                      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {/* Day Number */}
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontWeight: isCurrentDay ? 700 : isWeekendDay ? 600 : 400,
                            color: isCurrentDay 
                              ? theme.palette.primary.main 
                              : isWeekendDay
                                ? theme.palette.text.secondary
                                : theme.palette.text.primary,
                            mb: 'auto',
                            '@media print': {
                              color: isCurrentDay ? '#1976d2' : '#000',
                              fontSize: '1rem'
                            }
                          }}
                        >
                          {day}
                        </Typography>

                        {/* Entry Indicators */}
                        {renderDayIndicators(dayEntries)}
                      </Box>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Legend */}
      <Box 
        sx={{ 
          p: 2, 
          borderTop: `1px solid ${theme.palette.divider}`,
          '@media print': {
            borderTop: '1px solid #000'
          }
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Entry Types:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {Object.values(TIMELINE_TYPES).map(type => (
            <Box key={type.type} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: type.color,
                  '@media print': {
                    bgcolor: type.color
                  }
                }}
              />
              <Typography 
                variant="caption" 
                sx={{ 
                  '@media print': { 
                    color: '#000',
                    fontSize: '0.75rem'
                  }
                }}
              >
                {type.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default PrintableTimelineCalendar;