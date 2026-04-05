import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../../../services/firebase';

const getTodayDateValue = () => new Date().toISOString().split('T')[0];

const getCurrentTimeValue = () => new Date().toTimeString().slice(0, 5);

const buildTimestampFromDateAndTime = (dateValue, timeValue) => {
  const [year, month, day] = (dateValue || getTodayDateValue()).split('-').map((value) => Number(value));
  const [hours, minutes] = (timeValue || getCurrentTimeValue()).split(':').map((value) => Number(value));

  if ([year, month, day, hours, minutes].some((value) => Number.isNaN(value))) {
    return new Date();
  }

  return new Date(year, month - 1, day, hours, minutes, 0, 0);
};

const BulkMedicationLogDialog = ({
  open,
  childId,
  childName,
  medications = [],
  onClose,
  onSaved,
  user,
}) => {
  const activeMedications = useMemo(
    () => medications.filter((med) => !med.isArchived),
    [medications]
  );
  const [selectedMedicationIds, setSelectedMedicationIds] = useState([]);
  const [date, setDate] = useState(getTodayDateValue());
  const [timeGiven, setTimeGiven] = useState(getCurrentTimeValue());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setSelectedMedicationIds(activeMedications.map((med) => med.id));
    setDate(getTodayDateValue());
    setTimeGiven(getCurrentTimeValue());
    setSaving(false);
  }, [open, activeMedications]);

  const handleToggleMedication = (medicationId) => {
    setSelectedMedicationIds((current) =>
      current.includes(medicationId)
        ? current.filter((id) => id !== medicationId)
        : [...current, medicationId]
    );
  };

  const handleSave = async () => {
    if (!childId || !user?.uid || selectedMedicationIds.length === 0) {
      return;
    }

    setSaving(true);
    try {
      const doseTimestamp = buildTimestampFromDateAndTime(date, timeGiven);
      const batch = writeBatch(db);

      selectedMedicationIds.forEach((medicationId) => {
        const medication = activeMedications.find((item) => item.id === medicationId);
        if (!medication) return;

        const medicationText = `Gave ${medication.name} ${medication.dosage || ''}`.trim();
        const docRef = doc(collection(db, 'dailyLogs'));

        batch.set(docRef, {
          childId,
          createdBy: user.uid,
          createdAt: serverTimestamp(),
          text: medicationText,
          status: 'active',
          category: 'medication',
          timestamp: doseTimestamp,
          entryDate: doseTimestamp.toDateString(),
          authorId: user.uid,
          authorName: user.displayName || user.email?.split('@')[0] || 'User',
          authorEmail: user.email,
          source: 'medication_log',
        });
      });

      await batch.commit();
      onSaved?.({
        childId,
        count: selectedMedicationIds.length,
        date,
        timeGiven,
      });
      onClose?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pb: 1 }}>
        Log all medications for today
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {childName ? `${childName}` : 'This child'} • default time applies to each saved dose
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Date"
              InputLabelProps={{ shrink: true }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="time"
              label="Time"
              InputLabelProps={{ shrink: true }}
              value={timeGiven}
              onChange={(e) => setTimeGiven(e.target.value)}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Selected medications
        </Typography>

        <List dense disablePadding sx={{ maxHeight: 320, overflowY: 'auto' }}>
          {activeMedications.map((medication, index) => {
            const isSelected = selectedMedicationIds.includes(medication.id);
            return (
              <React.Fragment key={medication.id}>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleToggleMedication(medication.id)}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Checkbox edge="start" checked={isSelected} tabIndex={-1} disableRipple />
                    </ListItemIcon>
                    <ListItemText
                      primary={medication.name}
                      secondary={[medication.dosage, medication.frequency].filter(Boolean).join(' · ')}
                    />
                  </ListItemButton>
                </ListItem>
                {index < activeMedications.length - 1 ? <Divider component="li" /> : null}
              </React.Fragment>
            );
          })}
          {activeMedications.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              No active medications found for this child.
            </Typography>
          ) : null}
        </List>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, flexWrap: 'wrap' }}>
        <Button variant="outlined" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || selectedMedicationIds.length === 0}
        >
          {saving ? 'Saving...' : `Save ${selectedMedicationIds.length} dose${selectedMedicationIds.length === 1 ? '' : 's'}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkMedicationLogDialog;
