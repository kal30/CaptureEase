import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Collapse,
  Tooltip,
  Stack,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Schedule as ScheduleIcon,
  Label as LabelIcon,
  Source as SourceIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

/**
 * EventTimelineItem - Individual event display component
 *
 * Features:
 * - Shows event content with source indicator
 * - Displays classifier tags/buckets when available
 * - Expandable details view
 * - Source-specific styling and icons
 * - Timestamp and metadata display
 *
 * @param {Object} props
 * @param {Object} props.event - Event object to display
 * @param {boolean} props.isLast - Whether this is the last item in timeline
 */
const EventTimelineItem = ({ event, isLast = false }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  // Get source-specific styling
  const sourceConfig = getSourceConfig(event.source);
  const timestamp = new Date(event.timestamp);
  const timeString = timestamp.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Box sx={{ display: 'flex', position: 'relative', minHeight: 80 }}>
      {/* Timeline dot */}
      <Box
        sx={{
          width: 40,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          pt: 2,
          flexShrink: 0,
          zIndex: 2
        }}
      >
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            bgcolor: sourceConfig.color,
            border: '3px solid',
            borderColor: 'background.paper',
            boxShadow: `0 0 0 2px ${sourceConfig.color}20`
          }}
        />
      </Box>

      {/* Event card */}
      <Box sx={{ flex: 1, ml: 2 }}>
        <Card
          variant="outlined"
          sx={{
            borderLeft: '3px solid',
            borderLeftColor: sourceConfig.color,
            '&:hover': {
              boxShadow: 2
            }
          }}
        >
          <CardContent sx={{ pb: '16px !important' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
              <Box sx={{ flex: 1 }}>
                {/* Time and source */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {timeString}
                  </Typography>
                  <Chip
                    label={sourceConfig.label}
                    size="small"
                    icon={sourceConfig.icon}
                    sx={{
                      height: 20,
                      bgcolor: sourceConfig.color + '15',
                      color: sourceConfig.color,
                      '& .MuiChip-icon': {
                        fontSize: 14
                      }
                    }}
                  />
                </Box>

                {/* Event title/summary */}
                <Typography variant="body1" sx={{ fontWeight: 500, lineHeight: 1.3 }}>
                  {event.title || event.content?.substring(0, 100) || 'Event'}
                  {event.content && event.content.length > 100 && '...'}
                </Typography>
              </Box>

              {/* Expand button */}
              {(event.content || event.metadata || event.buckets?.length > 0) && (
                <IconButton size="small" onClick={handleExpandClick}>
                  {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              )}
            </Box>

            {/* Bucket/classifier tags */}
            {event.buckets && event.buckets.length > 0 && (
              <Box sx={{ mb: 1.5 }}>
                <Stack direction="row" spacing={0.5} flexWrap="wrap">
                  <LabelIcon sx={{ fontSize: 14, color: 'text.secondary', mr: 0.5, mt: 0.5 }} />
                  {event.buckets.map((bucket, index) => (
                    <Chip
                      key={index}
                      label={bucket}
                      size="small"
                      variant="outlined"
                      color="secondary"
                      sx={{ height: 22, fontSize: '0.7rem' }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {/* Preview content (first line if collapsed) */}
            {event.content && !expanded && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: '0.875rem'
                }}
              >
                {event.content.split('\n')[0]}
              </Typography>
            )}
          </CardContent>

          {/* Expanded content */}
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <CardContent sx={{ pt: 0, borderTop: '1px solid', borderColor: 'divider' }}>
              {/* Full content */}
              {event.content && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                    CONTENT
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      bgcolor: 'grey.50',
                      p: 1.5,
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    {event.content}
                  </Typography>
                </Box>
              )}

              {/* Metadata */}
              {event.metadata && Object.keys(event.metadata).length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                    DETAILS
                  </Typography>
                  <Stack spacing={1}>
                    {Object.entries(event.metadata).map(([key, value]) => (
                      <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </Typography>
                        <Typography variant="body2">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Additional info */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Event ID: {event.id}
                </Typography>
                {event.author && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PersonIcon sx={{ fontSize: 14 }} />
                    <Typography variant="caption" color="text.secondary">
                      {event.author}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Collapse>
        </Card>
      </Box>
    </Box>
  );
};

// Helper function to get source-specific configuration
const getSourceConfig = (source) => {
  const configs = {
    sms: {
      label: 'SMS',
      icon: '💬',
      color: '#2196F3' // Blue
    },
    whatsapp: {
      label: 'WhatsApp',
      icon: '💚',
      color: '#25D366' // WhatsApp green
    },
    web: {
      label: 'Web',
      icon: '🌐',
      color: '#9C27B0' // Purple
    },
    email: {
      label: 'Email',
      icon: '📧',
      color: '#FF5722' // Deep orange
    },
    app: {
      label: 'App',
      icon: '📱',
      color: '#4CAF50' // Green
    }
  };

  return configs[source?.toLowerCase()] || {
    label: source || 'Unknown',
    icon: '📄',
    color: '#757575' // Grey
  };
};

export default EventTimelineItem;