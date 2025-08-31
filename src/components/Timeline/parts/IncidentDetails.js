import React from 'react';
import { Box, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { getSeverityMeta } from '../../../services/incidentService';
import { getSeverityColor } from '../utils/colors';

const IncidentDetails = ({ entry }) => {
  const theme = useTheme();
  const meta = getSeverityMeta(entry.incidentType);
  const info = entry.severity ? meta[entry.severity] : null;
  const sevColor = entry.severity ? getSeverityColor(theme, entry.severity) : theme.palette.text.secondary;

  return (
    <Box>
      {/* Main incident description */}
      <Typography variant="body2" sx={{ color: 'text.primary', mb: 1, lineHeight: 1.5 }}>
        {entry.description || entry.summary || 'Incident logged'}
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 0.5 }}>
        {/* Incident type */}
        {entry.incidentType && (
          <Typography component="span" variant="caption" sx={{ px: 1, py: 0.25, bgcolor: 'grey.100', borderRadius: 1, fontSize: '0.7rem', fontWeight: 500 }}>
            {entry.incidentType}
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
