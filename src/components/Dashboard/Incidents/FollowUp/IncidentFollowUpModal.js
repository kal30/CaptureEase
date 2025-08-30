import React, { useState } from 'react';
import { Dialog, DialogContent, Alert, Snackbar } from '@mui/material';
import { updateIncidentEffectiveness, recordFollowUpResponse, INCIDENT_TYPES, getSeverityScale } from '../../../../services/incidentService';
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
    if (!effectiveness) return;

    setLoading(true);
    setError('');
    
    try {
      console.log(`🔄 Saving follow-up response for incident ${incident.id}...`);
      console.log(`📊 Effectiveness: ${effectiveness}, Notes: ${followUpNotes}`);
      
      if (incident.isMultiStage) {
        // Handle multi-stage follow-up
        const result = await recordFollowUpResponse(
          incident.id, 
          effectiveness, 
          followUpNotes, 
          incident.currentFollowUpIndex
        );
        
        console.log('✅ Multi-stage follow-up saved:', result);
        
        // Show feedback about next follow-up if there is one
        if (result.hasMoreFollowUps) {
          setSuccess(`Follow-up saved! Next check: ${result.nextFollowUpDescription}`);
          console.log(`Next follow-up scheduled: ${result.nextFollowUpDescription} at ${result.nextFollowUpTime}`);
        } else {
          setSuccess('All follow-ups completed successfully!');
          console.log('All follow-ups completed');
        }
      } else {
        // Handle single follow-up (legacy)
        await updateIncidentEffectiveness(incident.id, effectiveness, followUpNotes);
        console.log('✅ Single follow-up saved');
        setSuccess('Follow-up response saved successfully!');
      }
      
      // Close modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('❌ Error saving follow-up response:', error);
      setError(`Failed to save follow-up: ${error.message}`);
      // Don't close modal on error
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

        {/* Success Alert */}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
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
        />
      </DialogContent>
    </Dialog>
  );
};

export default IncidentFollowUpModal;