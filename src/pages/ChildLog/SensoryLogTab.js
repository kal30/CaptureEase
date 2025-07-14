import React, { useState, useEffect } from "react";
import { Box, TextField, Button, Typography, IconButton } from "@mui/material";
import MicNoneIcon from '@mui/icons-material/MicNone';
import { addSensoryLog, fetchSensoryLogs } from "../../services/sensoryService";
import SeverityRating from "../../components/UI/Rating";
import SensoryInputList from "../../components/SensoryLog/SensoryInputList"; // Re-use existing list
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

const SensoryLogTab = ({ childId, onSaveSuccess }) => {
  const [sensoryInputs, setSensoryInputs] = useState("");
  const [reaction, setReaction] = useState("");
  const [severity, setSeverity] = useState("");
  const [duration, setDuration] = useState("");
  const [triggerContext, setTriggerContext] = useState("");
  const [copingStrategy, setCopingStrategy] = useState("");
  const [caregiverIntervention, setCaregiverIntervention] = useState("");
  const [notes, setNotes] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [sensoryLogs, setSensoryLogs] = useState([]); // Re-add state for the list
  const [timestamp, setTimestamp] = useState(dayjs());
  const [showAddForm, setShowAddForm] = useState(true); // State to toggle between add form and list

  useEffect(() => {
    const loadSensoryLogs = async () => {
      const logs = await fetchSensoryLogs(childId);
      setSensoryLogs(logs);
    };
    loadSensoryLogs();

    if (recognition) {
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("");
        setNotes((prevNotes) => prevNotes + transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };
    }
  }, [childId]);

  const handleVoiceInput = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
      } else {
        recognition.start();
      }
    } else {
      alert("Speech recognition is not supported in this browser.");
    }
  };

  const handleSave = async () => {
    if (!sensoryInputs || !reaction || !severity) return;

    try {
      await addSensoryLog(childId, {
        sensoryInputs: sensoryInputs.split(","),
        reaction,
        severity,
        duration,
        triggerContext,
        copingStrategy,
        caregiverIntervention,
        notes,
        timestamp: timestamp.toDate(), // Use the selected date
      });

      resetForm();
      onSaveSuccess(); // Notify parent to refresh calendar
      // Refresh the logs after adding a new one
      const updatedLogs = await fetchSensoryLogs(childId);
      setSensoryLogs(updatedLogs);
    } catch (error) {
      console.error("Error adding sensory log:", error);
    }
  };

  const resetForm = () => {
    setSensoryInputs("");
    setReaction("");
    setSeverity("");
    setDuration("");
    setTriggerContext("");
    setCopingStrategy("");
    setCaregiverIntervention("");
    setNotes("");
    setTimestamp(dayjs());
  };

  const handleEdit = (logId) => {
    console.log("Edit sensory log with ID:", logId);
    // Implement edit logic here
  };

  const handleDelete = async (logId) => {
    console.log("Delete sensory log with ID:", logId);
    // Implement delete logic here
    // For now, just refresh the list after a simulated delete
    // In a real app, you'd call a delete service and then refresh
    const updatedLogs = await fetchSensoryLogs(childId);
    setSensoryLogs(updatedLogs);
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="contained"
          onClick={() => setShowAddForm(true)}
          disabled={showAddForm}
        >
          Add New Entry
        </Button>
        <Button
          variant="contained"
          onClick={() => setShowAddForm(false)}
          disabled={!showAddForm}
        >
          View Previous Entries
        </Button>
      </Box>

      {showAddForm ? (
        <>
          <Typography variant="h6" gutterBottom>Add Sensory Log</Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TextField
              label="Sensory Inputs"
              fullWidth
              value={sensoryInputs}
              onChange={(e) => setSensoryInputs(e.target.value)}
              helperText="Enter sensory inputs (comma separated)"
              sx={{ my: 2 }}
            />
            <DatePicker
              label="Date"
              value={timestamp}
              onChange={(newValue) => setTimestamp(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth sx={{ my: 2 }} />}
            />
          </LocalizationProvider>
          <TextField
            label="Reaction"
            multiline
            rows={3}
            fullWidth
            value={reaction}
            onChange={(e) => setReaction(e.target.value)}
            sx={{ my: 2 }}
          />
          <SeverityRating severity={severity} setSeverity={setSeverity} />
          <TextField
            label="Duration (minutes)"
            fullWidth
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            sx={{ my: 2 }}
          />
          <TextField
            label="Trigger Context"
            fullWidth
            value={triggerContext}
            onChange={(e) => setTriggerContext(e.target.value)}
            sx={{ my: 2 }}
          />
          <TextField
            label="Coping Strategy"
            fullWidth
            value={copingStrategy}
            onChange={(e) => setCopingStrategy(e.target.value)}
            sx={{ my: 2 }}
          />
          <TextField
            label="Caregiver Intervention"
            fullWidth
            value={caregiverIntervention}
            onChange={(e) => setCaregiverIntervention(e.target.value)}
            sx={{ my: 2 }}
          />
          <TextField
            label="Notes"
            fullWidth
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{ my: 2 }}
            InputProps={{
              endAdornment: (
                <IconButton onClick={handleVoiceInput} disabled={isListening}>
                  <MicNoneIcon color={isListening ? "primary" : "action"} />
                </IconButton>
              ),
            }}
          />
          <Button variant="contained" color="primary" onClick={handleSave} sx={{ mt: 2 }}>
            Save Sensory Log
          </Button>
        </>
      ) : (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>Recent Sensory Logs</Typography>
          <SensoryInputList
            entries={sensoryLogs}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
        </Box>
      )}
    </Box>
  );
};

export default SensoryLogTab;
