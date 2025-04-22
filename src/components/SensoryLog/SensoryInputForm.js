import React, { useState, useEffect } from "react";
import {
  Autocomplete,
  TextField,
  Button,
  Chip,
  Typography,
} from "@mui/material";
import { fetchSensoryLogs, addSensoryLog } from "../../services/sensoryService";
import SeverityRating from "../UI/Rating";
import "../../assets/css/SensoryInputForm.css";

const SensoryInputForm = ({ childId, onLogAdded }) => {
  const [sensoryInput, setSensoryInput] = useState([]);
  const [reaction, setReaction] = useState("");
  const [severity, setSeverity] = useState("");
  const [duration, setDuration] = useState("");
  const [triggerContext, setTriggerContext] = useState("");
  const [copingStrategy, setCopingStrategy] = useState("");
  const [caregiverIntervention, setCaregiverIntervention] = useState("");
  const [notes, setNotes] = useState("");
  const [availableSensoryOptions, setAvailableSensoryOptions] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      const options = await fetchSensoryLogs(); // Fetch sensory options here
      setAvailableSensoryOptions(options);
    };

    fetchOptions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const sensoryLogData = {
      sensoryInputs: sensoryInput,
      reaction,
      severity,
      duration,
      triggerContext,
      copingStrategy,
      caregiverIntervention,
      notes,
      timestamp: new Date(),
    };

    // Add new entry to the backend for a specific child
    await addSensoryLog(childId, sensoryLogData);

    alert("Sensory log saved successfully!");

    // Clear form after submission
    resetForm();

    // Notify the parent component about the new log added
    if (onLogAdded) onLogAdded();
  };

  const resetForm = () => {
    setSensoryInput([]);
    setReaction("");
    setSeverity("");
    setDuration("");
    setTriggerContext("");
    setCopingStrategy("");
    setCaregiverIntervention("");
    setNotes("");
  };

  return (
    <div>
      <form className="sensory-form" onSubmit={handleSubmit}>
        <Typography variant="h5">New Sensory Log</Typography>

        <div className="form-row">
          <Autocomplete
            multiple
            freeSolo
            fullWidth
            options={availableSensoryOptions}
            value={sensoryInput}
            onChange={(event, newValue) => setSensoryInput(newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option}
                  {...getTagProps({ index })}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Sensory Inputs"
                placeholder="Enter or select sensory inputs"
                helperText="Enter what sensory input triggered the reaction, e.g., loud noises, bright lights."
                fullWidth
              />
            )}
          />
        </div>

        <div className="form-row">
          <TextField
            label="Reaction *"
            value={reaction}
            onChange={(e) => setReaction(e.target.value)}
            required
            helperText="Describe how your child reacted (e.g., anxious, calm, crying)."
            fullWidth
            multiline
            rows={4}
          />
        </div>

        <div className="form-row">
          <SeverityRating severity={severity} setSeverity={setSeverity} />
        </div>

        <div className="form-row">
          <TextField
            label="Duration (minutes)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            fullWidth
            helperText="How long did the reaction last? Enter in minutes."
          />

          <TextField
            label="Trigger Context"
            value={triggerContext}
            onChange={(e) => setTriggerContext(e.target.value)}
            fullWidth
            helperText="Describe the situation when the reaction occurred (e.g., in a crowded mall)."
          />
        </div>

        <div className="form-row">
          <TextField
            label="Coping Strategy"
            value={copingStrategy}
            onChange={(e) => setCopingStrategy(e.target.value)}
            fullWidth
            helperText="What was done to help your child manage the situation?"
          />

          <TextField
            label="Caregiver Intervention"
            value={caregiverIntervention}
            onChange={(e) => setCaregiverIntervention(e.target.value)}
            fullWidth
            helperText="Did you step in to help? If yes, what did you do?"
          />
        </div>

        <div className="form-row">
          <TextField
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            multiline
            rows={4}
            helperText="Add any additional details about the reaction or situation."
          />
        </div>

        <div className="form-row">
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className="submit-btn"
          >
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SensoryInputForm;
