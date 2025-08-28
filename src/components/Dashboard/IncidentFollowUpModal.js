import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  ButtonGroup,
  Box,
  TextField,
  Chip,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTheme } from '@mui/material/styles';
import { updateIncidentEffectiveness, recordFollowUpResponse, INCIDENT_TYPES, EFFECTIVENESS_LEVELS, getSeverityScale } from '../../services/incidentService';

const IncidentFollowUpModal = ({ 
  open, 
  onClose, 
  incident, 
  childName 
}) => {
  const theme = useTheme();
  const [effectiveness, setEffectiveness] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!incident) return null;

  const incidentConfig = Object.values(INCIDENT_TYPES).find(
    type => type.id === incident.type
  );
  const severityScale = getSeverityScale(incident.type);
  const severityInfo = severityScale[incident.severity];

  const handleEffectivenessSelect = (effectivenessValue) => {
    setEffectiveness(effectivenessValue);
  };

  const handleSubmit = async () => {
    if (!effectiveness) return;

    setLoading(true);
    try {
      if (incident.isMultiStage) {
        // Handle multi-stage follow-up
        const result = await recordFollowUpResponse(
          incident.id, 
          effectiveness, 
          followUpNotes, 
          incident.currentFollowUpIndex
        );
        
        // Show feedback about next follow-up if there is one
        if (result.hasMoreFollowUps) {
          console.log(`Next follow-up scheduled: ${result.nextFollowUpDescription} at ${result.nextFollowUpTime}`);
        } else {
          console.log('All follow-ups completed');
        }
      } else {
        // Handle single follow-up (legacy)
        await updateIncidentEffectiveness(incident.id, effectiveness, followUpNotes);
      }
      
      onClose();
    } catch (error) {
      console.error('Error updating incident effectiveness:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEffectiveness('');
    setFollowUpNotes('');
    onClose();
  };

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
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          bgcolor: incidentConfig?.color || theme.palette.primary.main,
          color: 'white',
          py: 2,
        }}
      >
        <Box>
          <Typography variant="h6" component="div">
            Follow-up for {childName}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            {incidentConfig?.icon} {incidentConfig?.label} • {getTimeSinceIncident()}
            {incident.isMultiStage && (
              <> • Follow-up {(incident.currentFollowUpIndex || 0) + 1} of {incident.totalFollowUps}</>
            )}
          </Typography>
        </Box>
        <Button
          onClick={handleClose}
          sx={{ color: 'white', minWidth: 'auto', p: 0.5 }}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Incident Summary */}
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
        </Box>

        {/* Effectiveness Question */}
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          How effective was the remedy?
        </Typography>

        {/* Effectiveness Buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
          {Object.entries(EFFECTIVENESS_LEVELS).map(([key, level]) => (
            <Button
              key={key}
              variant={effectiveness === level.value ? 'contained' : 'outlined'}
              onClick={() => handleEffectivenessSelect(level.value)}
              startIcon={effectiveness === level.value ? <CheckCircleIcon /> : null}
              sx={{
                justifyContent: 'flex-start',
                py: 1.5,
                px: 2,
                bgcolor: effectiveness === level.value ? level.color : 'transparent',
                borderColor: level.color,
                color: effectiveness === level.value ? 'white' : level.color,
                '&:hover': {
                  bgcolor: effectiveness === level.value ? level.color : `${level.color}20`,
                  borderColor: level.color,
                },
              }}
            >
              {level.label}
            </Button>
          ))}
        </Box>

        {/* Optional Follow-up Notes */}
        <TextField
          label="Additional notes (optional)"
          multiline
          rows={3}
          fullWidth
          value={followUpNotes}
          onChange={(e) => setFollowUpNotes(e.target.value)}
          placeholder="Any additional observations or changes needed..."
          sx={{ mb: 2 }}
        />
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleClose} disabled={loading}>
          Skip for Now
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!effectiveness || loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
          sx={{
            bgcolor: effectiveness ? EFFECTIVENESS_LEVELS[Object.keys(EFFECTIVENESS_LEVELS).find(
              k => EFFECTIVENESS_LEVELS[k].value === effectiveness
            )]?.color : theme.palette.primary.main,
            '&:hover': {
              bgcolor: effectiveness ? EFFECTIVENESS_LEVELS[Object.keys(EFFECTIVENESS_LEVELS).find(
                k => EFFECTIVENESS_LEVELS[k].value === effectiveness
              )]?.color : theme.palette.primary.dark,
              filter: 'brightness(0.9)',
            },
          }}
        >
          {loading ? 'Saving...' : 'Submit Follow-up'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IncidentFollowUpModal;