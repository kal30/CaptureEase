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
import { getDailyLogDisplayInfo, getIncidentDisplayInfo } from '../../constants/uiDisplayConstants';
import { getCanonicalEntryDisplayInfo, getLogTypeByCategory, getLogTypeByEntry, isBehaviorIncidentEntry } from '../../constants/logTypeRegistry';
import { getSeverityMeta } from '../../services/incidentService';
import colors from '../../assets/theme/colors';

/**
 * UnifiedTimelineEntry - Single timeline entry display with expandable details
 * Handles incidents, daily logs, and follow-ups
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
  const dailyLogDisplay = getDailyLogDisplayInfo();

  const theme = useTheme();
  const normalizedType = mapLegacyType(entry.type);
  const typeMeta = getEntryTypeMeta(entry.type);
  const categoryType = getLogTypeByEntry(entry);
  const categoryMeta = getLogTypeByCategory(categoryType.category || entry.category || entry.type);
  const categoryDisplay = getCanonicalEntryDisplayInfo(entry);
  const isDailyLogEntry = entry.collection === 'dailyLogs' || normalizedType === 'dailyLog';
  const isBehaviorIncident = isBehaviorIncidentEntry(entry);
  const typeColor = entry.color || categoryMeta.palette?.dot || theme.palette.timeline?.entries?.[typeMeta.key] || theme.palette.primary.main;

  // Get user role color using centralized theme.palette.roles
  const getUserRoleColor = (userRole) => {
    const mapRoleKey = (r) => {
      // CLEAN: Only new role types
      switch (r) {
        case 'care_owner': return 'care_owner';
        case 'care_partner': return 'care_partner';
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
    const notesText = entry.notes || entry.sleepDetails?.notes || entry.bathroomDetails?.notes || '';
    const combinedText = [entry.text, entry.content, notesText].filter(Boolean).join(' — ');
    const behaviorPrimaryText = entry.text
      || entry.description
      || entry.summary
      || entry.incidentData?.description
      || entry.incidentData?.notes
      || entry.notes
      || 'Behavior logged';
    const behaviorSeverityText = entry.severity
      ? (() => {
          const severityMeta = getSeverityMeta('other');
          const severityInfo = severityMeta[entry.severity];
          if (severityInfo) {
            return `${severityInfo.label} (${entry.severity}/10) - ${severityInfo.description}`;
          }
          return `Severity: ${entry.severityLabel || entry.severity} (${entry.severity}/10)`;
        })()
      : null;

    switch (entry.type) {
      case 'incident':
        return {
          primary: `${entry.incidentType || incidentDisplay.label} - ${entry.severity || 'Unknown'} severity`,
          secondary: entry.content || entry.description || entry.summary || entry.notes || entry.remedy || entry.triggers?.join(', '),
          hasMedia: entry.mediaAttachments?.length > 0
        };
      case 'dailyLog':
        if (isBehaviorIncident) {
          return {
            primary: behaviorPrimaryText,
            secondary: behaviorSeverityText,
            hasMedia: false
          };
        }
        return {
          primary: isDailyLogEntry
            ? (entry.titlePrefix || entry.title || categoryDisplay.label || dailyLogDisplay.label)
            : (entry.title || `${dailyLogDisplay.label} Entry`),
          secondary: combinedText
            ? combinedText.substring(0, 100) + (combinedText.length > 100 ? '...' : '')
            : null,
          hasMedia: false
        };
      case 'behavior':
      case 'health':
      case 'mood':
      case 'sleep':
      case 'food':
      case 'milestone':
        if (isBehaviorIncident) {
          return {
            primary: behaviorPrimaryText,
            secondary: behaviorSeverityText,
            hasMedia: false
          };
        }
        return {
          primary: entry.title || typeMeta.label,
          secondary: entry.text || entry.content || entry.notes,
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
          primary: entry.title || entry.titlePrefix || categoryDisplay.label || 'Timeline Entry',
          secondary: combinedText || entry.description,
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
        borderColor: alpha(typeColor, 0.12),
        borderLeft: `4px solid ${typeColor}`,
        bgcolor: colors.semantic.surface,
        borderRadius: 3,
        boxShadow: `0 8px 22px ${colors.app.cards.shadowHover}`,
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: colors.semantic.surface,
          boxShadow: `0 10px 24px ${colors.app.cards.shadowPanel}`
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
                label={isDailyLogEntry
                  ? (entry.titlePrefix || categoryDisplay.label || typeMeta.label.replace(/s$/, ''))
                  : (categoryDisplay.label || typeMeta.label.replace(/s$/, ''))}
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
              isBehaviorIncident ? (
                <Box
                  sx={{
                    mt: 0.5,
                    px: 1.2,
                    py: 0.55,
                    display: 'inline-flex',
                    alignItems: 'center',
                    borderRadius: 999,
                    bgcolor: alpha(typeColor, 0.16),
                    color: typeColor,
                    fontWeight: 700,
                    maxWidth: '100%',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: typeColor,
                      fontWeight: 700,
                      lineHeight: 1.25,
                      display: '-webkit-box',
                      WebkitLineClamp: isExpanded ? 'unset' : 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {previewContent.secondary}
                  </Typography>
                </Box>
              ) : (
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
              )
            )}
          </Box>
        </Box>

        {/* Expandable Details */}
        <Collapse in={isExpanded}>
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            
            {/* Detailed Content based on entry type */}
            {(normalizedType === 'incident' || isBehaviorIncident) && (
              <Stack spacing={1}>
                <Typography variant="subtitle2" gutterBottom>
                  {isBehaviorIncident ? 'Behavior Details' : `${incidentDisplay.label} Details`}
                </Typography>
                {(!isBehaviorIncident && entry.severity) && (
                  <Typography variant="body2">
                    <strong>Severity:</strong> {entry.severityLabel || entry.severity}{entry.severity ? ` (${entry.severity}/10)` : ''}
                  </Typography>
                )}
                {entry.notes && (
                  <Typography variant="body2">
                    <strong>Notes:</strong> {entry.notes}
                  </Typography>
                )}
                {entry.contextSnapshot?.patternInsight && (
                  <Typography variant="body2">
                    <strong>Pattern insight:</strong> {entry.contextSnapshot.patternInsight}
                  </Typography>
                )}
                {entry.contextSnapshot && (
                  <Box sx={{ mt: 1, p: 1.25, borderRadius: 2, bgcolor: 'rgba(230, 241, 251, 0.65)', border: '1px solid', borderColor: 'rgba(29, 94, 166, 0.12)' }}>
                    <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, mb: 0.5 }}>
                      Context snapshot
                    </Typography>
                    {Array.isArray(entry.contextSnapshot.medicationsTaken) && entry.contextSnapshot.medicationsTaken.length > 0 && (
                      <Typography variant="body2">
                        <strong>Meds:</strong> {entry.contextSnapshot.medicationsTaken.join(', ')}
                      </Typography>
                    )}
                    {entry.contextSnapshot.foodLogged && (
                      <Typography variant="body2">
                        <strong>Food:</strong> {entry.contextSnapshot.foodLogged}
                      </Typography>
                    )}
                    {Array.isArray(entry.contextSnapshot.activities) && entry.contextSnapshot.activities.length > 0 && (
                      <Typography variant="body2">
                        <strong>Activities:</strong> {entry.contextSnapshot.activities.join(', ')}
                      </Typography>
                    )}
                    {entry.contextSnapshot.sleepQuality && (
                      <Typography variant="body2">
                        <strong>Sleep:</strong> {entry.contextSnapshot.sleepQuality}
                      </Typography>
                    )}
                  </Box>
                )}
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

            {normalizedType === 'dailyLog' && !isBehaviorIncident && (
              <Stack spacing={1}>
                <Typography variant="subtitle2" gutterBottom>
                  Full {dailyLogDisplay.label} Entry
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {entry.content}
                </Typography>
              </Stack>
            )}

            {normalizedType === 'dailyLog' && !isBehaviorIncident && (
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
