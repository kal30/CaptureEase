import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Box, Typography, Button, List, ListItem, ListItemText, Modal, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Autocomplete, Grid, FormControlLabel, Checkbox, Snackbar, Alert, Menu, MenuItem, ListItemIcon, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles'; // Import useTheme
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined';
import { auth, db } from '../../services/firebase';
import { addMedication, fetchMedications, updateMedication, deleteMedication } from '../../services/medicationService';
import { searchMedications } from '../../services/drugService';
import { addSideEffect, fetchSideEffects, updateSideEffect, deleteSideEffect } from '../../services/sideEffectService';
import BulkMedicationLogDialog from './components/BulkMedicationLogDialog';
import MedicationSideEffectDialog from './components/MedicationSideEffectDialog';

const MedicationsLogTab = ({ childId, childName }) => {
  const theme = useTheme(); // Get theme object
  const [user] = useAuthState(auth);
  const [medications, setMedications] = useState([]);
  const [editingMedicationId, setEditingMedicationId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showBulkLogDialog, setShowBulkLogDialog] = useState(false);
  const [recentlySavedMedicationId, setRecentlySavedMedicationId] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuMedication, setMenuMedication] = useState(null);
  const [medicationForm, setMedicationForm] = useState({
    name: '',
    dosage: '',
    frequency: '',
    startDate: '',
    prescribingDoctor: '',
    notes: '',
  });
  const [medicationSuggestions, setMedicationSuggestions] = useState([]);
  const [doseModalMedication, setDoseModalMedication] = useState(null);
  const [doseForm, setDoseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    timeGiven: new Date().toTimeString().slice(0, 5),
    notes: '',
  });

  const [openAddSideEffectModal, setOpenAddSideEffectModal] = useState(false);
  const [currentSideEffectMedicationId, setCurrentSideEffectMedicationId] = useState(null);
  const [editingSideEffectId, setEditingSideEffectId] = useState(null);
  const [sideEffectForm, setSideEffectForm] = useState({
    date: '',
    description: '',
    notes: '',
    severity: 0,
    duration: '',
    timeOfDay: '',
  });

  

  const [showArchived, setShowArchived] = useState(false);
  const activeMedications = medications.filter((med) => !med.isArchived);

  useEffect(() => {
    const loadMedications = async () => {
      const fetchedMedications = await fetchMedications(childId, showArchived);
      const medicationsWithSideEffects = await Promise.all(
        (fetchedMedications || []).map(async (med) => ({
          ...med,
          sideEffects: await fetchSideEffects(childId, med.id),
        }))
      );
      setMedications(medicationsWithSideEffects);
    };
    loadMedications();
  }, [childId, showArchived]);

  useEffect(() => {
    if (!recentlySavedMedicationId) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setRecentlySavedMedicationId(null);
    }, 2400);

    return () => window.clearTimeout(timer);
  }, [recentlySavedMedicationId]);

  const getCurrentTimeValue = () => new Date().toTimeString().slice(0, 5);

  const getTodayDateValue = () => new Date().toISOString().split('T')[0];

  const buildTimestampFromDateAndTime = (dateValue, timeValue) => {
    const [year, month, day] = (dateValue || getTodayDateValue()).split('-').map((value) => Number(value));
    const [hours, minutes] = (timeValue || getCurrentTimeValue()).split(':').map((value) => Number(value));

    if ([year, month, day, hours, minutes].some((value) => Number.isNaN(value))) {
      return new Date();
    }

    return new Date(year, month - 1, day, hours, minutes, 0, 0);
  };

  const handleOpenNewMedicationForm = () => {
    setDoseModalMedication(null);
    setShowForm(true);
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

  const handleOpenBulkLogDialog = () => {
    setShowBulkLogDialog(true);
  };

  const handleCloseBulkLogDialog = () => {
    setShowBulkLogDialog(false);
  };

  const handleOpenEditMedicationForm = (med) => {
    setDoseModalMedication(null);
    setShowForm(true);
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

  const handleCloseMedicationForm = () => {
    setShowForm(false);
    setEditingMedicationId(null);
    setDoseModalMedication(null);
    setMedicationForm({
      name: '',
      dosage: '',
      frequency: '',
      startDate: '',
      prescribingDoctor: '',
      notes: '',
    });
  };

  const handleMedicationSearch = async (event, value) => {
    if (value && value.length > 2) {
      const suggestions = await searchMedications(value);
      setMedicationSuggestions(suggestions || []);
    } else {
      setMedicationSuggestions([]);
    }
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
      handleCloseMedicationForm();
    } else {
      const newMedicationId = await addMedication({
        ...medicationForm,
        childId,
        createdBy: user?.uid,
        createdAt: serverTimestamp(),
        isArchived: false,
      });
      const startedAt = new Date();
      const milestoneText = `Started ${medicationForm.name} ${medicationForm.dosage || ''}`.trim();
      const milestoneRef = await addDoc(collection(db, 'dailyLogs'), {
        childId,
        createdBy: user?.uid,
        createdAt: serverTimestamp(),
        text: milestoneText,
        status: 'active',
        category: 'milestone',
        tags: ['medication', 'new-medication'],
        timestamp: startedAt,
        entryDate: startedAt.toDateString(),
        authorId: user?.uid,
        authorName: user?.displayName || user?.email?.split('@')[0] || 'User',
        authorEmail: user?.email,
        source: 'medication_started',
      });
      window.dispatchEvent(new CustomEvent('captureez:timeline-entry-created', {
        detail: {
          id: milestoneRef.id,
          collection: 'dailyLogs',
          childId,
          text: milestoneText,
          status: 'active',
          category: 'milestone',
          tags: ['medication', 'new-medication'],
          timestamp: startedAt,
          entryDate: startedAt.toDateString(),
          authorId: user?.uid,
          authorName: user?.displayName || user?.email?.split('@')[0] || 'User',
          authorEmail: user?.email,
          source: 'medication_started',
        },
      }));
      setMedications((prevMedications) => [
        ...prevMedications,
        {
          id: newMedicationId,
          ...medicationForm,
          childId,
          createdBy: user?.uid,
          createdAt: new Date(),
          isArchived: false,
          sideEffects: [],
        },
      ]);
      setMedicationForm({
        name: '',
        dosage: '',
        frequency: '',
        startDate: '',
        prescribingDoctor: '',
        notes: '',
      });
      setRecentlySavedMedicationId(newMedicationId);
      setSnackbarMessage(`${medicationForm.name || 'Medication'} saved`);
      setShowSnackbar(true);
      handleCloseMedicationForm();
    }
  };

  const handleOpenDoseForm = (medicationId) => {
    const medication = medications.find((med) => med.id === medicationId) || null;
    setDoseModalMedication(medication);
    setDoseForm({
      date: getTodayDateValue(),
      timeGiven: getCurrentTimeValue(),
      notes: '',
    });
  };

  const handleCloseDoseForm = () => {
    setDoseModalMedication(null);
    setDoseForm({
      date: getTodayDateValue(),
      timeGiven: getCurrentTimeValue(),
      notes: '',
    });
  };

  const handleDoseFormChange = (e) => {
    const { name, value } = e.target;
    setDoseForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogDose = async (medication) => {
    const doseTimestamp = buildTimestampFromDateAndTime(doseForm.date, doseForm.timeGiven);
    const doseNotes = doseForm.notes.trim();
    const medicationText = `Gave ${medication.name} ${medication.dosage || ''}`.trim();

    const docData = {
      childId,
      createdBy: user?.uid,
      createdAt: serverTimestamp(),
      text: medicationText,
      status: 'active',
      category: 'medication',
      timestamp: doseTimestamp,
      entryDate: doseTimestamp.toDateString(),
      authorId: user?.uid,
      authorName: user?.displayName || user?.email?.split('@')[0] || 'User',
      authorEmail: user?.email,
      notes: doseNotes,
      source: 'medication_log',
    };

    await addDoc(collection(db, 'dailyLogs'), docData);

    handleCloseDoseForm();
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
        notes: sideEffect.notes || '',
        severity: sideEffect.severity,
        duration: sideEffect.duration,
        timeOfDay: sideEffect.timeOfDay || '',
      });
    } else {
      setEditingSideEffectId(null);
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const defaultDateTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
      setSideEffectForm({
        date: defaultDateTime.slice(0, 10),
        description: '',
        notes: '',
        severity: 0,
        duration: '',
        timeOfDay: defaultDateTime.slice(11, 16),
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
      notes: sideEffect.notes || '',
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
    const currentMedication = medications.find((med) => med.id === currentSideEffectMedicationId) || null;
    const sideEffectPayload = {
      ...sideEffectForm,
      medicationId: currentSideEffectMedicationId,
      childId: currentMedication?.childId || childId,
      createdBy: user?.uid,
      createdAt: serverTimestamp(),
    };
    if (editingSideEffectId) {
      await updateSideEffect(editingSideEffectId, sideEffectPayload);
    } else {
      await addSideEffect(sideEffectPayload);
    }
    // Refresh side effects for the expanded medication
    const fetchedSideEffects = await fetchSideEffects(childId, currentSideEffectMedicationId);
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
      const fetchedSideEffects = await fetchSideEffects(childId, medicationId);
      setMedications((prevMedications) =>
        prevMedications.map((med) =>
          med.id === medicationId ? { ...med, sideEffects: fetchedSideEffects } : med
        )
      );
    }
  };

  const handleMenuOpen = (event, medication) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuMedication(medication);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuMedication(null);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Medications</Typography>

      <Box sx={{ mb: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        {activeMedications.length > 0 ? (
          <Button
            variant="outlined"
            startIcon={<MedicationOutlinedIcon />}
            onClick={handleOpenBulkLogDialog}
          >
            Log all medications for today
          </Button>
        ) : null}
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenNewMedicationForm}
        >
          Add New Medication
        </Button>
      </Box>

      {showForm || editingMedicationId ? (
        <Box sx={{ mb: 3, p: 2, borderRadius: 2, boxShadow: 1, border: '1px solid', borderColor: showForm ? 'primary.main' : 'divider', maxWidth: 1200, mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {editingMedicationId ? 'Edit Medication' : 'Add New Medication'}
            </Typography>
            <Button
              variant="outlined"
              onClick={showForm || editingMedicationId ? handleCloseMedicationForm : handleOpenNewMedicationForm}
            >
              {showForm || editingMedicationId ? 'Done' : 'Add New Medication'}
            </Button>
          </Box>
          <Box sx={{ mt: 2 }}>
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
                onClick={handleCloseMedicationForm}
              >
                Cancel
              </Button>
            ) : (
              <Button
                variant="outlined"
                onClick={handleCloseMedicationForm}
              >
                Done
              </Button>
            )}
          </Box>
          </Box>
        </Box>
      ) : null}

      {medications.length > 0 ? (
        <List>
          {medications.map((med) => (
            <React.Fragment key={med.id}>
              <ListItem
                sx={{
                  opacity: med.isArchived ? 0.6 : 1,
                  mb: 1.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: recentlySavedMedicationId === med.id ? 'primary.main' : 'divider',
                  bgcolor: recentlySavedMedicationId === med.id ? 'rgba(25, 118, 210, 0.04)' : 'background.paper',
                  boxShadow: recentlySavedMedicationId === med.id ? '0 8px 20px rgba(25, 118, 210, 0.12)' : 'none',
                }}
                secondaryAction={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleOpenDoseForm(med.id)}
                      sx={{
                        borderRadius: 0,
                        textTransform: 'none',
                        fontWeight: 600,
                        borderWidth: '1.5px',
                      }}
                    >
                      Log dose
                    </Button>
                    <IconButton
                      edge="end"
                      aria-label="more"
                      onClick={(event) => handleMenuOpen(event, med)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
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
              <Box sx={{ px: 2, pb: 2, mt: -1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>Side effects</Typography>
                
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
                          primary={`${new Date(se.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}: ${se.description}`}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">Duration: {se.duration}</Typography>
                              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    bgcolor: ['','#4caf50','#8bc34a','#ffc107','#ff9800','#f44336'][se.severity] || '#ccc',
                                  }}
                                />
                                <Typography variant="body2" color="text.secondary">
                                  Severity {se.severity}
                                </Typography>
                              </Box>
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
      ) : !showForm ? (
        <Box
          sx={{
            minHeight: 220,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            color: 'text.secondary',
            px: 2,
          }}
        >
          <Typography variant="body1">
            No medications added yet. Tap the button above to add one.
          </Typography>
        </Box>
      ) : null}

      {medications.length > 0 ? (
        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={<Checkbox checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />}
            label="Show Archived"
            sx={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}
          />
        </Box>
      ) : null}

      <Dialog
        open={Boolean(doseModalMedication)}
        onClose={handleCloseDoseForm}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {doseModalMedication
            ? `Log dose — ${doseModalMedication.name.charAt(0).toUpperCase() + doseModalMedication.name.slice(1)}`
            : 'Log dose'}
          {doseModalMedication ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {doseModalMedication.dosage}
              {doseModalMedication.frequency ? ` · ${doseModalMedication.frequency}` : ''}
            </Typography>
          ) : null}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Date"
                name="date"
                InputLabelProps={{ shrink: true }}
                value={doseForm.date}
                onChange={handleDoseFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="time"
                label="Time"
                name="timeGiven"
                InputLabelProps={{ shrink: true }}
                value={doseForm.timeGiven}
                onChange={handleDoseFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                placeholder="e.g. gave with food, refused half dose"
                multiline
                rows={2}
                value={doseForm.notes}
                onChange={handleDoseFormChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={handleCloseDoseForm}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => handleLogDose(doseModalMedication)}
            disabled={!doseModalMedication}
          >
            Save dose
          </Button>
        </DialogActions>
      </Dialog>

      <BulkMedicationLogDialog
        open={showBulkLogDialog}
        childId={childId}
        childName={childName}
        medications={activeMedications}
        user={user}
        onClose={handleCloseBulkLogDialog}
        onSaved={() => {
          handleCloseBulkLogDialog();
        }}
      />

      {/* Add Side Effect Modal */}
      <MedicationSideEffectDialog
        open={openAddSideEffectModal}
        medications={medications}
        medicationId={currentSideEffectMedicationId}
        setMedicationId={setCurrentSideEffectMedicationId}
        sideEffectForm={sideEffectForm}
        onChange={handleSideEffectFormChange}
        onSeverityChange={(newValue) => handleSideEffectSeverityChange(null, newValue)}
        onSubmit={handleAddSideEffectSubmit}
        onClose={handleCloseAddSideEffectModal}
        editingSideEffectId={editingSideEffectId}
      />

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            const medication = menuMedication;
            handleMenuClose();
            if (medication) {
              handleOpenAddSideEffectModal(medication.id);
            }
          }}
        >
          <ListItemIcon>
            <AddCommentOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Add Side Effect" />
        </MenuItem>

        {menuMedication ? (
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              const medication = menuMedication;
              handleMenuClose();
              handleArchiveMedication(medication.id, !medication.isArchived);
            }}
          >
            <ListItemIcon>
              {menuMedication.isArchived ? <UnarchiveIcon fontSize="small" /> : <ArchiveIcon fontSize="small" />}
            </ListItemIcon>
            <ListItemText primary={menuMedication.isArchived ? 'Unarchive' : 'Archive'} />
          </MenuItem>
        ) : null}

        {menuMedication ? <Divider /> : null}

        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            const medication = menuMedication;
            handleMenuClose();
            if (medication) {
              handleOpenEditMedicationForm(medication);
            }
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Edit" />
        </MenuItem>

        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            const medication = menuMedication;
            handleMenuClose();
            if (medication) {
              handleDeleteMedication(medication.id);
            }
          }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
      </Menu>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={2200}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setShowSnackbar(false)} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MedicationsLogTab;
