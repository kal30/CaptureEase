import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, IconButton, Typography } from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import {
  getMedications,
  addMedication,
  updateMedication,
  discontinueMedication,
  removeMedication,
} from '../../../services/medicationManagementService';
import useIsMobile from '../../../hooks/useIsMobile';
import {
  getFrequencyFromTimeCount,
  getDefaultTimesForFrequency,
  getFrequencyOptions,
} from '../../../utils/medicationFrequency';
import MedicationDrawerList from './MedicationDrawerList';
import MedicationDrawerForm from './MedicationDrawerForm';

const FREQUENCY_OPTIONS = getFrequencyOptions();

/**
 * MedicationManagementDialog - Compact dialog for managing medications
 * Mobile-friendly alternative to navigating to a separate page
 */
const MedicationManagementDialog = ({ open, onClose, child }) => {
  const isMobile = useIsMobile();
  const [medications, setMedications] = useState([]);
  const [discontinuedMeds, setDiscontinuedMeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [showDiscontinued, setShowDiscontinued] = useState(false);
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
      console.error('[MedicationManagementDialog] Error:', err);
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
      console.error('[MedicationManagementDialog] Error saving:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleDiscontinue = async (medicationId) => {
    if (!window.confirm('Discontinue this medication? It will be moved to the discontinued list.')) return;

    try {
      await discontinueMedication(child.id, medicationId);
      await loadMedications();
    } catch (err) {
      console.error('[MedicationManagementDialog] Error discontinuing:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleReactivate = async (medicationId) => {
    try {
      await updateMedication(child.id, medicationId, {
        active: true,
        endDate: null,
      });
      await loadMedications();
    } catch (err) {
      console.error('[MedicationManagementDialog] Error reactivating:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleRemove = async (medicationId) => {
    if (!window.confirm('Permanently delete this medication? This cannot be undone.')) return;

    try {
      await removeMedication(child.id, medicationId);
      await loadMedications();
    } catch (err) {
      console.error('[MedicationManagementDialog] Error removing:', err);
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
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            {editMode ? (editingMed ? 'Edit Medication' : 'Add Medication') : 'Manage Medications'}
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent onClick={(e) => e.stopPropagation()}>
        {!editMode ? (
          // List View
          <>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
              fullWidth
              sx={{ mb: 2 }}
            >
              Add Medication
            </Button>

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
          </>
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
      </DialogContent>

      <DialogActions>
        {editMode ? (
          <>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              variant="contained"
            >
              {editingMed ? 'Update' : 'Add'}
            </Button>
          </>
        ) : (
          <Button onClick={onClose}>Close</Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default MedicationManagementDialog;
