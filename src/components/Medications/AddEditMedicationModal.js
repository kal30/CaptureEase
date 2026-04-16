import React from "react";
import {
  Box,
  Button,
  Grid,
  TextField,
  Autocomplete,
  Typography,
} from "@mui/material";
import LogFormShell from "../UI/LogFormShell";
import RichTextInput from "../UI/RichTextInput";

const AddEditMedicationModal = ({
  open,
  onClose,
  childName,
  medicationForm,
  handleMedicationFormChange,
  handleMedicationSubmit,
  handleCancelEdit,
  editingMedicationId,
  medicationSuggestions,
  handleMedicationSearch,
  medicationNotesData,
  setMedicationNotesData,
}) => {
  const title = editingMedicationId ? "Edit Medication" : "Medication";
  const subtitle = editingMedicationId
    ? "Update medication details and notes"
    : "Add medication details and notes";

  const footer = (
    <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end", flexWrap: "wrap" }}>
      <Button
        type="submit"
        variant="contained"
        onClick={handleMedicationSubmit}
        sx={{ width: { xs: "100%", sm: "auto" } }}
      >
        {editingMedicationId ? "Update Medication" : "Add Medication"}
      </Button>
      {editingMedicationId ? (
        <Button variant="outlined" onClick={handleCancelEdit} sx={{ width: { xs: "100%", sm: "auto" } }}>
          Cancel
        </Button>
      ) : (
        <Button variant="outlined" onClick={onClose} sx={{ width: { xs: "100%", sm: "auto" } }}>
          Done
        </Button>
      )}
    </Box>
  );

  return (
    <LogFormShell
      open={open}
      onClose={onClose}
      title={title}
      titleBadge={childName || null}
      subtitle={subtitle}
      compactTitle
      footer={footer}
      mobileBreakpoint="md"
      maxWidth="md"
    >
      <Box>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Autocomplete
              freeSolo
              fullWidth
              options={medicationSuggestions}
              onInputChange={handleMedicationSearch}
              value={medicationForm.name}
              onChange={(event, newValue) => {
                handleMedicationFormChange({
                  target: { name: "name", value: newValue || "" },
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  fullWidth
                  id="name"
                  label="Medication Name"
                  name="name"
                  onChange={handleMedicationFormChange}
                  sx={{ width: "100%" }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              id="dosage"
              label="Dosage"
              name="dosage"
              value={medicationForm.dosage}
              onChange={handleMedicationFormChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              id="frequency"
              label="Frequency"
              name="frequency"
              value={medicationForm.frequency}
              onChange={handleMedicationFormChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              id="startDate"
              label="Start Date"
              name="startDate"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={medicationForm.startDate}
              onChange={handleMedicationFormChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="prescribingDoctor"
              label="Prescribing Doctor"
              name="prescribingDoctor"
              value={medicationForm.prescribingDoctor}
              onChange={handleMedicationFormChange}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
              Notes
            </Typography>
            <RichTextInput
              value={medicationNotesData}
              onDataChange={setMedicationNotesData}
              placeholder="Add notes about this medication, timing, or #tags"
            />
          </Grid>
        </Grid>
      </Box>
    </LogFormShell>
  );
};

export default AddEditMedicationModal;
