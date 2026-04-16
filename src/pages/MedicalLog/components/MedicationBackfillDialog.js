import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  MenuItem,
  Popover,
  Stack,
  TextField,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { addDoc, collection, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import LogFormShell from '../../../components/UI/LogFormShell';
import LogDateField from '../../../components/UI/LogDateField';
import LogTimeField from '../../../components/UI/LogTimeField';
import StyledButton from '../../../components/UI/StyledButton';
import { auth, db } from '../../../services/firebase';
import { fetchMedications } from '../../../services/medicationService';
import colors from '../../../assets/theme/colors';

const getDefaultBackfillDate = () => {
  const nextDate = new Date();
  if (nextDate.getHours() < 5) {
    nextDate.setDate(nextDate.getDate() - 1);
  }
  return nextDate;
};

const formatSheetDateValue = (dateValue) => {
  if (!(dateValue instanceof Date) || Number.isNaN(dateValue.getTime())) {
    return 'Select date';
  }

  return dateValue.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
};

const formatLocalDateInput = (dateValue) => {
  if (!(dateValue instanceof Date) || Number.isNaN(dateValue.getTime())) {
    return '';
  }

  const year = dateValue.getFullYear();
  const month = String(dateValue.getMonth() + 1).padStart(2, '0');
  const day = String(dateValue.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const buildLocalDateTime = (dateValue, timeValue) => {
  const next = new Date(dateValue);
  if (timeValue) {
    const [hours, minutes] = timeValue.split(':').map((value) => Number(value));
    if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
      next.setHours(hours, minutes, 0, 0);
    }
  }
  return next;
};

const getCurrentTimeValue = (date = new Date()) => new Date(date).toTimeString().slice(0, 5);

const normalizeMedicationSchedules = (medication) => {
  if (!medication) {
    return [];
  }

  const schedules = Array.isArray(medication.schedules) && medication.schedules.length
    ? medication.schedules
    : [{
        id: `${medication.id || 'med'}-0`,
        dose: medication.dose || '',
        unit: medication.unit || 'mg',
        time: medication.time || '',
      }];

  return schedules.map((schedule, index) => ({
    id: schedule.id || `${medication.id || 'med'}-${index}`,
    dose: schedule.dose || medication.dose || '',
    unit: schedule.unit || medication.unit || 'mg',
    time: schedule.time || medication.time || '',
  }));
};

const MedicationBackfillDialog = ({
  open,
  childId,
  childName,
  medications = [],
  initialMedicationId = '',
  initialScheduleId = '',
  initialStatus = 'taken',
  initialDate = null,
  initialTime = '',
  onClose,
  onSaved,
}) => {
  const [authUser] = useAuthState(auth);
  const [loading, setLoading] = useState(false);
  const [medicationOptions, setMedicationOptions] = useState([]);
  const [selectedMedicationId, setSelectedMedicationId] = useState('');
  const [selectedScheduleId, setSelectedScheduleId] = useState('');
  const [selectedDate, setSelectedDate] = useState(getDefaultBackfillDate());
  const [selectedTime, setSelectedTime] = useState(getCurrentTimeValue());
  const [status, setStatus] = useState('taken');
  const [datePickerAnchor, setDatePickerAnchor] = useState(null);
  const [showDateField, setShowDateField] = useState(false);

  useEffect(() => {
    let active = true;

    const loadMedications = async () => {
      if (!open || !childId) {
        setMedicationOptions([]);
        return;
      }

      if (Array.isArray(medications) && medications.length > 0) {
        setMedicationOptions(medications.filter((item) => !item?.isArchived));
        return;
      }

      try {
        const fetched = await fetchMedications(childId, false);
        if (active) {
          setMedicationOptions((Array.isArray(fetched) ? fetched : []).filter((item) => !item?.isArchived));
        }
      } catch (error) {
        console.error('Error loading medications for backfill:', error);
        if (active) {
          setMedicationOptions([]);
        }
      }
    };

    loadMedications();
    return () => {
      active = false;
    };
  }, [open, childId, medications]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const nextDate = initialDate instanceof Date && !Number.isNaN(initialDate.getTime())
      ? initialDate
      : getDefaultBackfillDate();
    setSelectedDate(nextDate);
    setSelectedTime(initialTime || getCurrentTimeValue());
    setStatus(initialStatus || 'taken');
    setSelectedMedicationId(initialMedicationId || '');
    setSelectedScheduleId(initialScheduleId || '');
    setShowDateField(false);
  }, [open, childId, initialDate, initialTime, initialStatus, initialMedicationId, initialScheduleId]);

  useEffect(() => {
    if (!medicationOptions.length) {
      setSelectedMedicationId('');
      setSelectedScheduleId('');
      return;
    }

    setSelectedMedicationId((current) => {
      if (initialMedicationId && medicationOptions.some((item) => item.id === initialMedicationId)) {
        return initialMedicationId;
      }
      if (current && medicationOptions.some((item) => item.id === current)) {
        return current;
      }
      return medicationOptions[0].id;
    });
  }, [medicationOptions, initialMedicationId]);

  const selectedMedication = useMemo(() => (
    medicationOptions.find((item) => item.id === selectedMedicationId) || null
  ), [medicationOptions, selectedMedicationId]);

  const selectedSchedule = useMemo(() => {
    const schedules = normalizeMedicationSchedules(selectedMedication);
    if (!schedules.length) {
      return null;
    }

    return schedules.find((schedule) => schedule.id === selectedScheduleId) || schedules[0];
  }, [selectedMedication, selectedScheduleId]);

  useEffect(() => {
    if (!selectedMedication) {
      setSelectedScheduleId('');
      return;
    }

    const schedules = normalizeMedicationSchedules(selectedMedication);
    if (!schedules.length) {
      setSelectedScheduleId('');
      return;
    }

    setSelectedScheduleId((current) => {
      if (initialScheduleId && schedules.some((schedule) => schedule.id === initialScheduleId)) {
        return initialScheduleId;
      }
      if (current && schedules.some((schedule) => schedule.id === current)) {
        return current;
      }
      return schedules[0].id;
    });
  }, [selectedMedication, initialScheduleId]);

  const handleDatePickerOpen = (event) => {
    setDatePickerAnchor(event.currentTarget);
  };

  const handleDatePickerClose = () => {
    setDatePickerAnchor(null);
  };

  const handleDateChange = (nextDate) => {
    if (!nextDate) {
      return;
    }

    setSelectedDate(nextDate);
    setDatePickerAnchor(null);
  };

  const buildBackfillDoc = () => {
    const medicationName = selectedMedication?.name || '';
    const scheduleTime = selectedSchedule?.time || selectedTime || '';
    const takenTimestamp = buildLocalDateTime(selectedDate, selectedTime);
    const scheduledTimestamp = buildLocalDateTime(selectedDate, scheduleTime);
    const localDate = formatLocalDateInput(selectedDate);

    return {
      childId,
      createdBy: authUser?.uid,
      createdAt: serverTimestamp(),
      status: 'active',
      category: 'medication',
      source: 'medication_backfill',
      text: `${status === 'taken' ? 'Backfilled taken' : 'Backfilled missed'} dose for ${medicationName}`.trim(),
      entryDate: localDate,
      timestamp: takenTimestamp,
      timestampUtc: takenTimestamp.toISOString(),
      localDate,
      localTime: selectedTime,
      medicationId: selectedMedication?.id || '',
      medicationName,
      medicationScheduleId: selectedSchedule?.id || '',
      medicationScheduleIndex: 0,
      medicationScheduleKey: [selectedMedication?.id || '', selectedSchedule?.id || '0', localDate].join(':'),
      medicationScheduleTime: scheduleTime,
      medicationScheduleDose: selectedSchedule?.dose || selectedMedication?.dose || '',
      medicationScheduleUnit: selectedSchedule?.unit || selectedMedication?.unit || 'mg',
      scheduledFor: scheduledTimestamp.toISOString(),
      takenAt: status === 'taken' ? takenTimestamp.toISOString() : null,
      backfill: true,
      backfillStatus: status,
      authorId: authUser?.uid,
      authorName: authUser?.displayName || authUser?.email?.split('@')[0] || 'User',
      authorEmail: authUser?.email,
      timeZoneName: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
      timeZoneOffsetMinutes: -new Date().getTimezoneOffset(),
    };
  };

  const handleSubmit = async () => {
    if (!childId || !authUser?.uid || !selectedMedication) {
      return;
    }

    setLoading(true);
    try {
      const docData = buildBackfillDoc();
      const docRef = await addDoc(collection(db, 'dailyLogs'), docData);
      await updateDoc(docRef, {
        status: status === 'taken' ? 'taken' : 'missed',
      });

      window.dispatchEvent(new CustomEvent('captureez:timeline-entry-created', {
        detail: {
          id: docRef.id,
          collection: 'dailyLogs',
          ...docData,
          status,
        },
      }));

      onSaved?.({
        medicationName: selectedMedication?.name || '',
        status,
        scheduledFor: docData.scheduledFor,
        takenAt: docData.takenAt,
      });

      onClose?.();
    } catch (error) {
      console.error('Error saving medication backfill:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LogFormShell
      open={open}
      onClose={onClose}
      title="Log medication"
      subtitle="Tap to mark as taken"
      titleBadge={childName || undefined}
      compactTitle
      mobileBreakpoint="md"
      bodySx={{
        pt: 1.25,
        pb: 1.5,
        px: { xs: 1.1, sm: 2 },
      }}
      surfaceSx={{
        height: 'min(90vh, 90vh)',
        maxHeight: 'min(90vh, 90vh)',
      }}
    >
      <Stack spacing={1.25}>
        <TextField
          select
          fullWidth
          label="Medication"
          value={selectedMedicationId}
          onChange={(event) => setSelectedMedicationId(event.target.value)}
        >
          {medicationOptions.length > 0 ? (
            medicationOptions.map((medication) => (
              <MenuItem key={medication.id} value={medication.id}>
                {medication.name}
              </MenuItem>
            ))
          ) : (
            <MenuItem value="">
              No active medications
            </MenuItem>
          )}
        </TextField>

        <LogTimeField
          value={selectedTime}
          onChange={(event) => setSelectedTime(event.target.value)}
          label="Time"
          sx={{
            '& .MuiInputBase-root': {
              minHeight: 58,
              borderRadius: '18px',
            },
            '& input': {
              paddingTop: '0.8rem',
              paddingBottom: '0.75rem',
            },
          }}
        />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 1,
          }}
        >
          <Button
            variant={status === 'taken' ? 'contained' : 'outlined'}
            onClick={() => setStatus('taken')}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              py: 1.15,
              bgcolor: status === 'taken' ? colors.brand.ink : 'transparent',
              color: status === 'taken' ? '#fff' : colors.brand.navy,
              borderColor: colors.landing.borderLight,
              '&:hover': {
                bgcolor: status === 'taken' ? colors.brand.deep : 'rgba(244, 241, 248, 0.6)',
              },
            }}
          >
            Taken
          </Button>
          <Button
            variant={status === 'missed' ? 'contained' : 'outlined'}
            onClick={() => setStatus('missed')}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              py: 1.15,
              bgcolor: status === 'missed' ? '#b91c1c' : 'transparent',
              color: status === 'missed' ? '#fff' : colors.brand.navy,
              borderColor: colors.landing.borderLight,
              '&:hover': {
                bgcolor: status === 'missed' ? '#991b1b' : 'rgba(244, 241, 248, 0.6)',
              },
            }}
          >
            Missed
          </Button>
        </Box>

        <Button
          type="button"
          variant="text"
          onClick={() => setShowDateField((current) => !current)}
          sx={{
            alignSelf: 'flex-start',
            minWidth: 0,
            px: 0,
            py: 0,
            textTransform: 'none',
            fontWeight: 650,
            color: '#6b7280',
            whiteSpace: 'nowrap',
            '&:hover': {
              bgcolor: 'transparent',
              textDecoration: 'underline',
            },
          }}
        >
          {showDateField ? 'Hide date' : 'Different date'}
        </Button>

        {showDateField ? (
          <LogDateField
            label="Date"
            value={formatSheetDateValue(selectedDate)}
            onClick={handleDatePickerOpen}
          />
        ) : null}

        <StyledButton
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !selectedMedication}
          sx={{
            minWidth: 180,
            height: 58,
            borderRadius: '24px',
            bgcolor: colors.brand.ink,
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '1rem',
            textTransform: 'none',
            width: '100%',
            '&:hover': { bgcolor: colors.brand.deep },
          }}
        >
          {loading ? 'Saving...' : 'Save entry'}
        </StyledButton>
      </Stack>

      <Popover
        open={Boolean(datePickerAnchor)}
        anchorEl={datePickerAnchor}
        onClose={handleDatePickerClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: '16px',
            boxShadow: '0 18px 40px rgba(15, 23, 42, 0.18)',
            overflow: 'hidden',
          },
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateCalendar
            value={selectedDate}
            onChange={handleDateChange}
          />
        </LocalizationProvider>
      </Popover>
    </LogFormShell>
  );
};

export default MedicationBackfillDialog;
