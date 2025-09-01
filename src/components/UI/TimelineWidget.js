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
import TimelineProgressRing from './TimelineProgressRing';
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
  
  // Debug: Log current state
  console.log('TimelineWidget state:', {
    childId: child?.id,
    childName: child?.name,
    selectedDate,
    entriesCount: entries.length,
    childSpecificEntriesCount: entries.filter(entry => 
      entry.childId === child?.id || entry.child?.id === child?.id
    ).length
  });
 // 'daily' or 'recent'
  const [timelineFilters, setTimelineFilters] = useState({}); // Unified timeline filters
  
  // Filter entries to ensure they belong to the current child
  const childSpecificEntries = entries.filter(entry => 
    entry.childId === child?.id || entry.child?.id === child?.id
  );
  
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
    console.log('Progress ring clicked for child:', child?.id, child?.name);
    if (!expanded) {
      setExpanded(true);
    }
  };

  const handleViewFullTimeline = () => {
    setShowTimelineModal(true);
  };

  // Test function to check if any data exists at all
  const testDataExists = async () => {
    try {
      console.log('🔍 Testing if ANY data exists in collections...');
      
      // Import Firebase functions locally for testing
      const { collection, getDocs, query, limit, orderBy, where } = await import('firebase/firestore');
      const { db } = await import('../../services/firebase');
      
      // Test each collection with a simple limit query - check multiple possible names
      const collections = [
        'incidents', 
        'journalEntries', 'journal_entries', 'journals',
        'dailyLogs', 'daily_logs', 'dailyLog', 'daily-logs',
        'followUpResponses', 'follow_up_responses', 'followUps'
      ];
      
      for (const collectionName of collections) {
        try {
          // Test 1: Any data at all
          const testQuery = query(collection(db, collectionName), limit(5));
          const snapshot = await getDocs(testQuery);
          console.log(`📊 Collection '${collectionName}':`, {
            exists: snapshot.size > 0,
            count: snapshot.size
          });
          
          // Test 2: Recent data (last 24 hours)
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          try {
            const recentQuery = query(
              collection(db, collectionName),
              where('timestamp', '>=', yesterday),
              orderBy('timestamp', 'desc'),
              limit(5)
            );
            const recentSnapshot = await getDocs(recentQuery);
            console.log(`📅 Recent '${collectionName}' (last 24h):`, {
              count: recentSnapshot.size,
              docs: recentSnapshot.docs.map(doc => ({
                id: doc.id,
                timestamp: doc.data().timestamp?.toDate(),
                childId: doc.data().childId,
                ...doc.data()
              }))
            });
          } catch (recentErr) {
            console.log(`⚠️  No recent data for '${collectionName}' or index missing:`, recentErr.message);
          }
          
          // Test 3: For current child specifically
          if (child?.id) {
            try {
              const childQuery = query(
                collection(db, collectionName),
                where('childId', '==', child.id),
                limit(5)
              );
              const childSnapshot = await getDocs(childQuery);
              console.log(`👶 '${collectionName}' for child ${child.id}:`, {
                count: childSnapshot.size,
                docs: childSnapshot.docs.map(doc => ({
                  id: doc.id,
                  timestamp: doc.data().timestamp?.toDate(),
                  ...doc.data()
                }))
              });
            } catch (childErr) {
              console.log(`⚠️  Error querying '${collectionName}' for child:`, childErr.message);
            }
          }
          
        } catch (err) {
          console.error(`❌ Error testing collection '${collectionName}':`, err);
        }
      }
    } catch (error) {
      console.error('❌ Error in testDataExists:', error);
    }
  };

  // Specific test for journal/daily log collections
  const testJournalCollections = async () => {
    try {
      console.log('📔 Testing specific journal/daily log collections...');
      
      const { collection, getDocs, query, limit, where } = await import('firebase/firestore');
      const { db } = await import('../../services/firebase');
      
      // Test subcollections under children/{childId}/
      const journalSubcollections = ['journals', 'journal_entries', 'journal'];
      const dailyLogSubcollections = ['moodLogs', 'dailyLogs', 'daily_logs', 'logs'];
      
      if (child?.id) {
        console.log(`Testing journal subcollections for child ${child.id}:`);
        for (const name of journalSubcollections) {
          try {
            const snapshot = await getDocs(query(collection(db, 'children', child.id, name), limit(3)));
            if (snapshot.size > 0) {
              console.log(`✅ Found journal subcollection: 'children/${child.id}/${name}' (${snapshot.size} docs)`);
              snapshot.docs.forEach((doc, i) => {
                console.log(`  Journal ${i + 1}:`, doc.data());
              });
            } else {
              console.log(`📭 Empty subcollection: 'children/${child.id}/${name}'`);
            }
          } catch (err) {
            console.log(`❌ Subcollection 'children/${child.id}/${name}' doesn't exist or error:`, err.message);
          }
        }
      }
      
      if (child?.id) {
        console.log(`Testing daily log subcollections for child ${child.id}:`);
        for (const name of dailyLogSubcollections) {
          try {
            const snapshot = await getDocs(query(collection(db, 'children', child.id, name), limit(3)));
            if (snapshot.size > 0) {
              console.log(`✅ Found daily log subcollection: 'children/${child.id}/${name}' (${snapshot.size} docs)`);
              snapshot.docs.forEach((doc, i) => {
                console.log(`  Daily Log ${i + 1}:`, doc.data());
              });
            } else {
              console.log(`📭 Empty subcollection: 'children/${child.id}/${name}'`);
            }
          } catch (err) {
            console.log(`❌ Subcollection 'children/${child.id}/${name}' doesn't exist or error:`, err.message);
          }
        }
      }
      
      
    } catch (error) {
      console.error('❌ Error in testJournalCollections:', error);
    }
  };

  const handleDayClick = (day, dayEntries, date) => {
    // Handle day click from mini calendar or timeline calendar
    console.log('Day clicked for child:', child?.id, child?.name, { day, date, entriesCount: dayEntries?.length || 0 });
    if (showUnifiedLog) {
      setSelectedDate(date);
      if (!expanded) {
        setExpanded(true);
      }
    } else {
      // Legacy behavior
      if (dayEntries?.length > 0) {
        console.log('Day clicked:', { day, dayEntries, date });
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
                    {timeline.hasActivity ? 
                      `${timeline.metrics?.totalCount || 0} total entries` : 
                      'No activity yet'
                    } | <span onClick={(e) => {e.stopPropagation(); testDataExists();}}>🔍 Test DB</span> | <span onClick={(e) => {e.stopPropagation(); setSelectedDate(new Date(selectedDate));}}>🔄 Refresh</span> | <span onClick={(e) => {e.stopPropagation(); testJournalCollections();}}>📔 Test Journal</span>
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
                  width: { xs: '100%', md: 'auto' }
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