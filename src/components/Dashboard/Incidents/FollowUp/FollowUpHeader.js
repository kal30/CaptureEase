import React from 'react';
import { DialogTitle, Typography, Button, Box, Chip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';

const FollowUpHeader = ({ 
  incident, 
  childName, 
  incidentConfig, 
  onClose 
}) => {
  const theme = useTheme();

  const getTimeSinceIncident = () => {
    const incidentTime = incident.timestamp?.toDate?.() || new Date(incident.timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - incidentTime) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    }
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <DialogTitle
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        py: 2,
      }}
    >
      <Box>
        <Typography variant="h6" component="div" sx={{ mb: 1 }}>
          Follow-up for {childName}
        </Typography>
        
        {/* Category Chip */}
        <Box sx={{ mb: 1 }}>
          <Chip
            icon={<span style={{ fontSize: '1rem' }}>{incidentConfig?.icon || incidentConfig?.emoji || '📝'}</span>}
            label={incidentConfig?.label || incident?.customIncidentName || incident?.type || 'Other Incident'}
            size="small"
            sx={{
              bgcolor: incidentConfig?.color || '#6b7280',
              color: 'white',
              fontWeight: 600,
            }}
          />
        </Box>
        
        <Typography variant="caption" color="text.secondary">
          {getTimeSinceIncident()}
          {incident.isMultiStage && (
            <> • Follow-up {(incident.currentFollowUpIndex || 0) + 1} of {incident.totalFollowUps}</>
          )}
        </Typography>
      </Box>
      <Button
        onClick={onClose}
        sx={{ minWidth: 'auto', p: 0.5 }}
      >
        <CloseIcon />
      </Button>
    </DialogTitle>
  );
};

export default FollowUpHeader;