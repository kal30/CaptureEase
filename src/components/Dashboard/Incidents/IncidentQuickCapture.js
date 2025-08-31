import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../services/firebase';
import { 
  createIncidentWithSmartFollowUp,
  INCIDENT_TYPES, 
  getSeverityScale,
  getCustomCategories,
  formatFollowUpSchedule,
  getIncidentTypeConfig
} from '../../../services/incidentService';

// Import refactored components
import DateTimeSection from './QuickCapture/DateTimeSection';
import SeveritySection from './QuickCapture/SeveritySection';
import RemedySection from './QuickCapture/RemedySection';
import IncidentMediaUpload from './Media/IncidentMediaUpload';
import FollowUpSection from './QuickCapture/FollowUpSection';
import ActionButtons from './QuickCapture/ActionButtons';

const IncidentQuickCapture = ({ 
  incidentType, 
  childId, 
  childName, 
  onBack, 
  onSaved, 
  onClose 
}) => {
  const theme = useTheme();
  const [user] = useAuthState(auth);
  
  // Form state
  const [severity, setSeverity] = useState(5);
  const [remedy, setRemedy] = useState('');
  const [customRemedy, setCustomRemedy] = useState('');
  const [notes, setNotes] = useState('');
  const [scheduleFollowUp, setScheduleFollowUp] = useState(true);
  const [incidentDateTime, setIncidentDateTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [customCategories, setCustomCategories] = useState({});
  
  // Media state
  const [mediaFile, setMediaFile] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);

  // Load custom categories on mount
  useEffect(() => {
    const loadCustomCategories = async () => {
      if (childId) {
        try {
          const categories = await getCustomCategories(childId);
          setCustomCategories(categories);
        } catch (error) {
          console.error('Error loading custom categories:', error);
        }
      }
    };
    loadCustomCategories();
  }, [childId]);

  // Get incident config from either default or custom categories
  const getIncidentConfig = () => {
    return getIncidentTypeConfig(incidentType, customCategories) || null;
  };

  const incidentConfig = getIncidentConfig();
  const severityScale = getSeverityScale(incidentConfig?.id || 'other');
  const severityConfig = severityScale[severity];

  // Handlers
  const handleRemedyChange = (event) => {
    const value = event.target.value;
    setRemedy(value);
    if (value !== 'Other') {
      setCustomRemedy('');
    }
  };

  const handleMediaChange = (mediaData) => {
    setMediaFile(mediaData.mediaFile);
    setAudioBlob(mediaData.audioBlob);
  };

  const handleSave = async () => {
    if (!remedy) return;

    setLoading(true);
    try {
      const incidentData = {
        type: incidentType,
        severity,
        remedy: remedy === 'Other' ? customRemedy : remedy,
        customRemedy: remedy === 'Other' ? customRemedy : '',
        notes,
        incidentDateTime,
        mediaFile,
        audioBlob,
        authorId: user?.uid,
        authorName: user?.displayName || user?.email?.split('@')[0] || 'User',
        authorEmail: user?.email
      };

      // Use smart timing system when follow-up is scheduled
      const result = await createIncidentWithSmartFollowUp(childId, incidentData, scheduleFollowUp, childName);
      
      // Optionally show user the follow-up schedule
      if (result.followUpScheduled) {
        console.log(`Smart follow-up scheduled: ${result.followUpDescription} at ${result.nextFollowUpTime}`);
      }
      
      onSaved();
    } catch (error) {
      console.error('Error saving incident:', error);
    } finally {
      setLoading(false);
    }
  };

  const canSave = remedy && (remedy !== 'Other' || customRemedy.trim());
  const followUpScheduleText = formatFollowUpSchedule(
    incidentType, 
    severity, 
    (remedy === 'Other' ? customRemedy : remedy) || 'applied remedy'
  );

  // Add error handling for missing incident config
  if (!incidentConfig) {
    console.error('Incident configuration not found for type:', incidentType);
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">
          Error: Incident type configuration not found
        </Typography>
        <Button onClick={onBack} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, backgroundColor: '#fafbfc', minHeight: '100%' }}>
      <DateTimeSection 
        value={incidentDateTime}
        onChange={setIncidentDateTime}
      />

      <SeveritySection 
        severity={severity}
        onChange={setSeverity}
        severityConfig={severityConfig}
      />

      <RemedySection 
        remedy={remedy}
        onRemedyChange={handleRemedyChange}
        customRemedy={customRemedy}
        onCustomRemedyChange={(e) => setCustomRemedy(e.target.value)}
        incidentConfig={incidentConfig}
      />

      <IncidentMediaUpload 
        value={notes}
        onChange={setNotes}
        onMediaChange={handleMediaChange}
      />

      <FollowUpSection 
        scheduleFollowUp={scheduleFollowUp}
        onChange={(e) => setScheduleFollowUp(e.target.checked)}
        followUpScheduleText={followUpScheduleText}
      />

      <ActionButtons 
        onCancel={onClose}
        onSave={handleSave}
        canSave={canSave}
        loading={loading}
        incidentConfig={incidentConfig}
      />
    </Box>
  );
};

export default IncidentQuickCapture;
