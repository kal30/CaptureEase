import React from 'react';
import { Box, TextField, MenuItem, Typography, IconButton, Button, Stack } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

const MedicationDrawerForm = ({
  formData,
  setFormData,
  frequencyOptions,
  onFrequencyChange,
  onAddTime,
  onUpdateTime,
  onRemoveTime,
}) => (
  <Stack spacing={2}>
    <TextField
      label="Medication Name"
      value={formData.name}
      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      fullWidth
      required
      autoFocus
    />
    <TextField
      label="Dosage"
      value={formData.dosage}
      onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
      placeholder="e.g., 25 mcg, 500 mg"
      fullWidth
      required
    />
    <TextField
      select
      label="Frequency"
      value={formData.frequency}
      onChange={(e) => onFrequencyChange(e.target.value)}
      fullWidth
      helperText="Times will update automatically when you change frequency"
    >
      {frequencyOptions.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </TextField>

    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Scheduled Times
      </Typography>
      {formData.scheduledTimes.map((time, index) => (
        <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <TextField
            type="time"
            value={time}
            onChange={(e) => onUpdateTime(index, e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ step: 300 }}
            fullWidth
            size="small"
          />
          {formData.scheduledTimes.length > 1 && (
            <IconButton size="small" color="error" onClick={() => onRemoveTime(index)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      ))}
      <Button size="small" startIcon={<AddIcon />} onClick={onAddTime}>
        Add Time
      </Button>
    </Box>

    <TextField
      label="Notes"
      value={formData.notes}
      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
      multiline
      rows={2}
      fullWidth
      placeholder="Special instructions..."
    />
  </Stack>
);

export default MedicationDrawerForm;
