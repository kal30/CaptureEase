import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MedicationOutlined as MedicationIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import ResponsiveLayout from '../components/Layout/ResponsiveLayout';
import { useChildContext } from '../contexts/ChildContext';
import { getChildren } from '../services/childService';
import {
  getMedications,
  addMedication,
  updateMedication,
  discontinueMedication,
  removeMedication,
} from '../services/medicationManagementService';
import useIsMobile from '../hooks/useIsMobile';

const FREQUENCY_OPTIONS = [
  'once daily',
  'twice daily',
  'three times daily',
  'four times daily',
  'every 12 hours',
  'every 8 hours',
  'every 6 hours',
  'as needed',
];

const HealthInfoPage = () => {
  const isMobile = useIsMobile();
  const { currentChildId } = useChildContext();
  const [child, setChild] = useState(null);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'once daily',
    scheduledTimes: ['08:00'],
    notes: '',
  });

  // Load child and medications
  useEffect(() => {
    const loadData = async () => {
      if (!currentChildId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get child info
        const children = await getChildren();
        const selectedChild = children.find(c => c.id === currentChildId);
        setChild(selectedChild);

        // Get medications
        const meds = await getMedications(currentChildId, true); // Active only
        setMedications(meds);
      } catch (err) {
        console.error('[HealthInfoPage] Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentChildId]);

  const handleOpenDialog = (medication = null) => {
    if (medication) {
      setEditingMed(medication);
      setFormData({
        name: medication.name,
        dosage: medication.dosage,
        frequency: medication.frequency,
        scheduledTimes: medication.scheduledTimes,
        notes: medication.notes || '',
      });
    } else {
      setEditingMed(null);
      setFormData({
        name: '',
        dosage: '',
        frequency: 'once daily',
        scheduledTimes: ['08:00'],
        notes: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingMed(null);
  };

  const handleSaveMedication = async () => {
    if (!child?.id || !formData.name || !formData.dosage) {
      alert('Please fill in medication name and dosage');
      return;
    }

    try {
      if (editingMed) {
        // Update existing
        await updateMedication(child.id, editingMed.id, formData);
      } else {
        // Add new
        await addMedication(child.id, formData);
      }

      // Reload medications
      const meds = await getMedications(child.id, true);
      setMedications(meds);
      handleCloseDialog();
    } catch (err) {
      console.error('[HealthInfoPage] Error saving medication:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleDiscontinue = async (medicationId) => {
    if (!window.confirm('Discontinue this medication?')) return;

    try {
      await discontinueMedication(child.id, medicationId);
      const meds = await getMedications(child.id, true);
      setMedications(meds);
    } catch (err) {
      console.error('[HealthInfoPage] Error discontinuing medication:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleRemove = async (medicationId) => {
    if (!window.confirm('Permanently remove this medication?')) return;

    try {
      await removeMedication(child.id, medicationId);
      const meds = await getMedications(child.id, true);
      setMedications(meds);
    } catch (err) {
      console.error('[HealthInfoPage] Error removing medication:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleAddTime = () => {
    setFormData({
      ...formData,
      scheduledTimes: [...formData.scheduledTimes, '12:00'],
    });
  };

  const handleUpdateTime = (index, value) => {
    const newTimes = [...formData.scheduledTimes];
    newTimes[index] = value;
    setFormData({ ...formData, scheduledTimes: newTimes });
  };

  const handleRemoveTime = (index) => {
    const newTimes = formData.scheduledTimes.filter((_, i) => i !== index);
    setFormData({ ...formData, scheduledTimes: newTimes });
  };

  if (!currentChildId) {
    return (
      <ResponsiveLayout pageTitle="Medication Management">
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Alert severity="info">
            Please select a child from the dashboard to manage medications.
          </Alert>
        </Container>
      </ResponsiveLayout>
    );
  }

  if (loading) {
    return (
      <ResponsiveLayout pageTitle="Medication Management">
        <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
          <CircularProgress />
        </Container>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout pageTitle={`Medications - ${child?.name || 'Loading...'}`}>
      <Container maxWidth="md" sx={{ mt: isMobile ? 2 : 4, pb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MedicationIcon />
            Manage Medications
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Medication
          </Button>
        </Box>

        {medications.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <MedicationIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              No medications added yet. Click "Add Medication" to get started.
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {medications.map(med => (
              <Card key={med.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6">{med.name}</Typography>
                    <Chip
                      label={med.active ? 'Active' : 'Inactive'}
                      color={med.active ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>Dosage:</strong> {med.dosage}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>Frequency:</strong> {med.frequency}
                  </Typography>
                  {med.scheduledTimes && med.scheduledTimes.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <ScheduleIcon fontSize="small" color="action" />
                      {med.scheduledTimes.map((time, idx) => (
                        <Chip key={idx} label={time} size="small" />
                      ))}
                    </Box>
                  )}
                  {med.notes && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                      {med.notes}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <IconButton size="small" onClick={() => handleOpenDialog(med)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="warning" onClick={() => handleDiscontinue(med.id)}>
                    Discontinue
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleRemove(med.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            ))}
          </Stack>
        )}

        {/* Add/Edit Medication Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingMed ? 'Edit Medication' : 'Add Medication'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Medication Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                required
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
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                fullWidth
              >
                {FREQUENCY_OPTIONS.map((option) => (
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
                      onChange={(e) => handleUpdateTime(index, e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ step: 300 }}
                      fullWidth
                    />
                    {formData.scheduledTimes.length > 1 && (
                      <IconButton size="small" color="error" onClick={() => handleRemoveTime(index)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                ))}
                <Button size="small" startIcon={<AddIcon />} onClick={handleAddTime}>
                  Add Time
                </Button>
              </Box>

              <TextField
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                multiline
                rows={3}
                fullWidth
                placeholder="Special instructions, side effects to watch for, etc."
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSaveMedication} variant="contained">
              {editingMed ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ResponsiveLayout>
  );
};

export default HealthInfoPage;
