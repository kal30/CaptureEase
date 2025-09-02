import React from 'react';
import { Box, Typography, Chip, Alert } from '@mui/material';
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

      {/* Follow-up Schedule Information */}
      {incident.followUpTimes && incident.followUpTimes.length > 1 && (
        <Alert 
          severity="info" 
          sx={{ mt: 2, mb: 0 }}
          variant="outlined"
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            📅 Follow-up Schedule
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            We'll check on this incident <strong>{incident.followUpTimes.length} times</strong> to monitor effectiveness:
          </Typography>
          <Box sx={{ ml: 1 }}>
            {incident.followUpTimes.map((followUp, index) => {
              const minutes = followUp.intervalMinutes;
              const timeLabel = minutes < 60 ? `${minutes} minutes` : 
                              minutes < 1440 ? `${Math.round(minutes / 60)} hour${Math.round(minutes / 60) !== 1 ? 's' : ''}` : 
                              `${Math.round(minutes / 1440)} day${Math.round(minutes / 1440) !== 1 ? 's' : ''}`;
              
              return (
                <Typography key={index} variant="caption" sx={{ display: 'block', color: 'info.main' }}>
                  • Check #{index + 1}: {timeLabel} after incident
                </Typography>
              );
            })}
          </Box>
          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', color: 'text.secondary' }}>
            💡 <strong>Tip:</strong> If the issue is completely resolved, click "Issue Resolved" below to skip all remaining follow-ups.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default IncidentSummary;