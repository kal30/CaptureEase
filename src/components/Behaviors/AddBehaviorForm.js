
import React, { useState } from 'react';
import {
  Button,
  TextField,
  Box,
  Typography,
  Paper,
  Alert,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { addBehavior } from '../../services/behaviorService';
import BehaviorTemplateModal from './BehaviorTemplateModal';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const AddBehaviorForm = ({ childId, onSaveSuccess, refreshTrigger }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs()); // State for selected date

  const handleSave = async () => {
    const behaviorData = {
      name,
      description,
      goal,
      isTemplate: saveAsTemplate,
      iconName: selectedIcon,
      createdAt: selectedDate.toDate(), // Use selectedDate for createdAt
    };
    try {
      await addBehavior(childId, behaviorData);
      if (onSaveSuccess) {
        onSaveSuccess();
      }
      // Reset form
      setName('');
      setDescription('');
      setGoal('');
      setSaveAsTemplate(false);
      setSelectedIcon(null);
      setSelectedDate(dayjs()); // Reset date to today
    } catch (error) {
      console.error('Failed to save behavior:', error);
    }
  };

  const handleSelectTemplate = (template) => {
    setName(template.name);
    setDescription(template.description);
    setSelectedIcon(template.iconName);
    setIsModalOpen(false); // Close modal after selection
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Define a Custom Behavior
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Use the fields below to define a new behavior you want to track from scratch.
      </Typography>

      <Alert severity="info" icon={<LightbulbIcon />} sx={{ mb: 3}}>
        <Box>
          <Typography variant="subtitle1">Need some ideas?</Typography>
          <Button color="info" size="small" variant="contained" onClick={() => setIsModalOpen(true)} sx={{ mt: 1 }}>
              Browse Common Templates
          </Button>
        </Box>
      </Alert>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="Date of Behavior"
          value={selectedDate}
          onChange={(newValue) => setSelectedDate(newValue)}
          renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
        />
      </LocalizationProvider>

      <TextField
        autoFocus
        margin="dense"
        label="Behavior Name"
        type="text"
        fullWidth
        variant="outlined"
        value={name}
        onChange={(e) => setName(e.target.value)}
        sx={{ mb: 2 }}
        placeholder="e.g., Hand Flapping, Making Eye Contact"
      />
      <TextField
        margin="dense"
        label="Observable Definition"
        type="text"
        fullWidth
        multiline
        rows={3}
        variant="outlined"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        sx={{ mb: 2 }}
        placeholder="Describe exactly what the behavior looks like."
      />
      <TextField
        margin="dense"
        label="Target Goal"
        type="text"
        fullWidth
        variant="outlined"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        sx={{ mb: 2 }}
        placeholder="e.g., Reduce to < 5 times/hour, Increase to 3 seconds"
      />
        <FormControlLabel
            control={<Checkbox checked={saveAsTemplate} onChange={(e) => setSaveAsTemplate(e.target.checked)} />}
            label="Save this as a reusable template for later?"
            sx={{ mb: 2, display: 'block' }}
        />
      <Button onClick={handleSave} variant="contained" color="primary" size="large" sx={{ mt: 1 }}>
        Save Custom Behavior
      </Button>
      <BehaviorTemplateModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
        refreshTrigger={refreshTrigger}
        childId={childId}
      />
    </Paper>
  );
};

export default AddBehaviorForm;
