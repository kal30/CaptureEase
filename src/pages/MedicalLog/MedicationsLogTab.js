import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, List, ListItem, ListItemText, Modal, TextField, IconButton, Autocomplete, Collapse, Grid } from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Rating from '../../components/UI/Rating';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { addMedication, fetchMedications, updateMedication, deleteMedication } from '../../services/medicationService';
import { searchMedications } from '../../services/drugService';
import { addSideEffect, fetchSideEffects, deleteSideEffect } from '../../services/sideEffectService';

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

const MedicationsLogTab = ({ childId }) => {
  const [medications, setMedications] = useState([]);
  const [editingMedicationId, setEditingMedicationId] = useState(null);
  const [medicationForm, setMedicationForm] = useState({
    name: '',
    dosage: '',
    frequency: '',
    startDate: '',
    prescribingDoctor: '',
    notes: '',
  });
  const [medicationSuggestions, setMedicationSuggestions] = useState([]);
  const [expandedMedicationId, setExpandedMedicationId] = useState(null);

  const [openAddSideEffectModal, setOpenAddSideEffectModal] = useState(false);
  const [currentSideEffectMedicationId, setCurrentSideEffectMedicationId] = useState(null);
  const [sideEffectForm, setSideEffectForm] = useState({
    date: '',
    description: '',
    severity: 0,
  });

  useEffect(() => {
    const loadMedications = async () => {
      const fetchedMedications = await fetchMedications(childId);
      setMedications(fetchedMedications);
    };
    loadMedications();
  }, [childId]);

  const handleMedicationSearch = async (event, value) => {
    if (value && value.length > 2) {
      const suggestions = await searchMedications(value);
      setMedicationSuggestions(suggestions);
    } else {
      setMedicationSuggestions([]);
    }
  };

  const handleEditMedication = (med) => {
    setEditingMedicationId(med.id);
    setMedicationForm({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      startDate: med.startDate,
      prescribingDoctor: med.prescribingDoctor,
      notes: med.notes,
    });
  };

  const handleCancelEdit = () => {
    setEditingMedicationId(null);
    setMedicationForm({
      name: '',
      dosage: '',
      frequency: '',
      startDate: '',
      prescribingDoctor: '',
      notes: '',
    });
  };

  const handleMedicationFormChange = (e) => {
    const { name, value } = e.target;
    setMedicationForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMedicationSubmit = async () => {
    if (editingMedicationId) {
      await updateMedication(editingMedicationId, medicationForm);
      handleCancelEdit(); // For editing, still clear and reset
    } else {
      await addMedication({ ...medicationForm, childId });
      // For adding, clear the form but keep it ready for next entry
      setMedicationForm({
        name: '',
        dosage: '',
        frequency: '',
        startDate: '',
        prescribingDoctor: '',
        notes: '',
      });
    }
    const fetchedMedications = await fetchMedications(childId);
    setMedications(fetchedMedications);
  };

  const handleDeleteMedication = async (medicationId) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      await deleteMedication(medicationId);
      const fetchedMedications = await fetchMedications(childId);
      setMedications(fetchedMedications);
    }
  };

  const handleToggleExpand = async (medicationId) => {
    setExpandedMedicationId(expandedMedicationId === medicationId ? null : medicationId);
    if (expandedMedicationId !== medicationId) {
      // Fetch side effects when expanding
      const fetchedSideEffects = await fetchSideEffects(medicationId);
      setMedications((prevMedications) =>
        prevMedications.map((med) =>
          med.id === medicationId ? { ...med, sideEffects: fetchedSideEffects } : med
        )
      );
    }
  };

  const handleOpenAddSideEffectModal = (medicationId) => {
    setCurrentSideEffectMedicationId(medicationId);
    setSideEffectForm({
      date: new Date().toISOString().split('T')[0], // Default to today's date
      description: '',
      severity: 0,
    });
    setOpenAddSideEffectModal(true);
  };

  const handleCloseAddSideEffectModal = () => {
    setOpenAddSideEffectModal(false);
    setCurrentSideEffectMedicationId(null);
  };

  const handleSideEffectFormChange = (e) => {
    const { name, value } = e.target;
    setSideEffectForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSideEffectSeverityChange = (event, newValue) => {
    setSideEffectForm((prev) => ({
      ...prev,
      severity: newValue,
    }));
  };

  const handleAddSideEffectSubmit = async () => {
    await addSideEffect({ ...sideEffectForm, medicationId: currentSideEffectMedicationId });
    // Refresh side effects for the expanded medication
    const fetchedSideEffects = await fetchSideEffects(currentSideEffectMedicationId);
    setMedications((prevMedications) =>
      prevMedications.map((med) =>
        med.id === currentSideEffectMedicationId ? { ...med, sideEffects: fetchedSideEffects } : med
      )
    );
    handleCloseAddSideEffectModal();
  };

  const handleDeleteSideEffect = async (sideEffectId, medicationId) => {
    if (window.confirm('Are you sure you want to delete this side effect?')) {
      await deleteSideEffect(sideEffectId);
      const fetchedSideEffects = await fetchSideEffects(medicationId);
      setMedications((prevMedications) =>
        prevMedications.map((med) =>
          med.id === medicationId ? { ...med, sideEffects: fetchedSideEffects } : med
        )
      );
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Medications</Typography>

      <Box sx={{ mb: 3, p: 2, borderRadius: '8px', boxShadow: 1 }}>
        <Typography variant="subtitle1" gutterBottom>
          {editingMedicationId ? 'Edit Medication' : 'Add New Medication'}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Autocomplete
              freeSolo
              options={medicationSuggestions}
              onInputChange={handleMedicationSearch}
              value={medicationForm.name}
              onChange={(event, newValue) => {
                setMedicationForm((prev) => ({ ...prev, name: newValue || '' }));
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
            <TextField
              margin="normal"
              fullWidth
              id="notes"
              label="Notes"
              name="notes"
              multiline
              rows={1}
              value={medicationForm.notes}
              onChange={handleMedicationFormChange}
            />
          </Grid>
        </Grid>
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button
            type="submit"
            variant="contained"
            onClick={handleMedicationSubmit}
          >
            {editingMedicationId ? 'Update Medication' : 'Add Medication'}
          </Button>
          {editingMedicationId ? (
            <Button
              variant="outlined"
              onClick={handleCancelEdit}
            >
              Cancel
            </Button>
          ) : (
            <Button
              variant="outlined"
              onClick={handleCancelEdit}
            >
              Done
            </Button>
          )}
        </Box>
      </Box>

      <List>
        {medications.map((med) => (
          <React.Fragment key={med.id}>
            <ListItem
              secondaryAction={
                <>
                  <IconButton edge="end" aria-label="edit" onClick={() => handleEditMedication(med)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteMedication(med.id)}>
                    <DeleteIcon />
                  </IconButton>
                </>
              }
            >
              <ListItemText
                primary={med.name}
                secondary={`Dosage: ${med.dosage}, Frequency: ${med.frequency}, Doctor: ${med.prescribingDoctor}`}
              />
              <IconButton onClick={() => handleToggleExpand(med.id)}>
                {expandedMedicationId === med.id ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </ListItem>
            <Collapse in={expandedMedicationId === med.id} timeout="auto" unmountOnExit>
              <Box sx={{ pl: 4, pb: 2 }}>
                <Typography variant="subtitle1" sx={{ mt: 2 }}>Side Effects:</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenAddSideEffectModal(med.id)}
                  sx={{ mb: 1 }}
                >
                  Add Side Effect
                </Button>
                <List dense>
                  {med.sideEffects && med.sideEffects.length > 0 ? (
                    med.sideEffects.map((se) => (
                      <ListItem
                        key={se.id}
                        secondaryAction={
                          <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteSideEffect(se.id, med.id)}>
                            <DeleteIcon />
                          </IconButton>
                        }
                      >
                        <ListItemText
                          primary={`${se.date}: ${se.description}`}
                          secondary={<Rating value={se.severity} readOnly />}
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary">No side effects recorded.</Typography>
                  )}
                </List>
              </Box>
            </Collapse>
          </React.Fragment>
        ))}
      </List>

      {/* Add Side Effect Modal */}
      <Modal
        open={openAddSideEffectModal}
        onClose={handleCloseAddSideEffectModal}
        aria-labelledby="add-side-effect-title"
        aria-describedby="add-side-effect-description"
      >
        <Box sx={style}>
          <Typography id="add-side-effect-title" variant="h6" component="h2">
            Add Side Effect
          </Typography>
          <TextField
            margin="normal"
            required
            fullWidth
            id="sideEffectDate"
            label="Date"
            name="date"
            type="date"
            InputLabelProps={{
              shrink: true,
            }}
            value={sideEffectForm.date}
            onChange={handleSideEffectFormChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="sideEffectDescription"
            label="Description"
            name="description"
            multiline
            rows={3}
            value={sideEffectForm.description}
            onChange={handleSideEffectFormChange}
          />
          <Typography component="legend" sx={{ mt: 2 }}>Severity</Typography>
          <Rating
            name="severity"
            value={sideEffectForm.severity}
            onChange={handleSideEffectSeverityChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleAddSideEffectSubmit}
          >
            Add Side Effect
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default MedicationsLogTab;