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
    if (!effectiveness || effectiveness < 1 || effectiveness > 5 || loading) {
      console.log('❌ Submit blocked:', { effectiveness, loading, type: typeof effectiveness });
      return;
    }
    
    console.log('✅ Submitting follow-up:', { effectiveness, loading });
    setLoading(true);
    setError('');
    
    try {
      
      // Always use the new follow-up response system
      console.log('🔍 DEBUG: Saving follow-up response:', {
        incidentId: incident.id,
        incidentType: incident.type,
        customIncidentName: incident.customIncidentName,
        effectiveness,
        followUpNotes,
        currentIndex: incident.currentFollowUpIndex || 0
      });
      
      const result = await recordFollowUpResponse(
        incident.id, 
        effectiveness, 
        followUpNotes, 
        incident.currentFollowUpIndex || 0
      );
      
      // Show feedback about next follow-up if there is one
      if (result.hasMoreFollowUps) {
        console.log(`✅ Follow-up saved! Next check: ${result.nextFollowUpDescription}`);
      } else {
        console.log('✅ All follow-ups completed successfully!');
      }
      
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
        />
      </DialogContent>
    </Dialog>
  );
};

export default IncidentFollowUpModal;