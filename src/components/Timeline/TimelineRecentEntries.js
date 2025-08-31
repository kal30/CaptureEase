import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip
} from '@mui/material';
import { Timeline as TimelineIcon } from '@mui/icons-material';

/**
 * TimelineRecentEntries - Displays recent timeline entries
 * Extracted from TimelineWidget for better organization
 * 
 * @param {Object} props
 * @param {Array} props.entries - Recent timeline entries
 * @param {Function} props.getEntryIcon - Function to get icon for entry type
 * @param {Function} props.formatEntryTime - Function to format entry timestamp
 */
const TimelineRecentEntries = ({ 
  entries = [], 
  getEntryIcon, 
  formatEntryTime 
}) => {
  
  if (!entries.length) {
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
      {entries.map((entry, index) => (
        <ListItem
          key={`${entry.type}-${entry.id}`}
          className={`timeline-widget__entry timeline-widget__entry--${entry.type}`}
          sx={{ 
            px: 0,
            borderLeft: '3px solid',
            borderLeftColor: entry.priority === 'high' ? 'error.main' : 'primary.main',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <ListItemAvatar>
            <Avatar 
              sx={{ 
                width: 28, 
                height: 28, 
                bgcolor: 'primary.light',
                '& .MuiSvgIcon-root': { fontSize: 16 }
              }}
            >
              {getEntryIcon ? getEntryIcon(entry) : <TimelineIcon />}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="body2" component="span" sx={{ fontWeight: 500 }}>
                  {entry.title || entry.type}
                </Typography>
                {entry.priority === 'high' && (
                  <Chip 
                    label="High" 
                    size="small" 
                    color="error" 
                    sx={{ height: 16, fontSize: '0.625rem' }} 
                  />
                )}
              </Box>
            }
            secondary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {formatEntryTime ? formatEntryTime(entry.timestamp) : new Date(entry.timestamp).toLocaleTimeString()}
                </Typography>
                {entry.description && (
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1
                    }}
                  >
                    {entry.description}
                  </Typography>
                )}
              </Box>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

export default TimelineRecentEntries;