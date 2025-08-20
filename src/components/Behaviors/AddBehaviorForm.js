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
import RichTextInput from '../UI/RichTextInput';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../services/firebase";

const AddBehaviorForm = ({ childId, onSaveSuccess, refreshTrigger }) => {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [richTextData, setRichTextData] = useState(null);

  const handleSave = async () => {
    let mediaURL = "";
    let voiceMemoURL = "";
    let mediaType = "";

    try {
      if (richTextData && richTextData.mediaFile) {
        const mediaRef = ref(
          storage,
          `behaviors/${childId}/${Date.now()}-${richTextData.mediaFile.file.name}`
        );
        await uploadBytes(mediaRef, richTextData.mediaFile.file);
        mediaURL = await getDownloadURL(mediaRef);
        mediaType = richTextData.mediaFile.type;
      }

      if (richTextData && richTextData.audioBlob) {
        const audioRef = ref(
          storage,
          `behaviors/${childId}/${Date.now()}-voice-memo.webm`
        );
        await uploadBytes(audioRef, richTextData.audioBlob);
        voiceMemoURL = await getDownloadURL(audioRef);
      }

      const behaviorData = {
        name,
        description: richTextData ? richTextData.text : "",
        goal,
        isTemplate: saveAsTemplate,
        iconName: selectedIcon,
        createdAt: selectedDate.toDate(),
        mediaURL,
        mediaType,
        voiceMemoURL,
      };

      await addBehavior(childId, behaviorData);
      if (onSaveSuccess) {
        onSaveSuccess();
      }
      // Reset form
      setName('');
      setGoal('');
      setSaveAsTemplate(false);
      setSelectedIcon(null);
      setSelectedDate(dayjs());
      setRichTextData(null);
    } catch (error) {
      console.error('Failed to save behavior:', error);
    }
  };

  const handleSelectTemplate = (template) => {
    setName(template.name);
    setRichTextData({ text: template.description, mediaFile: null, audioBlob: null });
    setSelectedIcon(template.iconName);
    setIsModalOpen(false);
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
        <Box sx={{ mb: 2 }}>
          <DatePicker
            label="Date of Behavior"
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue)}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
        </Box>
      </LocalizationProvider>

      <Box sx={{ mb: 2 }}>
        <TextField
          autoFocus
          label="Behavior Name"
          type="text"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Hand Flapping, Making Eye Contact"
        />
      </Box>
      <Box sx={{ mb: 2 }}>
        <RichTextInput onDataChange={setRichTextData} />
      </Box>
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Target Goal"
          type="text"
          fullWidth
          variant="outlined"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g., Reduce to < 5 times/hour, Increase to 3 seconds"
        />
      </Box>
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
