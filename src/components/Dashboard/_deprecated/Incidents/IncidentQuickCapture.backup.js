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
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import SaveIcon from '@mui/icons-material/Save';
import { useTheme } from '@mui/material/styles';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../services/firebase';
import { 
  addIncident,
  createIncidentWithSmartFollowUp,
  INCIDENT_TYPES, 
  getSeverityScale,
  getCustomCategories,
  formatFollowUpSchedule
} from '../../../services/incidentService';

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
  const [incidentDateTime, setIncidentDateTime] = useState(new Date());
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
        incidentDateTime,
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
        label: severityScale[i]?.label || String(i),
      });
    }
    return marks;
  };

  const canSave = remedy && (remedy !== 'Other' || customRemedy.trim());

  return (
    <Box sx={{ p: 3 }}>
      {/* Date and Time */}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DateTimePicker
          label="Incident Date & Time"
          value={incidentDateTime}
          onChange={setIncidentDateTime}
          renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
        />
      </LocalizationProvider>

      {/* Severity Slider */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid #e5e7eb', borderRadius: 2 }}>
        <Typography sx={{ mb: 1 }}>
          Severity: <strong>{severity}</strong> - {severityConfig?.label}
        </Typography>
        <Slider
          value={severity}
          onChange={handleSeverityChange}
          min={1}
          max={10}
          step={1}
          marks={getSeverityMarks()}
          valueLabelDisplay="auto"
          sx={{
            color: severityConfig?.color || theme.palette.primary.main,
            '& .MuiSlider-markLabel': {
              fontSize: '0.75rem'
            }
          }}
        />
      </Paper>

      {/* Remedy Selection */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid #e5e7eb', borderRadius: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Remedy</InputLabel>
          <Select value={remedy} label="Remedy" onChange={handleRemedyChange}>
            {(incidentConfig?.remedies || ['Other']).map((r) => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {remedy === 'Other' && (
          <TextField
            fullWidth
            label="Custom Remedy"
            value={customRemedy}
            onChange={(e) => setCustomRemedy(e.target.value)}
            sx={{ mt: 2 }}
            multiline
            rows={2}
          />
        )}
      </Paper>

      {/* Notes */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid #e5e7eb', borderRadius: 2 }}>
        <TextField
          fullWidth
          label="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          multiline
          rows={3}
        />
      </Paper>

      {/* Follow-up */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid #e5e7eb', borderRadius: 2 }}>
        <FormControlLabel
          control={<Switch checked={scheduleFollowUp} onChange={(e) => setScheduleFollowUp(e.target.checked)} />}
          label={
            <Box>
              <Typography variant="subtitle2">Smart Follow-up</Typography>
              <Typography variant="caption" color="text.secondary">
                {scheduleFollowUp
                  ? `Schedule: ${formatFollowUpSchedule(incidentType, severity, (remedy === 'Other' ? customRemedy : remedy) || 'applied remedy')}`
                  : 'Get reminders at smart times for this incident'}
              </Typography>
            </Box>
          }
        />
      </Paper>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!canSave || loading}
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          sx={{
            bgcolor: incidentConfig?.color,
            '&:hover': {
              bgcolor: incidentConfig?.color,
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

