import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import IncidentMediaDisplay from '../Media/IncidentMediaDisplay';

const IncidentSummary = ({ 
  incident, 
  incidentConfig, 
  severityInfo 
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Severity Level:
      </Typography>
      <Chip
        label={`${incident.severity}/10 - ${severityInfo?.label || 'Unknown'}`}
        sx={{
          bgcolor: severityInfo?.color || theme.palette.grey[500],
          color: 'white',
          mb: 2,
          fontSize: '0.8rem'
        }}
      />
      
      <Typography variant="subtitle2" gutterBottom>
        Applied Remedy:
      </Typography>
      <Chip
        label={incident.remedy}
        sx={{
          bgcolor: incidentConfig?.color || theme.palette.primary.main,
          color: 'white',
          mb: 1
        }}
      />
      {incident.notes && (
        <>
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Notes:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {incident.notes}
          </Typography>
        </>
      )}
      
      {/* Display attached media */}
      {incident.mediaUrls && incident.mediaUrls.length > 0 && (
        <IncidentMediaDisplay mediaUrls={incident.mediaUrls} />
      )}
    </Box>
  );
};

export default IncidentSummary;