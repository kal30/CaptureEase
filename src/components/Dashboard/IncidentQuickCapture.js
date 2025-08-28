import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Paper,
  Chip,
  FormControlLabel,
  Switch,
  CircularProgress
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useTheme } from '@mui/material/styles';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../services/firebase';
import { 
  addIncident,
  createIncidentWithSmartFollowUp,
  INCIDENT_TYPES, 
  getSeverityScale,
  getCustomCategories,
  formatFollowUpSchedule
} from '../../services/incidentService';

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
  const [severity, setSeverity] = useState(5);
  const [remedy, setRemedy] = useState('');
  const [customRemedy, setCustomRemedy] = useState('');
  const [notes, setNotes] = useState('');
  const [scheduleFollowUp, setScheduleFollowUp] = useState(true);
  const [loading, setLoading] = useState(false);
  const [customCategories, setCustomCategories] = useState({});

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
    if (INCIDENT_TYPES[incidentType]) {
      return INCIDENT_TYPES[incidentType];
    }
    // Check custom categories
    return customCategories[incidentType] || null;
  };

  const incidentConfig = getIncidentConfig();
  const severityScale = getSeverityScale(incidentConfig?.id || 'other');
  const severityConfig = severityScale[severity];

  const handleSeverityChange = (event, newValue) => {
    setSeverity(newValue);
  };

  const handleRemedyChange = (event) => {
    const value = event.target.value;
    setRemedy(value);
    if (value !== 'Other') {
      setCustomRemedy('');
    }
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

  const getSeverityMarks = () => {
    const marks = [];
    for (let i = 1; i <= 10; i++) {
      marks.push({
        value: i,
        label: i.toString()
      });
    }
    return marks;
  };

  const canSave = remedy && (remedy !== 'Other' || customRemedy.trim());

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

      {/* Severity Slider */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          backgroundColor: '#ffffff'
        }}
      >
        <Typography 
          variant="subtitle1" 
          gutterBottom 
          sx={{ 
            fontWeight: 600,
            color: '#1f2937'
          }}
        >
          Severity Level: {severity}/10
        </Typography>
        <Box sx={{ px: 2, py: 2 }}>
          <Slider
            value={severity}
            onChange={handleSeverityChange}
            min={1}
            max={10}
            step={1}
            marks={getSeverityMarks()}
            valueLabelDisplay="on"
            sx={{
              '& .MuiSlider-thumb': {
                backgroundColor: severityConfig.color,
                width: 24,
                height: 24,
              },
              '& .MuiSlider-track': {
                backgroundColor: severityConfig.color,
              },
              '& .MuiSlider-rail': {
                backgroundColor: theme.palette.grey[300],
              },
              '& .MuiSlider-valueLabel': {
                backgroundColor: severityConfig.color,
              },
            }}
          />
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Chip
              label={`${severityConfig.label} - ${severityConfig.description}`}
              sx={{
                bgcolor: severityConfig.color,
                color: 'white',
                fontWeight: 600,
              }}
            />
          </Box>
        </Box>
      </Paper>

      {/* Remedy Selection */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          backgroundColor: '#ffffff'
        }}
      >
        <Typography 
          variant="subtitle1" 
          gutterBottom 
          sx={{ 
            fontWeight: 600,
            color: '#1f2937'
          }}
        >
          Remedy Applied
        </Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Select remedy</InputLabel>
          <Select
            value={remedy}
            label="Select remedy"
            onChange={handleRemedyChange}
          >
            {incidentConfig.remedies.map((remedyOption) => (
              <MenuItem key={remedyOption} value={remedyOption}>
                {remedyOption}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {remedy === 'Other' && (
          <TextField
            fullWidth
            label="Custom remedy"
            placeholder="Describe what you did..."
            value={customRemedy}
            onChange={(e) => setCustomRemedy(e.target.value)}
            multiline
            rows={2}
          />
        )}
      </Paper>

      {/* Optional Notes */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          backgroundColor: '#ffffff'
        }}
      >
        <Typography 
          variant="subtitle1" 
          gutterBottom 
          sx={{ 
            fontWeight: 600,
            color: '#1f2937'
          }}
        >
          Additional Notes (Optional)
        </Typography>
        <TextField
          fullWidth
          placeholder="Any additional details..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          multiline
          rows={3}
          variant="outlined"
        />
      </Paper>

      {/* Follow-up Option */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          backgroundColor: '#ffffff'
        }}
      >
        <FormControlLabel
          control={
            <Switch
              checked={scheduleFollowUp}
              onChange={(e) => setScheduleFollowUp(e.target.checked)}
              color="primary"
            />
          }
          label={
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Smart Follow-up
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {scheduleFollowUp 
                  ? `Check-ins scheduled at: ${formatFollowUpSchedule(incidentType, severity, (remedy === 'Other' ? customRemedy : remedy) || 'applied remedy')}`
                  : "Get smart reminders timed for this incident type"
                }
              </Typography>
            </Box>
          }
        />
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{ flex: 1 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!canSave || loading}
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          sx={{
            flex: 2,
            bgcolor: incidentConfig.color,
            '&:hover': {
              bgcolor: incidentConfig.color,
              filter: 'brightness(0.9)',
            },
          }}
        >
          {loading ? 'Saving...' : 'Save Incident'}
        </Button>
      </Box>
    </Box>
  );
};

export default IncidentQuickCapture;