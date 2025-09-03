import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Collapse,
  Stack,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { getEntryTypeMeta, mapLegacyType } from '../../constants/timeline';
import { getIncidentDisplayInfo, getJournalDisplayInfo } from '../../constants/uiDisplayConstants';

/**
 * UnifiedTimelineEntry - Single timeline entry display with expandable details
 * Handles incidents, daily logs, journal entries, and follow-ups
 * 
 * @param {Object} props
 * @param {Object} props.entry - Timeline entry data
 * @param {boolean} props.isExpanded - Whether entry is expanded
 * @param {Function} props.onToggleExpand - Callback to toggle expansion
 * @param {boolean} props.showTimestamp - Whether to show exact timestamp
 * @param {boolean} props.showUser - Whether to show who logged the entry
 * @param {boolean} props.compact - Compact display mode
 */
const UnifiedTimelineEntry = ({
  entry,
  isExpanded = false,
  onToggleExpand,
  showTimestamp = true,
  showUser = true,
  compact = false
}) => {
  // Get centralized display info
  const incidentDisplay = getIncidentDisplayInfo();
  const journalDisplay = getJournalDisplayInfo();

  const theme = useTheme();
  const normalizedType = mapLegacyType(entry.type);
  const typeMeta = getEntryTypeMeta(entry.type);
  const typeColor = theme.palette.timeline?.entries?.[typeMeta.key] || theme.palette.primary.main;

  // Get user role color using centralized theme.palette.roles
  const getUserRoleColor = (userRole) => {
    const mapRoleKey = (r) => {
      switch (r) {
        case 'parent':
        case 'primary_parent': return 'primary_parent';
        case 'family':
        case 'family_member': return 'family_member';
        case 'co_parent': return 'co_parent';
        case 'caregiver': return 'caregiver';
        case 'therapist': return 'therapist';
        default: return null;
      }
    };
    const key = mapRoleKey(userRole);
    return key && theme.palette.roles?.[key]?.primary
      ? theme.palette.roles[key].primary
      : theme.palette.text.secondary;
  };

  const timestamp = new Date(entry.timestamp);
  const timeString = timestamp.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Get entry preview content
  const getPreviewContent = () => {
    switch (entry.type) {
      case 'incident':
        return {
          primary: `${entry.incidentType || incidentDisplay.label} - ${entry.severity || 'Unknown'} severity`,
          secondary: entry.description || entry.summary,
          hasMedia: entry.mediaAttachments?.length > 0
        };
      case 'journal':
        return {
          primary: entry.title || `${journalDisplay.label} Entry`,
          secondary: entry.content?.substring(0, 100) + (entry.content?.length > 100 ? '...' : ''),
          hasMedia: false
        };
      case 'dailyLog':
        return {
          primary: `${entry.activityType || 'Activity'} - ${entry.mood || 'No mood recorded'}`,
          secondary: entry.notes || entry.description,
          hasMedia: false
        };
      case 'followUp':
        return {
          primary: `${entry.status || 'Update'} - ${entry.originalIncidentType || 'Follow-up'}`,
          secondary: entry.resolution || entry.notes,
          hasMedia: false
        };
      default:
        return {
          primary: entry.title || 'Timeline Entry',
          secondary: entry.description || entry.content,
          hasMedia: false
        };
    }
  };

  const previewContent = getPreviewContent();

  return (
    <Card
      variant="outlined"
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderLeft: `4px solid ${typeColor}`,
        bgcolor: isExpanded ? alpha(typeColor, 0.06) : 'background.paper',
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: alpha(typeColor, 0.06),
          boxShadow: 1
        }
      }}
    >
      <CardContent sx={{ p: compact ? 1.5 : 2, '&:last-child': { pb: compact ? 1.5 : 2 } }}>
        {/* Entry Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          {/* Type Avatar */}
          <Avatar
            sx={{
              width: compact ? 24 : 32,
              height: compact ? 24 : 32,
              bgcolor: typeColor,
              color: 'common.white',
              fontSize: compact ? 14 : 18,
            }}
          >
            {typeMeta.icon}
          </Avatar>

          {/* Entry Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Title Row */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Chip
                label={typeMeta.label.replace(/s$/, '')}
                size="small"
                variant="filled"
                sx={{ 
                  height: 20, 
                  fontSize: '0.7rem',
                  bgcolor: alpha(typeColor, 0.15),
                  color: typeColor
                }}
              />
              
              {showTimestamp && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                  <TimeIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {timeString}
                  </Typography>
                </Box>
              )}

              {showUser && entry.loggedByUser && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                  <PersonIcon sx={{ fontSize: 12, color: getUserRoleColor(entry.userRole) }} />
                  <Typography 
                    variant="caption" 
                    sx={{ color: getUserRoleColor(entry.userRole), fontWeight: 500 }}
                  >
                    {entry.loggedByUser}
                  </Typography>
                </Box>
              )}

              {previewContent.hasMedia && (
                <Chip
                  label="Media"
                  size="small"
                  variant="outlined"
                  sx={{ height: 16, fontSize: '0.6rem' }}
                />
              )}

              {/* Expand Button */}
              <IconButton
                size="small"
                onClick={onToggleExpand}
                sx={{
                  ml: 'auto',
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }}
              >
                <ExpandIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>

            {/* Preview Content */}
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.25 }}>
              {previewContent.primary}
            </Typography>
            
            {previewContent.secondary && (
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: isExpanded ? 'unset' : 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {previewContent.secondary}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Expandable Details */}
        <Collapse in={isExpanded}>
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            
            {/* Detailed Content based on entry type */}
            {normalizedType === 'incident' && (
              <Stack spacing={1}>
                <Typography variant="subtitle2" gutterBottom>
                  {incidentDisplay.label} Details
                </Typography>
                {entry.triggers && (
                  <Typography variant="body2">
                    <strong>Triggers:</strong> {Array.isArray(entry.triggers) ? entry.triggers.join(', ') : entry.triggers}
                  </Typography>
                )}
                {entry.duration && (
                  <Typography variant="body2">
                    <strong>Duration:</strong> {entry.duration} minutes
                  </Typography>
                )}
                {entry.interventions && (
                  <Typography variant="body2">
                    <strong>Interventions:</strong> {Array.isArray(entry.interventions) ? entry.interventions.join(', ') : entry.interventions}
                  </Typography>
                )}
              </Stack>
            )}

            {normalizedType === 'journal' && (
              <Stack spacing={1}>
                <Typography variant="subtitle2" gutterBottom>
                  Full {journalDisplay.label} Entry
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {entry.content}
                </Typography>
              </Stack>
            )}

            {normalizedType === 'dailyLog' && (
              <Stack spacing={1}>
                <Typography variant="subtitle2" gutterBottom>
                  Activity Details
                </Typography>
                {entry.duration && (
                  <Typography variant="body2">
                    <strong>Duration:</strong> {entry.duration}
                  </Typography>
                )}
                {entry.quantity && (
                  <Typography variant="body2">
                    <strong>Amount:</strong> {entry.quantity}
                  </Typography>
                )}
              </Stack>
            )}

            {/* Media attachments */}
            {entry.mediaAttachments?.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Attachments
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                  {entry.mediaAttachments.map((media, index) => (
                    <Box
                      key={index}
                      component="img"
                      src={media.url}
                      alt={media.caption || 'Attachment'}
                      sx={{
                        width: 60,
                        height: 60,
                        objectFit: 'cover',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default UnifiedTimelineEntry;
