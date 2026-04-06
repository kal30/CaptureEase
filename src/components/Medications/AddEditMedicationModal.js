import React from "react";
import {
  Box,
  Typography,
  Button,
  Modal,
  TextField,
  Autocomplete,
  Grid,
} from "@mui/material";
import RichTextInput from "../UI/RichTextInput";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: '92vw', sm: 720, md: 900 },
  maxWidth: '92vw',
  maxHeight: '90vh',
  bgcolor: "background.paper",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 2,
  boxShadow: 24,
  p: 2,
  overflowY: 'auto',
};

const AddEditMedicationModal = ({
  open,
  onClose,
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
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="add-edit-medication-title"
      aria-describedby="add-edit-medication-description"
    >
      <Box sx={style}>
        <Typography id="add-edit-medication-title" variant="h6" component="h2">
          {editingMedicationId ? "Edit Medication" : "Add New Medication"}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12}>
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
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Medication Name"
                  name="name"
                  onChange={handleMedicationFormChange}
                  sx={{ width: '100%' }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              margin="normal"
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
              margin="normal"
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
              margin="normal"
              required
              fullWidth
              id="startDate"
              label="Start Date"
              name="startDate"
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
              value={medicationForm.startDate}
              onChange={handleMedicationFormChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              margin="normal"
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
        <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
          <Button
            type="submit"
            variant="contained"
            onClick={handleMedicationSubmit}
          >
            {editingMedicationId ? "Update Medication" : "Add Medication"}
          </Button>
          {editingMedicationId && (
            <Button variant="outlined" onClick={handleCancelEdit}>
              Cancel
            </Button>
          )}
          {!editingMedicationId && (
            <Button
              variant="outlined"
              onClick={onClose} // Use onClose for the Done button when adding new
            >
              Done
            </Button>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default AddEditMedicationModal;
