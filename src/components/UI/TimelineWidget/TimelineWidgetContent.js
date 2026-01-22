import React, { useEffect, useState } from 'react';
import { Box, Button, Chip, List, ListItem, ListItemAvatar, ListItemText, Avatar, Typography } from '@mui/material';
import { Timeline as TimelineIcon, CalendarMonth as CalendarIcon, Share as ShareIcon } from '@mui/icons-material';
import { UnifiedTimeline } from '../../Timeline';
import useIsMobile from '../../../hooks/useIsMobile';

const TimelineWidgetContent = ({
  variant,
  timeline,
  daysLoggedThisWeek,
  showUnifiedLog,
  child,
  selectedDate,
  timelineFilters,
  onFiltersChange,
  onViewFullTimeline,
  onShareRecap,
  renderMiniCalendar,
  onAddLog,
  patternSummary
}) => {
  const isMobile = useIsMobile();
  const [showCalendar, setShowCalendar] = useState(!isMobile);

  useEffect(() => {
    setShowCalendar(!isMobile);
  }, [isMobile]);
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

  const renderMetrics = () => (
    <Box className="timeline-widget__metrics" sx={{ mb: 2 }}>
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          mb: 1,
          flexWrap: 'wrap',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center'
        }}
      >
        {!isMobile && patternSummary && (
          <Chip
            label={patternSummary}
            size="small"
            variant="filled"
            sx={{
              bgcolor: 'timeline.background',
              color: 'text.secondary',
              fontSize: '0.7rem'
            }}
          />
        )}
      </Box>
    </Box>
  );

  const renderLegacyContent = () => (
    <Box
      sx={{
        display: 'flex',
        gap: { xs: 2, sm: 2, md: 3 },
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'stretch', md: 'flex-start' }
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          width: { xs: '100%', md: 'auto' },
          display: 'flex',
          justifyContent: { xs: 'center', md: 'flex-start' }
        }}
      >
        {renderMiniCalendar({ selectedDate: undefined })}
      </Box>

      <Box
        sx={{
          flex: { xs: 'none', md: 1 },
          minWidth: 0,
          width: { xs: '100%', md: 'auto' }
        }}
      >
        {renderRecentEntries()}
      </Box>
    </Box>
  );

  return (
    <>
      {variant === 'full' && renderMetrics()}

      {showUnifiedLog ? (
        <Box
          sx={{
            display: 'flex',
            gap: { xs: 1.5, sm: 2, md: 3 },
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'flex-start' }
          }}
        >
          <Box
            sx={{
              flexShrink: 0,
              width: { xs: '100%', md: 'auto' },
              display: 'flex',
              flexDirection: 'column',
              alignItems: { xs: 'stretch', md: 'flex-start' }
            }}
          >
            {!isMobile && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.75 }}>
                <Button
                  size="small"
                  variant="text"
                  onClick={onAddLog}
                  sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                >
                  Add log
                </Button>
              </Box>
            )}
            {isMobile && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.75 }}>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => setShowCalendar((prev) => !prev)}
                  sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                >
                  {showCalendar ? 'Hide calendar' : 'Show calendar'}
                </Button>
              </Box>
            )}
            {(!isMobile || showCalendar) && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  transform: { xs: 'scale(0.92)', sm: 'none' },
                  transformOrigin: { xs: 'top left', sm: 'center' }
                }}
              >
                {renderMiniCalendar({})}
              </Box>
            )}
          </Box>

          <Box
            sx={{
              flex: { xs: 'none', md: 1 },
              minWidth: 0,
              width: { xs: '100%', md: 'auto' },
              mt: { xs: -0.5, sm: 0 }
            }}
          >
            <UnifiedTimeline
              child={child}
              selectedDate={selectedDate}
              filters={timelineFilters}
              onFiltersChange={onFiltersChange}
              showFilters={false}
              injectedEntries={timeline?.recentEntries || []}
            />
          </Box>
        </Box>
      ) : (
        renderLegacyContent()
      )}

      {timeline.hasActivity && (
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            mt: 2,
            justifyContent: 'center',
            flexWrap: 'wrap',
            flexDirection: isMobile ? 'column' : 'row',
            ...(isMobile
              ? {
                  position: 'sticky',
                  bottom: 0,
                  pb: 1.5,
                  pt: 1,
                  px: 1,
                  bgcolor: 'background.paper',
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  zIndex: 2
                }
              : {})
          }}
        >
          <Button
            size="small"
            variant="outlined"
            startIcon={<CalendarIcon />}
            onClick={onViewFullTimeline}
            sx={{ fontSize: '0.75rem', width: isMobile ? '100%' : 'auto' }}
          >
            View Full Timeline
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ShareIcon />}
            onClick={onShareRecap}
            sx={{ fontSize: '0.75rem', width: isMobile ? '100%' : 'auto' }}
          >
            Share Recap
          </Button>
        </Box>
      )}

    </>
  );
};

export default TimelineWidgetContent;
