import React, { useState } from 'react';
import { Dialog, DialogContent, Alert, Snackbar } from '@mui/material';
import { recordFollowUpResponse, INCIDENT_TYPES, getSeverityScale } from '../../../../services/incidentService';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    // More robust validation - effectiveness should be a number 1-5
    if (!effectiveness || loading) {
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      
      // Always use the new follow-up response system
      
      const result = await recordFollowUpResponse(
        incident.id,
        effectiveness,
        followUpNotes
      );
      
      // Show feedback about next follow-up if there is one (could add user notification here later)
      
      // Close modal immediately upon successful save
      onClose();
      
    } catch (error) {
      console.error('❌ Error saving follow-up response:', error);
      setError(`Failed to save follow-up: ${error.message}`);
      // Don't close modal on error
    } finally {
      setLoading(false);
    }
  };

  const handleResolveIncident = async () => {
    setLoading(true);
    setError('');
    
    try {

      // Create a final response marking the incident as resolved and force completion
      const result = await recordFollowUpResponse(
        incident.id,
        'completely', // Mark as completely effective since issue is resolved
        followUpNotes || 'Issue has been resolved - skipping remaining follow-ups'
      );
      
      // Force mark as completed regardless of remaining follow-ups
      await import('../../../../services/incidents/repository').then(({ forceCompleteFollowUp }) => {
        return forceCompleteFollowUp(incident.id);
      });
      
      onClose();
      
    } catch (error) {
      console.error('❌ Error resolving incident:', error);
      setError(`Failed to resolve incident: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEffectiveness('');
    setFollowUpNotes('');
    setError('');
    setSuccess('');
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
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
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
          loading={loading}
          onSubmit={handleSubmit}
          onClose={handleClose}
          onResolveIncident={handleResolveIncident}
        />
      </DialogContent>
    </Dialog>
  );
};

export default IncidentFollowUpModal;
