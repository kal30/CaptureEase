// src/components/SensoryLog/AddSensoryLogModal.js
import React, { useState, useEffect } from "react";
import { Box, Modal, TextField, Button, Typography } from "@mui/material";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../services/firebase";
import SeverityRating from "../UI/Rating"; // Import your severity rating component

// Define the modal style here
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 800,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const AddSensoryLogModal = ({
  open,
  onClose,
  childId,
  onLogAdded,
  selectedDate,
}) => {
  const [sensoryInputs, setSensoryInputs] = useState("");
  const [reaction, setReaction] = useState("");
  const [severity, setSeverity] = useState("");
  const [duration, setDuration] = useState("");
  const [triggerContext, setTriggerContext] = useState("");
  const [copingStrategy, setCopingStrategy] = useState("");
  const [caregiverIntervention, setCaregiverIntervention] = useState("");
  const [notes, setNotes] = useState("");

  // Reset form whenever the modal is closed
  useEffect(() => {
    console.log("childId:", childId);
    console.log("selectedDate:", selectedDate);
    if (!open) {
      resetForm();
    }
  }, [open, childId, selectedDate]);

  const handleSave = async () => {
    if (!sensoryInputs || !reaction || !severity) return;

    try {
      await addDoc(collection(db, "children", childId, "sensory_logs"), {
        sensoryInputs: sensoryInputs.split(","),
        reaction,
        severity,
        duration,
        triggerContext,
        copingStrategy,
        caregiverIntervention,
        notes,
        timestamp: selectedDate || new Date(), // Use selected date or current date
      });

      onClose();
      onLogAdded(); // Refresh the log list after adding
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
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" gutterBottom>
          Add Sensory Log
        </Typography>

        <TextField
          label="Sensory Inputs"
          fullWidth
          value={sensoryInputs}
          onChange={(e) => setSensoryInputs(e.target.value)}
          helperText="Enter sensory inputs (comma separated)"
          sx={{ my: 2 }}
        />

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
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          sx={{ mt: 2 }}
        >
          Save Sensory Log
        </Button>
      </Box>
    </Modal>
  );
};

export default AddSensoryLogModal;
