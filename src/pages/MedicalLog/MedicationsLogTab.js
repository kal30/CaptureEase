import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Box, Typography, Button, List, ListItem, ListItemText, Modal, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Autocomplete, Grid, FormControlLabel, Checkbox, Snackbar, Alert, Menu, MenuItem, ListItemIcon, Divider, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles'; // Import useTheme
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined';
import { auth, db } from '../../services/firebase';
import AddEditMedicationModal from '../../components/Medications/AddEditMedicationModal';
import { addMedication, fetchMedications, updateMedication, deleteMedication } from '../../services/medicationService';
import { searchMedications } from '../../services/drugService';
import { addSideEffect, fetchSideEffects, updateSideEffect, deleteSideEffect } from '../../services/sideEffectService';
import BulkMedicationLogDialog from './components/BulkMedicationLogDialog';
import MedicationSideEffectDialog from './components/MedicationSideEffectDialog';
import { uploadIncidentMedia } from '../../components/Dashboard/Incidents/Media/mediaUploadService';

const MedicationsLogTab = ({ childId, childName, initialShowArchived = false }) => {
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
  const [medicationNotesData, setMedicationNotesData] = useState({ text: '', mediaFile: null, audioBlob: null });
  const [medicationSuggestions, setMedicationSuggestions] = useState([]);
  const [doseLogMap, setDoseLogMap] = useState({});

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

  

  const [showArchived, setShowArchived] = useState(Boolean(initialShowArchived));
  const activeMedications = medications.filter((med) => !med.isArchived);

  useEffect(() => {
    setShowArchived(Boolean(initialShowArchived));
  }, [initialShowArchived]);

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

  useEffect(() => {
    const loadDoseLogs = async () => {
      if (!childId) {
        setDoseLogMap({});
        return;
      }

      try {
        const q = query(
          collection(db, 'dailyLogs'),
          where('childId', '==', childId),
          where('category', '==', 'medication'),
          where('source', '==', 'medication_log')
        );
        const snapshot = await getDocs(q);
        const nextMap = {};
        const todayKey = new Date().toDateString();
        snapshot.forEach((logDoc) => {
          const data = logDoc.data() || {};
          const medicationId = data.medicationId;
          if (!medicationId) return;
          if (data.entryDate !== todayKey) return;

          const currentTimestamp = data.timestamp?.toDate?.() || new Date(data.timestamp || 0);
          const existing = nextMap[medicationId];
          const existingTimestamp = existing?.timestamp?.toDate?.() || new Date(existing?.timestamp || 0);

          if (!existing || currentTimestamp > existingTimestamp) {
            nextMap[medicationId] = { id: logDoc.id, ...data };
          }
        });
        setDoseLogMap(nextMap);
      } catch (error) {
        console.error('Error loading medication dose logs:', error);
      }
    };

    loadDoseLogs();
  }, [childId]);

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
    setMedicationNotesData({ text: '', mediaFile: null, audioBlob: null });
  };

  const handleOpenBulkLogDialog = () => {
    setShowBulkLogDialog(true);
  };

  const handleCloseBulkLogDialog = () => {
    setShowBulkLogDialog(false);
  };

  const handleOpenEditMedicationForm = (med) => {
    setEditingMedicationId(med.id);
    setMedicationForm({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      startDate: med.startDate,
      prescribingDoctor: med.prescribingDoctor,
      notes: med.notes,
    });
    setMedicationNotesData({
      text: med.notes || '',
      mediaFile: null,
      audioBlob: null,
    });
  };

  const handleCloseMedicationForm = () => {
    setShowForm(false);
    setEditingMedicationId(null);
    setMedicationForm({
      name: '',
      dosage: '',
      frequency: '',
      startDate: '',
      prescribingDoctor: '',
      notes: '',
    });
    setMedicationNotesData({ text: '', mediaFile: null, audioBlob: null });
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
    const notesText = medicationNotesData?.text || '';
    let mediaUrls = [];

    if (editingMedicationId) {
      await updateMedication(editingMedicationId, {
        ...medicationForm,
        notes: notesText,
      });

      if (medicationNotesData?.mediaFile || medicationNotesData?.audioBlob) {
        const uploadedRichMedia = await uploadIncidentMedia(
          medicationNotesData?.mediaFile,
          medicationNotesData?.audioBlob,
          editingMedicationId,
          `medications/${childId}/${editingMedicationId}`
        );
        mediaUrls = (uploadedRichMedia || []).map((item) => item.url).filter(Boolean);
        if (mediaUrls.length > 0) {
          await updateMedication(editingMedicationId, { mediaUrls });
        }
      }

      setMedications((prevMedications) =>
        prevMedications.map((med) =>
          med.id === editingMedicationId
            ? { ...med, ...medicationForm, notes: notesText, ...(mediaUrls.length > 0 ? { mediaUrls } : {}) }
            : med
        )
      );
      handleCloseMedicationForm();
    } else {
      const newMedicationId = await addMedication({
        ...medicationForm,
        notes: notesText,
        childId,
        createdBy: user?.uid,
        createdAt: serverTimestamp(),
        isArchived: false,
      });

      if (medicationNotesData?.mediaFile || medicationNotesData?.audioBlob) {
        const uploadedRichMedia = await uploadIncidentMedia(
          medicationNotesData?.mediaFile,
          medicationNotesData?.audioBlob,
          newMedicationId,
          `medications/${childId}/${newMedicationId}`
        );
        mediaUrls = (uploadedRichMedia || []).map((item) => item.url).filter(Boolean);
        if (mediaUrls.length > 0) {
          await updateMedication(newMedicationId, { mediaUrls });
        }
      }

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
          notes: notesText,
          childId,
          createdBy: user?.uid,
          createdAt: new Date(),
          isArchived: false,
          sideEffects: [],
          ...(mediaUrls.length > 0 ? { mediaUrls } : {}),
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
      setMedicationNotesData({ text: '', mediaFile: null, audioBlob: null });
      setRecentlySavedMedicationId(newMedicationId);
      setSnackbarMessage(`${medicationForm.name || 'Medication'} saved`);
      setShowSnackbar(true);
      handleCloseMedicationForm();
    }
  };

  const handleToggleDose = async (medication) => {
    const existingDose = doseLogMap[medication.id] || null;
    if (existingDose?.id) {
      await updateDoc(doc(db, 'dailyLogs', existingDose.id), {
        status: 'deleted',
      });
      setDoseLogMap((prev) => {
        const next = { ...prev };
        delete next[medication.id];
        return next;
      });
      setSnackbarMessage(`${medication.name} unchecked for today`);
      setShowSnackbar(true);
      return;
    }

    const doseTimestamp = new Date();
    const medicationText = `Gave ${medication.name} ${medication.dosage || ''}`.trim();

    const docData = {
      childId,
      createdBy: user?.uid,
      createdAt: serverTimestamp(),
      text: medicationText,
      status: 'active',
      category: 'medication',
      medicationId: medication.id,
      timestamp: doseTimestamp,
      entryDate: doseTimestamp.toDateString(),
      authorId: user?.uid,
      authorName: user?.displayName || user?.email?.split('@')[0] || 'User',
      authorEmail: user?.email,
      notes: '',
      source: 'medication_log',
    };

    const docRef = await addDoc(collection(db, 'dailyLogs'), docData);
    setDoseLogMap((prev) => ({
      ...prev,
      [medication.id]: { id: docRef.id, ...docData },
    }));
    setSnackbarMessage(`${medication.name} checked for today`);
    setShowSnackbar(true);
  };

  const handleDeleteMedication = async (medicationId) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      await deleteMedication(medicationId);
      const fetchedMedications = await fetchMedications(childId);
      setMedications(fetchedMedications || []);
      setSnackbarMessage('Medication deleted');
      setShowSnackbar(true);
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
            Log today&apos;s doses
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

      <AddEditMedicationModal
        open={Boolean(showForm)}
        onClose={handleCloseMedicationForm}
        childName={childName}
        medicationForm={medicationForm}
        medicationNotesData={medicationNotesData}
        handleMedicationFormChange={handleMedicationFormChange}
        setMedicationNotesData={setMedicationNotesData}
        handleMedicationSubmit={handleMedicationSubmit}
        handleCancelEdit={handleCloseMedicationForm}
        editingMedicationId={editingMedicationId}
        medicationSuggestions={medicationSuggestions}
        handleMedicationSearch={handleMedicationSearch}
      />

      {medications.length > 0 ? (
        <List>
          {medications.map((med) => (
            <React.Fragment key={med.id}>
              <Box
                sx={{
                  mb: 1.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: recentlySavedMedicationId === med.id ? 'primary.main' : 'divider',
                  bgcolor: recentlySavedMedicationId === med.id ? 'rgba(25, 118, 210, 0.04)' : 'background.paper',
                  boxShadow: recentlySavedMedicationId === med.id ? '0 8px 20px rgba(25, 118, 210, 0.12)' : 'none',
                  opacity: med.isArchived ? 0.6 : 1,
                  p: { xs: 1.75, sm: 2 },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    alignItems: { xs: 'stretch', sm: 'flex-start' },
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {editingMedicationId === med.id ? (
                      <Grid container spacing={1.5}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Medication Name"
                            name="name"
                            value={medicationForm.name}
                            onChange={handleMedicationFormChange}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Dosage"
                            name="dosage"
                            value={medicationForm.dosage}
                            onChange={handleMedicationFormChange}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Frequency"
                            name="frequency"
                            value={medicationForm.frequency}
                            onChange={handleMedicationFormChange}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
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
                            label="Prescribing Doctor"
                            name="prescribingDoctor"
                            value={medicationForm.prescribingDoctor}
                            onChange={handleMedicationFormChange}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Notes"
                            name="notes"
                            multiline
                            rows={2}
                            value={medicationForm.notes}
                            onChange={handleMedicationFormChange}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Button
                              variant="contained"
                              onClick={handleMedicationSubmit}
                            >
                              Save
                            </Button>
                            <Button
                              variant="outlined"
                              onClick={handleCloseMedicationForm}
                            >
                              Cancel
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    ) : (
                      <>
                        <Typography
                          variant="subtitle1"
                          component="span"
                          sx={{ fontWeight: 700, color: theme.palette.primary.main, display: 'block', mb: 1 }}
                        >
                          {med.name}
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="body2" color="text.primary"><strong>Dosage:</strong> {med.dosage}</Typography>
                          <Typography variant="body2" color="text.primary"><strong>Frequency:</strong> {med.frequency}</Typography>
                          <Typography variant="body2" color="text.primary"><strong>Doctor:</strong> {med.prescribingDoctor}</Typography>
                          {med.startDate && <Typography variant="body2" color="text.primary"><strong>Start Date:</strong> {med.startDate}</Typography>}
                          {med.notes && <Typography variant="body2" color="text.primary"><strong>Notes:</strong> {med.notes}</Typography>}
                        </Box>
                      </>
                    )}
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: { xs: 'space-between', sm: 'flex-end' },
                      gap: 1,
                      minWidth: { sm: 240 },
                      flexWrap: 'wrap',
                    }}
                  >
                    <Tooltip title={doseLogMap[med.id] ? 'Undo today dose' : 'Mark dose given today'} arrow>
                      <IconButton
                        aria-label={doseLogMap[med.id] ? 'uncheck dose' : 'check dose'}
                        onClick={() => handleToggleDose(med)}
                        sx={{
                          border: '1.5px solid',
                          borderColor: doseLogMap[med.id] ? 'success.main' : 'primary.main',
                          borderRadius: 1,
                          color: doseLogMap[med.id] ? 'success.main' : 'primary.main',
                          bgcolor: doseLogMap[med.id] ? 'rgba(46, 125, 50, 0.08)' : 'background.paper',
                          width: 44,
                          height: 44,
                          flexShrink: 0,
                        }}
                      >
                        {doseLogMap[med.id] ? (
                          <CheckCircleIcon fontSize="small" />
                        ) : (
                          <RadioButtonUncheckedIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                    <IconButton
                      aria-label="more"
                      onClick={(event) => handleMenuOpen(event, med)}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        bgcolor: 'background.paper',
                        flexShrink: 0,
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
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

      <BulkMedicationLogDialog
        open={showBulkLogDialog}
        childId={childId}
        childName={childName}
        medications={activeMedications}
        user={user}
        onClose={handleCloseBulkLogDialog}
        onSaved={({ medicationName, time }) => {
          setSnackbarMessage(
            medicationName
              ? `${medicationName}${time ? ` logged for ${time}` : ' logged'}`
              : 'Medication dose logged'
          );
          setShowSnackbar(true);
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
