import React from 'react';
import { Box, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { getSeverityMeta } from '../../../services/incidentService';
import { getSeverityColor } from '../utils/colors';

const IncidentDetails = ({ entry }) => {
  const theme = useTheme();
  const meta = getSeverityMeta(entry.type);
  const info = entry.severity ? meta[entry.severity] : null;
  const sevColor = entry.severity ? getSeverityColor(theme, entry.severity) : theme.palette.text.secondary;
  
  // Check if this is a follow-up entry
  const isFollowUp = entry.type === 'followUp';

  return (
    <Box>
      {/* Main incident description or follow-up notes */}
      <Typography variant="body2" sx={{ color: 'text.primary', mb: 1, lineHeight: 1.5, fontWeight: 600 }}>
        {/* Debug: log entry data */}
        {console.log('🔍 Incident Entry data:', entry)}
        {isFollowUp 
          ? (entry.notes || entry.resolution || 'Follow-up logged') 
          : (entry.customIncidentName || entry.incidentType || entry.type || 'Incident')
        }
      </Typography>

      {/* Show description/notes for incidents - try multiple field names */}
      {!isFollowUp && (entry.description || entry.notes || entry.summary) && (
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, lineHeight: 1.4 }}>
          {entry.description || entry.notes || entry.summary}
        </Typography>
      )}

      {/* Show remedy if present */}
      {!isFollowUp && entry.remedy && (
        <Typography variant="body2" sx={{ color: 'text.primary', mb: 1, lineHeight: 1.4, fontStyle: 'italic' }}>
          <strong>Remedy:</strong> {entry.remedy}
        </Typography>
      )}

      {/* Show media if present */}
      {!isFollowUp && (entry.mediaURL || entry.mediaAttachments?.length > 0) && (
        <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.200' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', fontWeight: 500 }}>
            📎 Media attached
            {entry.mediaURL && ' • Photo/Video'}
            {entry.mediaAttachments?.length > 0 && ` • ${entry.mediaAttachments.length} file(s)`}
          </Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 0.5 }}>
        {/* Follow-up specific info */}
        {isFollowUp ? (
          <>
            <Typography component="span" variant="caption" sx={{ px: 1, py: 0.25, bgcolor: 'info.light', color: 'info.contrastText', borderRadius: 1, fontSize: '0.7rem', fontWeight: 500 }}>
              Follow-up
            </Typography>
            {entry.status && (
              <Typography component="span" variant="caption" sx={{ px: 1, py: 0.25, bgcolor: 'grey.100', borderRadius: 1, fontSize: '0.7rem', fontWeight: 500 }}>
                Status: {entry.status}
              </Typography>
            )}
            {entry.originalIncidentType && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                • for {entry.originalIncidentType} incident
              </Typography>
            )}
          </>
        ) : (
          <>
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
          </>
        )}
      </Box>

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
  );
};

export default React.memo(IncidentDetails);
