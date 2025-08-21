import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  Collapse,
  IconButton,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';

const TimelineEntry = ({ entry, isFirst = false, isLast = false }) => {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const timeInfo = formatTime(entry.timestamp);
  const hasContent = entry.content && entry.content.trim().length > 0;
  const contentPreview = hasContent ? 
    (entry.content.length > 100 ? entry.content.substring(0, 100) + '...' : entry.content) : 
    'No additional details';

  return (
    <Box sx={{ position: 'relative', display: 'flex', mb: 2 }}>
      {/* Timeline Line */}
      {!isLast && (
        <Box
          sx={{
            position: 'absolute',
            left: 24,
            top: 48,
            bottom: -16,
            width: 2,
            bgcolor: alpha(theme.palette.divider, 0.3),
            zIndex: 0
          }}
        />
      )}

      {/* Timeline Dot */}
      <Box sx={{ mr: 2, zIndex: 1 }}>
        <Avatar
          sx={{
            width: 48,
            height: 48,
            bgcolor: entry.color,
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            border: `3px solid ${alpha(entry.color, 0.2)}`,
            boxShadow: `0 0 0 4px ${alpha(entry.color, 0.1)}`
          }}
        >
          {entry.icon}
        </Avatar>
      </Box>

      {/* Content Card */}
      <Card
        elevation={0}
        sx={{
          flex: 1,
          border: `1px solid ${alpha(entry.color, 0.2)}`,
          borderRadius: 2,
          bgcolor: alpha(entry.color, 0.02),
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: alpha(entry.color, 0.3),
            bgcolor: alpha(entry.color, 0.04),
            transform: 'translateY(-1px)',
            boxShadow: `0 4px 12px ${alpha(entry.color, 0.15)}`
          }
        }}
      >
        <CardContent sx={{ pb: expanded ? 2 : '16px !important' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ flex: 1, mr: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Chip
                  label={entry.label}
                  size="small"
                  sx={{
                    bgcolor: alpha(entry.color, 0.1),
                    color: entry.color,
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    height: 24
                  }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TimeIcon sx={{ fontSize: 14 }} />
                  {timeInfo.date} at {timeInfo.time}
                </Typography>
              </Box>
              
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'text.primary',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  lineHeight: 1.3
                }}
              >
                {entry.title}
              </Typography>
            </Box>

            {hasContent && (
              <IconButton
                onClick={handleExpandClick}
                size="small"
                sx={{
                  color: entry.color,
                  '&:hover': { bgcolor: alpha(entry.color, 0.1) }
                }}
              >
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}
          </Box>

          {/* Content Preview */}
          {!expanded && hasContent && (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                mb: 1,
                fontStyle: entry.content.length <= 100 ? 'normal' : 'italic'
              }}
            >
              {contentPreview}
            </Typography>
          )}

          {/* Author Info */}
          {entry.author && entry.author !== 'Unknown' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
              <PersonIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {entry.author}
              </Typography>
            </Box>
          )}

          {/* Expanded Content */}
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Divider sx={{ my: 2, borderColor: alpha(entry.color, 0.1) }} />
            <Typography variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-wrap' }}>
              {entry.content}
            </Typography>
            
            {/* Additional Data (if available) */}
            {entry.originalData && Object.keys(entry.originalData).length > 0 && (
              <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.background.default, 0.5), borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                  Additional Details:
                </Typography>
                {Object.entries(entry.originalData)
                  .filter(([key, value]) => !['timestamp', 'createdAt', 'note', 'content', 'description', 'title'].includes(key) && value)
                  .map(([key, value]) => (
                    <Typography key={key} variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {String(value)}
                    </Typography>
                  ))
                }
              </Box>
            )}
          </Collapse>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TimelineEntry;