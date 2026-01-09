import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Divider,
  Button,
  Snackbar,
  Alert,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import {
  getMedications,
  addMedication,
  updateMedication,
  removeMedication,
  discontinueMedication,
} from '../../../services/medicationManagementService';
import {
  getFrequencyFromTimeCount,
  getDefaultTimesForFrequency,
  getFrequencyOptions,
} from '../../../utils/medicationFrequency';
import MedicationDrawerHeader from './MedicationDrawerHeader';
import MedicationDrawerList from './MedicationDrawerList';
import MedicationDrawerForm from './MedicationDrawerForm';

const FREQUENCY_OPTIONS = getFrequencyOptions();

/**
 * MedicationDrawer - Bottom drawer for managing medications (mobile-optimized)
 * Native mobile feel with swipe-to-dismiss
 */
const MedicationDrawer = ({ open, onClose, child }) => {
  const [medications, setMedications] = useState([]);
  const [discontinuedMeds, setDiscontinuedMeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [showDiscontinued, setShowDiscontinued] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'once daily',
    scheduledTimes: ['08:00'],
    notes: '',
  });

  useEffect(() => {
    if (open && child?.id) {
      loadMedications();
    }
  }, [open, child?.id]);

  const loadMedications = async () => {
    if (!child?.id) return;

    try {
      setLoading(true);
      const activeMeds = await getMedications(child.id, true);
      const allMeds = await getMedications(child.id, false);
      const inactiveMeds = allMeds.filter(med => !med.active);

      setMedications(activeMeds);
      setDiscontinuedMeds(inactiveMeds);
    } catch (err) {
      console.error('[MedicationDrawer] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingMed(null);
    setFormData({
      name: '',
      dosage: '',
      frequency: 'once daily',
      scheduledTimes: ['08:00'],
      notes: '',
    });
    setEditMode(true);
  };

  const handleEdit = (med) => {
    setEditingMed(med);
    setFormData({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      scheduledTimes: med.scheduledTimes,
      notes: med.notes || '',
    });
    setEditMode(true);
  };

  const handleSave = async () => {
    if (!child?.id || !formData.name || !formData.dosage) {
      alert('Please fill in medication name and dosage');
      return;
    }

    try {
      if (editingMed) {
        await updateMedication(child.id, editingMed.id, formData);
      } else {
        await addMedication(child.id, formData);
      }
      await loadMedications();
      setEditMode(false);
    } catch (err) {
      console.error('[MedicationDrawer] Error saving:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleDiscontinue = async (medicationId) => {
    try {
      await discontinueMedication(child.id, medicationId);
      await loadMedications();
      setSnackbar({ open: true, message: 'Medication discontinued', severity: 'success' });
    } catch (err) {
      console.error('[MedicationDrawer] Error discontinuing:', err);
      setSnackbar({ open: true, message: `Error: ${err.message}`, severity: 'error' });
    }
  };

  const handleReactivate = async (medicationId) => {
    try {
      await updateMedication(child.id, medicationId, {
        active: true,
        endDate: null,
      });
      await loadMedications();
      setSnackbar({ open: true, message: 'Medication reactivated', severity: 'success' });
    } catch (err) {
      console.error('[MedicationDrawer] Error reactivating:', err);
      setSnackbar({ open: true, message: `Error: ${err.message}`, severity: 'error' });
    }
  };

  const handleRemove = async (medicationId) => {
    if (!window.confirm('Permanently delete this medication? This cannot be undone.')) return;

    try {
      await removeMedication(child.id, medicationId);
      await loadMedications();
    } catch (err) {
      console.error('[MedicationDrawer] Error removing:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditingMed(null);
  };

  const handleFrequencyChange = (newFrequency) => {
    // When frequency changes, auto-populate times
    const defaultTimes = getDefaultTimesForFrequency(newFrequency);
    setFormData({
      ...formData,
      frequency: newFrequency,
      scheduledTimes: defaultTimes,
    });
  };

  const handleAddTime = () => {
    const newTimes = [...formData.scheduledTimes, '12:00'];
    setFormData({
      ...formData,
      scheduledTimes: newTimes,
      frequency: getFrequencyFromTimeCount(newTimes.length), // Auto-update frequency
    });
  };

  const handleUpdateTime = (index, value) => {
    const newTimes = [...formData.scheduledTimes];
    newTimes[index] = value;
    setFormData({ ...formData, scheduledTimes: newTimes });
  };

  const handleRemoveTime = (index) => {
    const newTimes = formData.scheduledTimes.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      scheduledTimes: newTimes,
      frequency: getFrequencyFromTimeCount(newTimes.length), // Auto-update frequency
    });
  };

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: '85vh',
          pb: 2,
        },
        onClick: (e) => e.stopPropagation()
      }}
    >
      {/* Drag Handle */}
      <Box
        sx={{
          width: 40,
          height: 4,
          bgcolor: 'divider',
          borderRadius: 2,
          mx: 'auto',
          my: 1.5,
        }}
      />

      {/* Header */}
      <MedicationDrawerHeader
        title={editMode ? (editingMed ? 'Edit Medication' : 'Add Medication') : 'Manage Medications'}
        onClose={onClose}
      />

      <Divider />

      {/* Content */}
      <Box sx={{ px: 2, py: 2, overflowY: 'auto', maxHeight: 'calc(85vh - 120px)' }}>
        {!editMode ? (
          // List View
          <MedicationDrawerList
            medications={medications}
            discontinuedMeds={discontinuedMeds}
            showDiscontinued={showDiscontinued}
            onToggleDiscontinued={() => setShowDiscontinued(!showDiscontinued)}
            onEdit={handleEdit}
            onDiscontinue={handleDiscontinue}
            onReactivate={handleReactivate}
            onRemove={handleRemove}
          />
        ) : (
          // Edit Form
          <MedicationDrawerForm
            formData={formData}
            setFormData={setFormData}
            frequencyOptions={FREQUENCY_OPTIONS}
            onFrequencyChange={handleFrequencyChange}
            onAddTime={handleAddTime}
            onUpdateTime={handleUpdateTime}
            onRemoveTime={handleRemoveTime}
          />
        )}
      </Box>

      {/* Footer Actions */}
      <Box sx={{ px: 2, pt: 1 }}>
        {editMode ? (
          <Stack direction="row" spacing={1}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
            >
              {editingMed ? 'Update' : 'Add'}
            </Button>
          </Stack>
        ) : (
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddNew}
            size="large"
          >
            Add Medication
          </Button>
        )}
      </Box>
    </Drawer>
  );
};

export default MedicationDrawer;
