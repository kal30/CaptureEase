import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Button,
  Stack,
} from '@mui/material';
import { useTheme } from '@mui/material/styles'; // Import useTheme
import {
  SentimentVeryDissatisfied,
  SentimentDissatisfied,
  SentimentSatisfied,
  SentimentSatisfiedAlt,
  SentimentVerySatisfied,
} from '@mui/icons-material';
import { logMood } from '../../services/moodService';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const moods = [
  { icon: <SentimentVeryDissatisfied fontSize="large" />, label: 'Terrible' },
  { icon: <SentimentDissatisfied fontSize="large" />, label: 'Bad' },
  { icon: <SentimentSatisfied fontSize="large" />, label: 'Okay' },
  { icon: <SentimentSatisfiedAlt fontSize="large" />, label: 'Good' },
  { icon: <SentimentVerySatisfied fontSize="large" />, label: 'Great' },
];

const LogMoodModal = ({ open, onClose, child }) => {
  const theme = useTheme(); // Get the theme object
  const [selectedMood, setSelectedMood] = useState(null);

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood.label);
  };

  const handleSubmit = async () => {
    if (selectedMood) {
      await logMood(child.id, selectedMood);
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2">
          How is {child?.name} feeling?
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 2, mb: 2, justifyContent: 'center' }}>
          {moods.map((mood) => (
            <IconButton 
              key={mood.label} 
              onClick={() => handleMoodSelect(mood)}
              sx={{ color: selectedMood === mood.label ? theme.palette.primary.main : 'action.active' }}
            >
              {mood.icon}
            </IconButton>
          ))}
        </Stack>
        {selectedMood && (
          <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>
            Selected: {selectedMood}
          </Typography>
        )}
        <Button variant="contained" color="primary" onClick={handleSubmit} disabled={!selectedMood} sx={{ mt: 2 }}>
          Log Mood
        </Button>
      </Box>
    </Modal>
  );
};

export default LogMoodModal;