import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Collapse,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Stack,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Schedule as TimeIcon,
  NotificationsActive as FollowUpIcon,
  CheckCircle as CompletedIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';

/**
 * DailyLogEntry - Expandable card component for unified daily log entries
 * Handles both timeline entries (journal, medical, etc.) and incidents with type-specific styling
 * 
 * @param {Object} entry - Unified entry object from useUnifiedDailyLog
 * @param {Function} formatTime - Function to format timestamp
 * @param {Function} formatRelativeTime - Function to format relative time
 * @param {Function} getEntryTypeInfo - Function to get type-specific info
 * @param {boolean} defaultExpanded - Whether to start expanded
 * @param {Function} onEntryClick - Optional click handler for entry
 */
const DailyLogEntry = ({
  entry,
  formatTime,
  formatRelativeTime,
  getEntryTypeInfo,
  defaultExpanded = false,
  onEntryClick
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(defaultExpanded);
  
  const typeInfo = getEntryTypeInfo(entry);
  const isIncident = entry.entryType === 'incident';
  
  // Get styling based on entry type
  const getEntryCardStyling = () => {
    const baseStyles = {
      mb: 1,
      border: '1px solid',
      borderRadius: 2,
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: theme.shadows[3]
      }
    };
    
    if (isIncident) {
      const severity = entry.incidentData?.severity || 1;
      const isHighSeverity = severity >= 7;
      
      return {
        ...baseStyles,
        borderColor: isHighSeverity ? alpha(theme.palette.error.main, 0.5) : alpha(entry.color, 0.3),
        backgroundColor: alpha(entry.color, 0.04),
        borderLeftWidth: '4px',
        borderLeftColor: entry.color,
        '&:hover': {
          ...baseStyles['&:hover'],
          backgroundColor: alpha(entry.color, 0.08),
          borderColor: alpha(entry.color, 0.6)
        }
      };
    }
    
    // Timeline entries styling
    return {
      ...baseStyles,
      borderColor: alpha(entry.color, 0.2),
      backgroundColor: alpha(entry.color, 0.02),
      '&:hover': {
        ...baseStyles['&:hover'],
        backgroundColor: alpha(entry.color, 0.05),
        borderColor: alpha(entry.color, 0.4)
      }
    };
  };
  
  const handleCardClick = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
    if (onEntryClick) {
      onEntryClick(entry);
    }
  };
  
  const handleExpandClick = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <Card
      elevation={0}
      sx={getEntryCardStyling()}
      onClick={handleCardClick}
    >
      {/* Entry Header */}
      <CardContent sx={{ pb: expanded ? 1 : 2, '&:last-child': { pb: expanded ? 1 : 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          {/* Entry Type Avatar */}
          <Avatar
            sx={{
              bgcolor: entry.color,
              color: 'white',
              width: 40,
              height: 40,
              fontSize: '1.2rem',
              flexShrink: 0
            }}
          >
            {entry.icon}
          </Avatar>
          
          {/* Entry Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Title and Time */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 600,
                  color: 'text.primary',
                  flex: '1 1 auto',
                  minWidth: 0
                }}
              >
                {entry.title}
              </Typography>
              
              {/* Time Display */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                <TimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {formatTime(entry.timestamp)}
                </Typography>
              </Box>
            </Box>
            
            {/* Entry Summary and Chips */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: expanded ? 'normal' : 'nowrap'
                }}
              >
                {entry.content}
              </Typography>
              
              {/* Status Chips and Expand Button */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                {/* Incident-specific chips */}
                {isIncident && entry.incidentData && (
                  <>
                    {/* Severity Chip */}
                    <Chip
                      label={`${entry.incidentData.severity}/10`}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        bgcolor: alpha(entry.incidentData.severityInfo.color, 0.1),
                        color: entry.incidentData.severityInfo.color,
                        border: `1px solid ${alpha(entry.incidentData.severityInfo.color, 0.3)}`
                      }}
                    />
                    
                    {/* Follow-up Status */}
                    {entry.incidentData.followUpScheduled && (
                      <Chip
                        icon={entry.incidentData.followUpCompleted ? 
                          <CompletedIcon sx={{ fontSize: 12 }} /> : 
                          <FollowUpIcon sx={{ fontSize: 12 }} />
                        }
                        label={entry.incidentData.followUpCompleted ? 'Followed Up' : 'Pending'}
                        size="small"
                        color={entry.incidentData.followUpCompleted ? 'success' : 'warning'}
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.65rem' }}
                      />
                    )}
                  </>
                )}
                
                {/* Entry Type Chip */}
                <Chip
                  label={typeInfo.label}
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    borderColor: alpha(entry.color, 0.3),
                    color: entry.color
                  }}
                />
                
                {/* Expand/Collapse Button */}
                <IconButton
                  onClick={handleExpandClick}
                  size="small"
                  sx={{
                    width: 24,
                    height: 24,
                    color: 'text.secondary'
                  }}
                >
                  {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Box>
      </CardContent>
      
      {/* Expandable Detailed Content */}
      <Collapse in={expanded}>
        <CardContent sx={{ pt: 0 }}>
          <Divider sx={{ mb: 2 }} />
          
          {isIncident ? (
            <IncidentDetails incident={entry.incidentData} originalIncident={entry.originalData} />
          ) : (
            <TimelineEntryDetails entry={entry} />
          )}
          
          {/* Entry Metadata */}
          <Box sx={{ mt: 2, pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="caption" color="text.secondary">
              Added {formatRelativeTime(entry.timestamp)} • ID: {entry.id}
            </Typography>
          </Box>
        </CardContent>
      </Collapse>
    </Card>
  );
};

/**
 * Detailed view for incident entries
 */
const IncidentDetails = ({ incident, originalIncident }) => {
  const theme = useTheme();
  
  return (
    <Stack spacing={2}>
      {/* Severity and Type Info */}
      <Box>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
          Incident Details
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
          <Chip
            label={`Severity: ${incident.severity}/10 - ${incident.severityInfo.label}`}
            sx={{
              bgcolor: alpha(incident.severityInfo.color, 0.1),
              color: incident.severityInfo.color,
              fontWeight: 500
            }}
          />
          
          {incident.severity >= 7 && (
            <Chip
              icon={<WarningIcon sx={{ fontSize: 14 }} />}
              label="High Severity"
              color="error"
              variant="outlined"
              size="small"
            />
          )}
        </Box>
        
        <Typography variant="body2" color="text.secondary">
          {incident.severityInfo.description}
        </Typography>
      </Box>
      
      {/* Remedy Information */}
      {incident.remedy && (
        <Box>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            Remedy Applied
          </Typography>
          <Typography variant="body2" color="text.primary">
            {incident.remedy}
          </Typography>
          {incident.customRemedy && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontStyle: 'italic' }}>
              Additional details: {incident.customRemedy}
            </Typography>
          )}
        </Box>
      )}
      
      {/* Notes */}
      {incident.notes && (
        <Box>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            Notes
          </Typography>
          <Typography variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-wrap' }}>
            {incident.notes}
          </Typography>
        </Box>
      )}
      
      {/* Follow-up Information */}
      {incident.followUpScheduled && (
        <Box>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            Follow-up Status
          </Typography>
          
          {incident.followUpCompleted ? (
            <Box>
              <Chip
                icon={<CompletedIcon sx={{ fontSize: 14 }} />}
                label="Follow-up Completed"
                color="success"
                sx={{ mb: 1 }}
              />
              
              {incident.followUpResponses && incident.followUpResponses.length > 0 && (
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {incident.followUpResponses.map((response, index) => (
                    <Box key={index} sx={{ p: 1, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 1 }}>
                      <Typography variant="body2">
                        <strong>Response {index + 1}:</strong> {response.effectiveness}
                      </Typography>
                      {response.notes && (
                        <Typography variant="body2" color="text.secondary">
                          {response.notes}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          ) : (
            <Chip
              icon={<FollowUpIcon sx={{ fontSize: 14 }} />}
              label="Follow-up Pending"
              color="warning"
            />
          )}
        </Box>
      )}
      
      {/* Full Description */}
      {incident.fullDescription && (
        <Box sx={{ mt: 1, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.02), borderRadius: 1 }}>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {incident.fullDescription}
          </Typography>
        </Box>
      )}
    </Stack>
  );
};

/**
 * Detailed view for timeline entries (journal, medical, etc.)
 */
const TimelineEntryDetails = ({ entry }) => {
  const theme = useTheme();
  
  return (
    <Stack spacing={2}>
      {/* Entry Content */}
      <Box>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
          {entry.label || 'Entry Details'}
        </Typography>
        
        <Typography variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-wrap' }}>
          {entry.content || 'No additional details available.'}
        </Typography>
      </Box>
      
      {/* Original Data for Development */}
      {entry.originalData && Object.keys(entry.originalData).length > 0 && (
        <Box sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.02), borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Additional Information:
          </Typography>
          
          {/* Show relevant fields from original data */}
          {entry.originalData.tags && entry.originalData.tags.length > 0 && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Tags:</strong> {entry.originalData.tags.join(', ')}
              </Typography>
            </Box>
          )}
          
          {entry.originalData.author && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Author:</strong> {entry.originalData.author}
              </Typography>
            </Box>
          )}
          
          {/* Add more fields as needed */}
        </Box>
      )}
    </Stack>
  );
};

export default DailyLogEntry;