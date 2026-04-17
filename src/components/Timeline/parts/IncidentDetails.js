import React from 'react';
import { Box, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { getSeverityMeta } from '../../../services/incidentService';
import { getSeverityColor } from '../utils/colors';
import { isBehaviorIncidentEntry } from '../../../constants/logTypeRegistry';

const IncidentDetails = ({ entry }) => {
  const theme = useTheme();
  
  // Check if this is a follow-up entry
  const isFollowUp = entry.type === 'followUp';
  const isBehaviorIncident = !isFollowUp && isBehaviorIncidentEntry(entry);
  const primaryText = isFollowUp
    ? (entry.notes || entry.resolution || 'Follow-up logged')
    : (isBehaviorIncident
      ? (entry.text || entry.description || entry.summary || entry.incidentData?.description || 'Behavior logged')
      : (entry.customIncidentName || entry.incidentType || entry.type || 'Incident logged'));
  const secondaryText = !isFollowUp && !isBehaviorIncident
    ? (entry.content || entry.description || entry.summary || entry.notes || null)
    : null;
  const behaviorNotesText = isBehaviorIncident
    ? (entry.notes || entry.incidentData?.notes || null)
    : null;
  const behaviorRemedyText = isBehaviorIncident
    ? (entry.remedy || entry.incidentData?.remedy || null)
    : null;

  return (
    <Box>
      {/* Main incident description or follow-up notes */}
      <Typography variant="body2" sx={{ color: 'text.primary', mb: 1, lineHeight: 1.5, fontWeight: 600 }}>
        {primaryText}
      </Typography>

      {/* Show description/notes for incidents - try multiple field names */}
      {secondaryText && (
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, lineHeight: 1.4 }}>
          {secondaryText}
        </Typography>
      )}

      {isBehaviorIncident && behaviorNotesText && behaviorNotesText !== primaryText && (
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, lineHeight: 1.4 }}>
          <strong>Notes:</strong> {behaviorNotesText}
        </Typography>
      )}

      {!isFollowUp && entry.severity && (
        <Typography variant="body2" sx={{ color: 'text.primary', mb: 1, lineHeight: 1.4 }}>
          <strong>Severity:</strong> {entry.severityLabel || entry.severity}{entry.severity ? ` (${entry.severity}/10)` : ''}
        </Typography>
      )}

      {!isFollowUp && !isBehaviorIncident && entry.notes && (
        <Typography variant="body2" sx={{ color: 'text.primary', mb: 1, lineHeight: 1.4 }}>
          <strong>Notes:</strong> {entry.notes}
        </Typography>
      )}

      {!isFollowUp && entry.contextSnapshot?.patternInsight && (
        <Typography variant="body2" sx={{ color: 'text.primary', mb: 1, lineHeight: 1.4 }}>
          <strong>Pattern insight:</strong> {entry.contextSnapshot.patternInsight}
        </Typography>
      )}

      {!isFollowUp && entry.contextSnapshot && (
        <Box sx={{ mt: 1, p: 1.25, borderRadius: 2, bgcolor: 'rgba(230, 241, 251, 0.65)', border: '1px solid', borderColor: 'rgba(29, 94, 166, 0.12)' }}>
          <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, mb: 0.5, color: '#184D83' }}>
            Context from today
          </Typography>
          {Array.isArray(entry.contextSnapshot.medicationsTaken) && entry.contextSnapshot.medicationsTaken.length > 0 && (
            <Typography variant="body2" sx={{ color: 'text.primary' }}>
              <strong>Meds:</strong> {entry.contextSnapshot.medicationsTaken.join(', ')}
            </Typography>
          )}
          {entry.contextSnapshot.foodLogged && (
            <Typography variant="body2" sx={{ color: 'text.primary' }}>
              <strong>Food:</strong> {entry.contextSnapshot.foodLogged}
            </Typography>
          )}
          {Array.isArray(entry.contextSnapshot.activities) && entry.contextSnapshot.activities.length > 0 && (
            <Typography variant="body2" sx={{ color: 'text.primary' }}>
              <strong>Activities:</strong> {entry.contextSnapshot.activities.join(', ')}
            </Typography>
          )}
          {entry.contextSnapshot.sleepQuality && (
            <Typography variant="body2" sx={{ color: 'text.primary' }}>
              <strong>Sleep:</strong> {entry.contextSnapshot.sleepQuality}
            </Typography>
          )}
        </Box>
      )}

      {/* Show remedy if present */}
      {!isFollowUp && behaviorRemedyText && (
        <Typography variant="body2" sx={{ color: 'text.primary', mb: 1, lineHeight: 1.4, fontStyle: 'italic' }}>
          <strong>Remedy:</strong> {behaviorRemedyText}
        </Typography>
      )}

      {/* Show severity chip right after remedy */}
      {!isFollowUp && (() => {
        const meta = getSeverityMeta(entry.type || entry.incidentType);
        const info = entry.severity ? meta[entry.severity] : null;
        const sevColor = entry.severity ? getSeverityColor(theme, entry.severity) : theme.palette.text.secondary;
        
        return info ? (
          <Box sx={{ mb: 1 }}>
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
          </Box>
        ) : null;
      })()}

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

      {/* Show follow-up response data if present */}
      {!isFollowUp && entry.lastFollowUpResponse && (
        <Box sx={{ mt: 2, ml: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1565C0', mb: 1 }}>
            Follow-up Response
          </Typography>
          {entry.lastFollowUpResponse.notes && (
            <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.4, color: '#1565C0' }}>
              {entry.lastFollowUpResponse.notes}
            </Typography>
          )}
          {entry.lastFollowUpResponse.effectiveness && (
            <Typography variant="caption" sx={{ color: '#1565C0', fontWeight: 500 }}>
              Effectiveness: {(() => {
                const effectivenessMap = {
                  'no_change': 'No Change',
                  'improved': 'Improved', 
                  'resolved': 'Resolved'
                };
                return effectivenessMap[entry.lastFollowUpResponse.effectiveness] || entry.lastFollowUpResponse.effectiveness;
              })()}
            </Typography>
          )}
        </Box>
      )}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 0.5 }}>
        {/* Duration for incidents */}
        {!isFollowUp && entry.duration && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            • Lasted {entry.duration}
          </Typography>
        )}
        
        {/* Follow-up type indicator */}
        {isFollowUp && (
          <Typography component="span" variant="caption" sx={{ px: 1, py: 0.25, bgcolor: 'info.light', color: 'info.contrastText', borderRadius: 1, fontSize: '0.7rem', fontWeight: 500 }}>
            Follow-up
          </Typography>
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
