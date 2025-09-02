import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Slider,
  Button,
  Paper,
  Chip,
  CircularProgress,
  Autocomplete,
  Alert
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useTheme } from '@mui/material/styles';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../services/firebase';
import { 
  addIncident,
  createIncidentWithSmartFollowUp, 
  INCIDENT_TYPES, 
  getSeverityScale,
  getSimilarIncidentNames,
  checkForCategorySuggestion,
  getCustomCategories 
} from '../../../services/incidentService';
import { useAsyncForm } from '../../../hooks/useAsyncForm';
import { useAsyncOperation } from '../../../hooks/useAsyncOperation';
import CategoryCreationModal from '../CategoryCreationModal';

const OtherIncidentCapture = ({ 
  childId, 
  childName, 
  onBack, 
  onSaved, 
  onClose,
  onCategoryCreated,
  isCustomCategory = false,
  customCategoryType = null
}) => {
  const theme = useTheme();
  const [user] = useAuthState(auth);
  const [incidentName, setIncidentName] = useState('');
  const [severity, setSeverity] = useState(5);
  const [notes, setNotes] = useState('');
  const [similarNames, setSimilarNames] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categorySuggestion, setCategorySuggestion] = useState(null);
  const [customCategories, setCustomCategories] = useState({});

  // Use async form hook for incident submission
  const incidentForm = useAsyncForm({
    validate: ({ incidentName, isCustomCategory }) => {
      if (!isCustomCategory && !incidentName?.trim()) {
        throw new Error('Please enter an incident name');
      }
    }
  });

  // Use async operation hook for suggestions loading
  const suggestionsOperation = useAsyncOperation();

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

  // Get incident config based on whether it's a custom category or "Other"
  const getIncidentConfig = () => {
    if (isCustomCategory && customCategoryType) {
      return customCategories[customCategoryType] || INCIDENT_TYPES.OTHER;
    }
    return INCIDENT_TYPES.OTHER;
  };

  const incidentConfig = getIncidentConfig();
  const severityScale = getSeverityScale(isCustomCategory ? 'other' : 'other');
  const severityConfig = severityScale[severity];

  // Load similar incident names for autocomplete
  useEffect(() => {
    const loadSimilarNames = async () => {
      if (incidentName.length >= 2) {
        const names = await suggestionsOperation.execute(async () => {
          return await getSimilarIncidentNames(childId, incidentName);
        });
        if (names) {
          setSimilarNames(names);
        }
      } else {
        setSimilarNames([]);
      }
    };

    const debounceTimer = setTimeout(loadSimilarNames, 300);
    return () => clearTimeout(debounceTimer);
  }, [incidentName, childId, suggestionsOperation]);

  const handleSeverityChange = (event, newValue) => {
    setSeverity(newValue);
  };

  const handleSave = () => {
    incidentForm.submitForm(
      async () => {
        const incidentData = {
          type: isCustomCategory ? customCategoryType : 'other',
          customIncidentName: isCustomCategory ? '' : incidentName.trim(),
          severity,
          remedy: notes || 'General observation and monitoring',
          notes,
          authorId: user?.uid,
          authorName: user?.displayName || user?.email?.split('@')[0] || 'User',
          authorEmail: user?.email
        };

        await addIncident(childId, incidentData, true, childName || 'child');

        // Only check for category suggestions if this is a regular "Other" incident
        if (!isCustomCategory) {
          const suggestionCheck = await checkForCategorySuggestion(childId, incidentName.trim());
          
          if (suggestionCheck.shouldSuggest) {
            setCategorySuggestion(suggestionCheck.suggestion);
            setShowCategoryModal(true);
            return; // Don't call onSaved yet, let the category modal handle it
          }
        }

        onSaved();
      },
      { incidentName, isCustomCategory }
    );
  };

  const handleCategoryCreated = (result) => {
    console.log('🎉 Category created callback triggered:', result);
    setShowCategoryModal(false);
    setCategorySuggestion(null);
    // Notify parent component that a category was created so it can refresh
    if (onCategoryCreated) {
      onCategoryCreated();
    }
    onSaved(); // Now call onSaved after handling the category
  };

  const handleCategoryModalClose = () => {
    setShowCategoryModal(false);
    setCategorySuggestion(null);
    onSaved(); // Still call onSaved even if they don't create the category
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

  const canSave = isCustomCategory || incidentName.trim().length > 0;

  return (
    <Box sx={{ p: 4, backgroundColor: '#fafbfc', minHeight: '100%' }}>
      {incidentForm.error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }} 
          onClose={() => incidentForm.clearError()}
        >
          {incidentForm.error}
        </Alert>
      )}

      {/* Incident Name Input */}
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
          Incident Name
        </Typography>
        <Autocomplete
          value={incidentName}
          onChange={(event, newValue) => {
            setIncidentName(newValue || '');
          }}
          onInputChange={(event, newInputValue) => {
            setIncidentName(newInputValue);
          }}
          options={similarNames}
          loading={suggestionsOperation.loading}
          freeSolo
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="e.g., 'New Rash', 'Upset Stomach', 'Difficulty Swallowing'"
              fullWidth
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {suggestionsOperation.loading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">{option}</Typography>
                <Chip size="small" label="Previous" variant="outlined" />
              </Box>
            </Box>
          )}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Describe what happened. If you've logged something similar before, suggestions will appear.
        </Typography>
      </Paper>

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

      {/* Notes */}
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
          Additional Context
        </Typography>
        <TextField
          fullWidth
          placeholder="Describe what happened, potential triggers, how the child reacted..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          multiline
          rows={4}
          variant="outlined"
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
          disabled={!canSave || incidentForm.loading}
          startIcon={incidentForm.loading ? <CircularProgress size={20} /> : <SaveIcon />}
          sx={{
            flex: 2,
            bgcolor: incidentConfig.color,
            '&:hover': {
              bgcolor: incidentConfig.color,
              filter: 'brightness(0.9)',
            },
          }}
        >
          {incidentForm.loading ? 'Saving...' : 'Save Incident'}
        </Button>
      </Box>

      {/* Category Creation Modal */}
      <CategoryCreationModal
        open={showCategoryModal}
        onClose={handleCategoryModalClose}
        childId={childId}
        suggestion={categorySuggestion}
        onCategoryCreated={handleCategoryCreated}
      />
    </Box>
  );
};

export default OtherIncidentCapture;