import React, { useState } from 'react';
import { Dialog, DialogContent, Alert, Snackbar } from '@mui/material';
import { recordFollowUpResponse, INCIDENT_TYPES, getSeverityScale } from '../../../../services/incidentService';
import { useAsyncForm } from '../../../../hooks/useAsyncForm';
import FollowUpHeader from './FollowUpHeader';
import IncidentSummary from './IncidentSummary';
import EffectivenessSelector from './EffectivenessSelector';
import FollowUpForm from './FollowUpForm';

const IncidentFollowUpModal = ({ 
  open, 
  onClose, 
  incident, 
  childName 
}) => {
  const [effectiveness, setEffectiveness] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');
  
  // Use async form hook for consistent state management
  const followUpForm = useAsyncForm({
    onClose,
    validate: ({ effectiveness }) => {
      if (!effectiveness) {
        throw new Error('Please select an effectiveness rating');
      }
    }
  });
  
  // Separate hook for resolve incident operation
  const resolveOperation = useAsyncForm({
    onClose
  });

  if (!incident) return null;

  // Try to find config in INCIDENT_TYPES first, then create fallback for custom incidents
  const incidentConfig = Object.values(INCIDENT_TYPES).find(
    type => type.id === incident.type
  ) || {
    // Fallback for custom incidents
    id: incident.type,
    label: incident.customIncidentName || incident.type,
    color: '#6b7280',
    emoji: '📝',
    icon: '📝'
  };
  const severityScale = getSeverityScale(incident.type);
  const severityInfo = severityScale[incident.severity];

  const handleEffectivenessSelect = (effectivenessValue) => {
    setEffectiveness(effectivenessValue);
  };

  const handleSubmit = async () => {
    await followUpForm.submitForm(
      async () => {
        return await recordFollowUpResponse(
          incident.id,
          effectiveness,
          followUpNotes
        );
      },
      { effectiveness }
    );
  };

  const handleResolveIncident = async () => {
    await resolveOperation.submitForm(async () => {
      // Create a final response marking the incident as resolved
      await recordFollowUpResponse(
        incident.id,
        'resolved',
        followUpNotes || 'Issue has been resolved - skipping remaining follow-ups'
      );
      
      // Force complete remaining follow-ups
      const { forceCompleteFollowUp } = await import('../../../../services/incidents/repository');
      await forceCompleteFollowUp(incident.id);
    });
  };

  const handleClose = () => {
    setEffectiveness('');
    setFollowUpNotes('');
    followUpForm.reset();
    resolveOperation.reset();
    onClose();
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
      <FollowUpHeader 
        incident={incident}
        childName={childName}
        incidentConfig={incidentConfig}
        onClose={handleClose}
      />

      <DialogContent sx={{ p: 3 }}>
        {/* Error Alert - Show error from either operation */}
        {(followUpForm.error || resolveOperation.error) && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }} 
            onClose={() => {
              followUpForm.clearError();
              resolveOperation.clearError();
            }}
          >
            {followUpForm.error || resolveOperation.error}
          </Alert>
        )}


        <IncidentSummary 
          incident={incident}
          incidentConfig={incidentConfig}
          severityInfo={severityInfo}
        />

        <EffectivenessSelector 
          effectiveness={effectiveness}
          onEffectivenessSelect={handleEffectivenessSelect}
        />

        <FollowUpForm 
          followUpNotes={followUpNotes}
          setFollowUpNotes={setFollowUpNotes}
          effectiveness={effectiveness}
          loading={followUpForm.loading || resolveOperation.loading}
          onSubmit={handleSubmit}
          onClose={handleClose}
          onResolveIncident={handleResolveIncident}
        />
      </DialogContent>
    </Dialog>
  );
};

export default IncidentFollowUpModal;
