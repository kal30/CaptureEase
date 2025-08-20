import React, { useState, useEffect } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import { addSensoryLog, fetchSensoryLogs } from "../../services/sensoryService";
import SeverityRating from "../../components/UI/Rating";
import SensoryInputList from "../../components/SensoryLog/SensoryInputList";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import RichTextInput from "../../components/UI/RichTextInput";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../services/firebase";

const SensoryLogTab = ({ childId, onSaveSuccess }) => {
  const [sensoryInputs, setSensoryInputs] = useState("");
  const [reaction, setReaction] = useState("");
  const [severity, setSeverity] = useState("");
  const [duration, setDuration] = useState("");
  const [triggerContext, setTriggerContext] = useState("");
  const [copingStrategy, setCopingStrategy] = useState("");
  const [caregiverIntervention, setCaregiverIntervention] = useState("");
  const [sensoryLogs, setSensoryLogs] = useState([]);
  const [timestamp, setTimestamp] = useState(dayjs());
  const [showAddForm, setShowAddForm] = useState(true);
  const [richTextData, setRichTextData] = useState(null);

  useEffect(() => {
    const loadSensoryLogs = async () => {
      const logs = await fetchSensoryLogs(childId);
      setSensoryLogs(logs);
    };
    loadSensoryLogs();
  }, [childId]);

  const handleSave = async () => {
    if (!sensoryInputs || !reaction || !severity) return;

    let mediaURL = "";
    let voiceMemoURL = "";
    let mediaType = "";

    try {
      if (richTextData && richTextData.mediaFile) {
        const mediaRef = ref(
          storage,
          `sensoryLogs/${childId}/${Date.now()}-${richTextData.mediaFile.file.name}`
        );
        await uploadBytes(mediaRef, richTextData.mediaFile.file);
        mediaURL = await getDownloadURL(mediaRef);
        mediaType = richTextData.mediaFile.type;
      }

      if (richTextData && richTextData.audioBlob) {
        const audioRef = ref(
          storage,
          `sensoryLogs/${childId}/${Date.now()}-voice-memo.webm`
        );
        await uploadBytes(audioRef, richTextData.audioBlob);
        voiceMemoURL = await getDownloadURL(audioRef);
      }

      await addSensoryLog(childId, {
        sensoryInputs: sensoryInputs.split(","),
        reaction,
        severity,
        duration,
        triggerContext,
        copingStrategy,
        caregiverIntervention,
        notes: richTextData ? richTextData.text : "",
        mediaURL,
        mediaType,
        voiceMemoURL,
        timestamp: timestamp.toDate(),
      });

      resetForm();
      onSaveSuccess();
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
    setTimestamp(dayjs());
    setRichTextData(null);
  };

  const handleEdit = (logId) => {
    console.log("Edit sensory log with ID:", logId);
  };

  const handleDelete = async (logId) => {
    console.log("Delete sensory log with ID:", logId);
    const updatedLogs = await fetchSensoryLogs(childId);
    setSensoryLogs(updatedLogs);
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "center", gap: 2 }}>
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
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Add Sensory Log
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ mb: 2 }}>
              <TextField
                label="Sensory Inputs"
                fullWidth
                value={sensoryInputs}
                onChange={(e) => setSensoryInputs(e.target.value)}
                helperText="Enter sensory inputs (comma separated)"
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <DatePicker
                label="Date"
                value={timestamp}
                onChange={(newValue) => setTimestamp(newValue)}
                renderInput={(params) => (
                  <TextField {...params} fullWidth />
                )}
              />
            </Box>
          </LocalizationProvider>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Reaction"
              multiline
              rows={3}
              fullWidth
              value={reaction}
              onChange={(e) => setReaction(e.target.value)}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <SeverityRating severity={severity} setSeverity={setSeverity} />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Duration (minutes)"
              fullWidth
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Trigger Context"
              fullWidth
              value={triggerContext}
              onChange={(e) => setTriggerContext(e.target.value)}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Coping Strategy"
              fullWidth
              value={copingStrategy}
              onChange={(e) => setCopingStrategy(e.target.value)}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Caregiver Intervention"
              fullWidth
              value={caregiverIntervention}
              onChange={(e) => setCaregiverIntervention(e.target.value)}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <RichTextInput onDataChange={setRichTextData} />
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            sx={{ mt: 2 }}
          >
            Save Sensory Log
          </Button>
        </>
      ) : (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Recent Sensory Logs
          </Typography>
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
