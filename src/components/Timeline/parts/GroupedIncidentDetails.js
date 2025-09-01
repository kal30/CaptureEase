import React, { useState } from 'react';
import { Box, Typography, Collapse, IconButton } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { getSeverityMeta } from '../../../services/incidentService';
import { getSeverityColor } from '../utils/colors';
import { getEffectivenessDisplay } from '../../../utils/incidentGrouping';

/**
 * GroupedIncidentDetails - Display component for grouped incidents with follow-ups
 * Shows the original incident and all its follow-up responses in a hierarchical structure
 * 
 * @param {Object} props
 * @param {Object} props.entry - Grouped incident entry with follow-ups array
 */
const GroupedIncidentDetails = ({ entry }) => {
  const theme = useTheme();
  const [followUpsExpanded, setFollowUpsExpanded] = useState(false);
  
  // Extract incident metadata
  const meta = getSeverityMeta(entry.type);
  const info = entry.severity ? meta[entry.severity] : null;
  const sevColor = entry.severity ? getSeverityColor(theme, entry.severity) : theme.palette.text.secondary;
  
  // Check if this is a grouped incident
  const isGroupedIncident = entry.isGroupedIncident && entry.followUps && entry.followUps.length > 0;
  
  return (
    <Box>
      {/* Main incident details */}
      <Box>
        <Typography variant="body2" sx={{ color: 'text.primary', mb: 1, lineHeight: 1.5, fontWeight: 600 }}>
          {console.log('🔍 DEBUG: Grouped incident entry:', {
            id: entry.id,
            isGroupedIncident: entry.isGroupedIncident,
            followUps: entry.followUps,
            totalFollowUps: entry.totalFollowUps,
            followUpCompleted: entry.followUpCompleted,
            followUpNotes: entry.followUpNotes,
            effectiveness: entry.effectiveness,
            followUpResponses: entry.followUpResponses,
            lastFollowUpResponse: entry.lastFollowUpResponse
          })}
          {entry.customIncidentName || entry.incidentType || entry.type || `Incident (no data found)`}
        </Typography>

        {/* Show description/notes for incidents - try multiple field names */}
        {(entry.description || entry.notes || entry.summary) && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, lineHeight: 1.4 }}>
            {entry.description || entry.notes || entry.summary}
          </Typography>
        )}

        {/* Show remedy if present */}
        {entry.remedy && (
          <Typography variant="body2" sx={{ color: 'text.primary', mb: 1, lineHeight: 1.4, fontStyle: 'italic' }}>
            <strong>Remedy:</strong> {entry.remedy}
          </Typography>
        )}

        {/* Show media if present */}
        {(entry.mediaURL || entry.mediaAttachments?.length > 0) && (
          <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.200' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', fontWeight: 500 }}>
              📎 Media attached
              {entry.mediaURL && ' • Photo/Video'}
              {entry.mediaAttachments?.length > 0 && ` • ${entry.mediaAttachments.length} file(s)`}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 0.5 }}>
          {/* Incident type */}
          {entry.type && entry.type !== entry.customIncidentName && entry.type !== entry.incidentType && (
            <Typography component="span" variant="caption" sx={{ px: 1, py: 0.25, bgcolor: 'grey.100', borderRadius: 1, fontSize: '0.7rem', fontWeight: 500 }}>
              {entry.type}
            </Typography>
          )}
          
          {/* Severity */}
          {info && (
            <Typography
              component="span"
              sx={{
                px: 1,
                py: 0.25,
                bgcolor: alpha(sevColor, 0.15),
                color: sevColor,
                borderRadius: 1,
                fontSize: '0.7rem',
                fontWeight: 600,
              }}
            >
              {info.label} ({entry.severity}/10) - {info.description}
            </Typography>
          )}
          
          {/* Duration */}
          {entry.duration && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              • Lasted {entry.duration}
            </Typography>
          )}
          
          {/* Follow-up count */}
          {isGroupedIncident && (
            <Typography 
              component="span" 
              variant="caption" 
              sx={{ 
                px: 1, 
                py: 0.25, 
                bgcolor: alpha(theme.palette.info.main, 0.1), 
                color: theme.palette.info.main, 
                borderRadius: 1, 
                fontSize: '0.7rem', 
                fontWeight: 500 
              }}
            >
              {entry.totalFollowUps} follow-up{entry.totalFollowUps !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>

        {/* Triggers and interventions */}
        {(entry.triggers?.length > 0 || entry.interventions?.length > 0) && (
          <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            {entry.triggers && entry.triggers.length > 0 && (
              <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 0.5 }}>
                <strong>Possible triggers:</strong> {entry.triggers.join(', ')}
              </Typography>
            )}
            {entry.interventions && entry.interventions.length > 0 && (
              <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                <strong>Actions taken:</strong> {entry.interventions.join(', ')}
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Follow-ups section */}
      {isGroupedIncident && (
        <Box sx={{ mt: 2, pl: 2, borderLeft: '3px solid', borderColor: '#2196F3' }}>
          {/* Follow-ups header with toggle */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              mb: 1,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: alpha('#2196F3', 0.05),
                borderRadius: 1,
                mx: -1,
                px: 1,
                py: 0.5
              }
            }}
            onClick={() => setFollowUpsExpanded(!followUpsExpanded)}
          >
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 600,
                color: '#2196F3',
                fontSize: '0.875rem'
              }}
            >
              Follow-up Responses ({entry.totalFollowUps})
            </Typography>
            <IconButton size="small" sx={{ color: '#2196F3' }}>
              {followUpsExpanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>

          {/* Collapsible follow-ups list */}
          <Collapse in={followUpsExpanded}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {entry.followUps.map((followUp, index) => {
                const effectivenessDisplay = getEffectivenessDisplay(followUp.effectiveness);
                
                return (
                  <Box 
                    key={followUp.id} 
                    sx={{ 
                      p: 2, 
                      bgcolor: alpha('#2196F3', 0.05),
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: alpha('#2196F3', 0.15)
                    }}
                  >
                    {/* Follow-up header with time elapsed */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontWeight: 600,
                          color: '#1976D2', // Darker blue
                          fontSize: '0.75rem'
                        }}
                      >
                        Follow-up #{index + 1}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'text.secondary',
                          fontSize: '0.7rem'
                        }}
                      >
                        {followUp.timeElapsed}
                      </Typography>
                    </Box>

                    {/* Follow-up notes */}
                    {followUp.notes && (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          mb: 1, 
                          fontSize: '0.875rem',
                          lineHeight: 1.4,
                          color: 'text.primary'
                        }}
                      >
                        {followUp.notes}
                      </Typography>
                    )}

                    {/* Effectiveness rating */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'text.secondary',
                          fontSize: '0.7rem'
                        }}
                      >
                        Effectiveness:
                      </Typography>
                      <Typography 
                        component="span"
                        sx={{
                          px: 1,
                          py: 0.25,
                          bgcolor: alpha(effectivenessDisplay.color, 0.15),
                          color: effectivenessDisplay.color,
                          borderRadius: 1,
                          fontSize: '0.7rem',
                          fontWeight: 500,
                        }}
                      >
                        {effectivenessDisplay.stars} {effectivenessDisplay.label}
                      </Typography>
                    </Box>

                    {/* Follow-up timestamp */}
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block',
                        mt: 1,
                        color: 'text.secondary',
                        fontSize: '0.65rem'
                      }}
                    >
                      Logged at {new Date(followUp.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Collapse>
        </Box>
      )}
    </Box>
  );
};

export default React.memo(GroupedIncidentDetails);