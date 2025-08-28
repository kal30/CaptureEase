import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, List, ListItem, ListItemText, Modal, TextField, IconButton, Autocomplete, Grid, FormControlLabel, Checkbox } from '@mui/material';
import { useTheme } from '@mui/material/styles'; // Import useTheme
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import Rating from '../../components/UI/Rating';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { addMedication, fetchMedications, updateMedication, deleteMedication } from '../../services/medicationService';
import { searchMedications } from '../../services/drugService';
import { addSideEffect, fetchSideEffects, updateSideEffect, deleteSideEffect } from '../../services/sideEffectService';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 2,
};

const MedicationsLogTab = ({ childId }) => {
  const theme = useTheme(); // Get theme object
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

  const [openAddSideEffectModal, setOpenAddSideEffectModal] = useState(false);
  const [currentSideEffectMedicationId, setCurrentSideEffectMedicationId] = useState(null);
  const [editingSideEffectId, setEditingSideEffectId] = useState(null);
  const [sideEffectForm, setSideEffectForm] = useState({
    date: '',
    description: '',
    severity: 0,
    duration: '',
  });

  

  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    const loadMedications = async () => {
      const fetchedMedications = await fetchMedications(childId, showArchived);
      setMedications(fetchedMedications || []);
    };
    loadMedications();
  }, [childId, showArchived]);

  const handleMedicationSearch = async (event, value) => {
    if (value && value.length > 2) {
      const suggestions = await searchMedications(value);
      setMedicationSuggestions(suggestions || []);
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
      setMedications((prevMedications) =>
        prevMedications.map((med) =>
          med.id === editingMedicationId ? { ...med, ...medicationForm } : med
        )
      );
      handleCancelEdit();
    } else {
      const newMedicationId = await addMedication({ ...medicationForm, childId });
      setMedications((prevMedications) => [
        ...prevMedications,
        { id: newMedicationId, ...medicationForm, childId, isArchived: false, sideEffects: [] },
      ]);
      setMedicationForm({
        name: '',
        dosage: '',
        frequency: '',
        startDate: '',
        prescribingDoctor: '',
        notes: '',
      });
    }
  };

  const handleDeleteMedication = async (medicationId) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      await deleteMedication(medicationId);
      const fetchedMedications = await fetchMedications(childId);
      setMedications(fetchedMedications || []);
    }
  };

  const handleArchiveMedication = async (medicationId, isArchived) => {
    await updateMedication(medicationId, { isArchived });
    const fetchedMedications = await fetchMedications(childId);
    setMedications(fetchedMedications || []);
  };

  

  const handleOpenAddSideEffectModal = (medicationId, sideEffect = null) => {
    setCurrentSideEffectMedicationId(medicationId);
    if (sideEffect) {
      setEditingSideEffectId(sideEffect.id);
      setSideEffectForm({
        date: sideEffect.date,
        description: sideEffect.description,
        severity: sideEffect.severity,
        duration: sideEffect.duration,
        timeOfDay: sideEffect.timeOfDay || '',
      });
    } else {
      setEditingSideEffectId(null);
      setSideEffectForm({
        date: new Date().toISOString().split('T')[0], // Default to today's date
        description: '',
        severity: 0,
        duration: '',
        timeOfDay: '',
      });
    }
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

  const handleEditSideEffect = (sideEffect, medicationId) => {
    setCurrentSideEffectMedicationId(medicationId);
    setEditingSideEffectId(sideEffect.id);
    setSideEffectForm({
      date: sideEffect.date,
      description: sideEffect.description,
      severity: sideEffect.severity,
      duration: sideEffect.duration,
      timeOfDay: sideEffect.timeOfDay || '',
    });
    setOpenAddSideEffectModal(true);
  };

  const handleAddSideEffectSubmit = async () => {
    if (!currentSideEffectMedicationId) {
      alert('Please select a medication for the side effect.');
      return;
    }
    if (editingSideEffectId) {
      await updateSideEffect(editingSideEffectId, { ...sideEffectForm, medicationId: currentSideEffectMedicationId });
    } else {
      await addSideEffect({ ...sideEffectForm, medicationId: currentSideEffectMedicationId });
    }
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

      <Box sx={{ mb: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <FormControlLabel
          control={<Checkbox checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />}
          label="Show Archived"
          sx={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenAddSideEffectModal(null)} // Pass null to indicate new side effect from main view
        >
          Add Side Effect
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCancelEdit}
        >
          Add New Medication
        </Button>
      </Box>

      <Box sx={{ mb: 3, p: 2, borderRadius: '8px', boxShadow: 1, maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="subtitle1" gutterBottom>
          {editingMedicationId ? 'Edit Medication' : 'Add New Medication'}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12} sx={{ width: '100%' }}>
            <Autocomplete
              freeSolo
              fullWidth
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
                  sx={{ minWidth: '400px' }}
                />
              )}
              sx={{ width: '100%' }}
            />
          </Grid>
          <Grid item xs={12}>
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
          <Grid item xs={12}>
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
              sx={{ width: '100%' }}
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
              sx={{ opacity: med.isArchived ? 0.6 : 1 }}
              secondaryAction={
                <>
                  <IconButton edge="end" aria-label="archive" onClick={() => handleArchiveMedication(med.id, !med.isArchived)}>
                    {med.isArchived ? <UnarchiveIcon /> : <ArchiveIcon />}
                  </IconButton>
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
                primary={<Typography variant="subtitle1" component="span" sx={{ fontWeight: 'bold', mb: 3, color: theme.palette.primary.main }}>{med.name}</Typography>}
                secondary={
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.primary"><strong>Dosage:</strong> {med.dosage}</Typography>
                    <Typography variant="body2" color="text.primary"><strong>Frequency:</strong> {med.frequency}</Typography>
                    <Typography variant="body2" color="text.primary"><strong>Doctor:</strong> {med.prescribingDoctor}</Typography>
                    {med.startDate && <Typography variant="body2" color="text.primary"><strong>Start Date:</strong> {med.startDate}</Typography>}
                    {med.notes && <Typography variant="body2" color="text.primary"><strong>Notes:</strong> {med.notes}</Typography>}
                  </Box>
                }
              />
            </ListItem>
            <Box sx={{ p: 2, bgcolor: '#E0F2F1', borderRadius: '8px', mt: 2 }}>
              <Typography variant="subtitle1" sx={{ mt: 0 }}>Side Effects:</Typography>
              
              <List dense>
                {med.sideEffects && med.sideEffects.length > 0 ? (
                  med.sideEffects.map((se) => (
                    <ListItem
                      key={se.id}
                      secondaryAction={
                        <>
                          <IconButton edge="end" aria-label="edit" onClick={() => handleEditSideEffect(se, med.id)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteSideEffect(se.id, med.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </>
                      }
                    >
                      <ListItemText
                        primary={`${se.date}: ${se.description}`}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">Duration: {se.duration}</Typography>
                            <Typography variant="body2" color="text.secondary">Severity: {se.severity}</Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary">No side effects recorded.</Typography>
                )}
              </List>
            </Box>
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
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Autocomplete
                options={medications}
                getOptionLabel={(option) => option.name}
                value={medications.find(med => med.id === currentSideEffectMedicationId) || null}
                onChange={(event, newValue) => {
                  setCurrentSideEffectMedicationId(newValue ? newValue.id : null);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    margin="normal"
                    required
                    fullWidth
                    label="Select Medication"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
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
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="sideEffectDescription"
                label="Description"
                name="description"
                multiline
                rows={2}
                value={sideEffectForm.description}
                onChange={handleSideEffectFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Rating
                severity={sideEffectForm.severity}
                setSeverity={(newValue) => handleSideEffectSeverityChange(null, newValue)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="normal"
                fullWidth
                id="sideEffectDuration"
                label="Duration (e.g., 2 hours, all day)"
                name="duration"
                value={sideEffectForm.duration}
                onChange={handleSideEffectFormChange}
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleAddSideEffectSubmit}
          >
            {editingSideEffectId ? 'Update Side Effect' : 'Add Side Effect'}
          </Button>
          {editingSideEffectId && (
            <Button
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
              onClick={handleCloseAddSideEffectModal}
            >
              Cancel
            </Button>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default MedicationsLogTab;
