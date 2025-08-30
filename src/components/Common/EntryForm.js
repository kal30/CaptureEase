import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import SaveIcon from '@mui/icons-material/Save';
import { useTheme } from '@mui/material/styles';
import EntrySlider from './EntrySlider';
import RichTextInput from '../UI/RichTextInput';

/**
 * EntryForm - Reusable form component for both incidents and habits
 * Provides consistent structure: Date → Slider → Notes → Save
 * For Quick Notes: Shows text input instead of slider
 * 
 * @param {Object} props
 * @param {string} props.title - Form title
 * @param {string} props.sliderLabel - Label for the slider
 * @param {Object} props.scale - Scale configuration for slider
 * @param {string} props.color - Theme color for styling
 * @param {function} props.onSave - Save handler function
 * @param {function} props.onCancel - Cancel handler function
 * @param {boolean} props.loading - Loading state
 * @param {string} props.notesPlaceholder - Placeholder for notes field
 * @param {Date} props.defaultDate - Default date value
 * @param {boolean} props.isTextInput - Show text input instead of slider (for Quick Notes)
 */
const EntryForm = ({
  title = "Entry Form",
  sliderLabel = "Level",
  scale = {},
  color = "primary",
  onSave,
  onCancel,
  loading = false,
  notesPlaceholder = "Add notes, photos, or voice recordings...",
  defaultDate = new Date(),
  isTextInput = false
}) => {
  const theme = useTheme();
  const [date, setDate] = useState(defaultDate);
  const [level, setLevel] = useState(5);
  const [quickNoteText, setQuickNoteText] = useState('');
  const [notesData, setNotesData] = useState({ text: '', mediaFile: null, audioBlob: null });
  const [clearRichText, setClearRichText] = useState(false);

  const handleSave = async () => {
    const formData = {
      date,
      level: isTextInput ? null : level, // No level for Quick Notes
      notes: notesData.text,
      mediaFile: notesData.mediaFile,
      audioBlob: notesData.audioBlob,
      timestamp: new Date()
    };

    try {
      await onSave(formData);
      
      // Reset form
      setDate(new Date());
      setLevel(5);
      setNotesData({ text: '', mediaFile: null, audioBlob: null });
      setClearRichText(prev => !prev); // Trigger RichTextInput reset
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  const handleSliderChange = (event, newValue) => {
    setLevel(newValue);
  };

  const handleNotesChange = (data) => {
    setNotesData(data);
  };

  const isFormValid = date && (isTextInput ? notesData.text.trim() : (level >= 1 && level <= 10));

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 4, backgroundColor: '#fafbfc', minHeight: '100%' }}>
        {/* Date Field */}
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
              color: '#1f2937',
              mb: 2
            }}
          >
            Date
          </Typography>
          <DatePicker
            label="Select Date"
            value={date}
            onChange={setDate}
            slotProps={{
              textField: {
                fullWidth: true,
                variant: "outlined"
              }
            }}
            maxDate={new Date()} // Can't select future dates
          />
        </Paper>

        {/* Level Slider - Skip for Quick Notes */}
        {!isTextInput && (
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
            <EntrySlider
              label={sliderLabel}
              value={level}
              onChange={handleSliderChange}
              scale={scale}
              color={color}
              showDescription={true}
            />
          </Paper>
        )}

        {/* Notes Field with Media */}
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
              color: '#1f2937',
              mb: 2
            }}
          >
            {isTextInput ? 'Quick Notes' : 'Notes'}
          </Typography>
          <RichTextInput
            onDataChange={handleNotesChange}
            clearData={clearRichText}
            templateText=""
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {isTextInput 
              ? 'Write a quick note about today - add text, photos, voice recordings, or videos'
              : 'Add text notes, photos, voice recordings, or videos to provide context'
            }
          </Typography>
        </Paper>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={loading}
            sx={{ flex: 1 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!isFormValid || loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            sx={{
              flex: 2,
              bgcolor: scale[level]?.color || theme.palette[color]?.main,
              '&:hover': {
                bgcolor: scale[level]?.color || theme.palette[color]?.dark,
                filter: 'brightness(0.9)',
              }
            }}
          >
            {loading ? 'Saving...' : 'Save Entry'}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default EntryForm;