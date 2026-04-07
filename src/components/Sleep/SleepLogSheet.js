import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  Slider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuthState } from 'react-firebase-hooks/auth';
import { addDoc, collection, serverTimestamp, updateDoc } from 'firebase/firestore';
import RichTextInput from '../UI/RichTextInput';
import LogFormShell from '../UI/LogFormShell';
import { auth, db } from '../../services/firebase';
import { SLEEP_SCALE } from '../../constants/habitTypes';
import { uploadIncidentMedia } from '../Dashboard/Incidents/Media/mediaUploadService';

const DEFAULT_BEDTIME = '21:00';
const DEFAULT_WAKE_TIME = '07:00';

const disturbanceOptions = [
  { label: 'None', value: 'none', emoji: '✅' },
  { label: 'Woke once', value: 'woke_once', emoji: '🌙' },
  { label: 'Woke multiple times', value: 'woke_multiple_times', emoji: '🌜' },
  { label: "Didn't sleep", value: 'didnt_sleep', emoji: '😴' },
];

const formatDisturbance = (value) => {
  const map = {
    none: 'No disturbances',
    woke_once: 'Woke once',
    woke_multiple_times: 'Woke multiple times',
    didnt_sleep: "Didn't sleep",
  };

  return map[value] || 'No disturbances';
};

const parseTime = (timeValue) => {
  if (!timeValue) return null;
  const [hours, minutes] = timeValue.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return { hours, minutes };
};

const buildSleepWindow = (sleepDate, bedtime, wakeTime) => {
  const bed = parseTime(bedtime);
  const wake = parseTime(wakeTime);
  const baseDate = sleepDate instanceof Date && !Number.isNaN(sleepDate.getTime())
    ? new Date(sleepDate)
    : new Date();

  if (!bed || !wake) {
    return { durationHours: null, timestamp: new Date() };
  }

  const start = new Date(baseDate);
  start.setHours(bed.hours, bed.minutes, 0, 0);

  const end = new Date(baseDate);
  end.setHours(wake.hours, wake.minutes, 0, 0);

  if (end <= start) {
    end.setDate(end.getDate() + 1);
  }

  const durationHours = Number(((end - start) / (1000 * 60 * 60)).toFixed(1));
  return { durationHours, timestamp: start };
};

const formatSleepTimestamp = (timestamp) => {
  if (!timestamp || Number.isNaN(timestamp.getTime())) return new Date();
  return timestamp;
};

const getDefaultNotes = () => ({ text: '', mediaFile: null, audioBlob: null });

const SleepLogSheet = ({ open, onClose, child }) => {
  const [user] = useAuthState(auth);
  const [sleepDate, setSleepDate] = useState(() => new Date());
  const [bedtime, setBedtime] = useState(DEFAULT_BEDTIME);
  const [wakeTime, setWakeTime] = useState(DEFAULT_WAKE_TIME);
  const [disturbance, setDisturbance] = useState('none');
  const [sleepQuality, setSleepQuality] = useState(5);
  const [notesData, setNotesData] = useState(getDefaultNotes);
  const [notesClearToken, setNotesClearToken] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSleepDate(new Date());
    setBedtime(DEFAULT_BEDTIME);
    setWakeTime(DEFAULT_WAKE_TIME);
    setDisturbance('none');
    setSleepQuality(5);
    setNotesData(getDefaultNotes());
    setNotesClearToken((token) => token + 1);
  }, [open, child?.id]);

  const { durationHours, timestamp } = useMemo(
    () => buildSleepWindow(sleepDate, bedtime, wakeTime),
    [sleepDate, bedtime, wakeTime]
  );
  const sleepScale = SLEEP_SCALE[sleepQuality] || SLEEP_SCALE[5];
  const sleepScaleMarks = Object.keys(SLEEP_SCALE).map((value) => ({
    value: Number(value),
    label: value,
  }));

  const handleSave = async () => {
    if (!child?.id || !user?.uid) return;

    const text = `Slept ${durationHours !== null ? durationHours.toFixed(1) : '0.0'} hours — ${formatDisturbance(disturbance)}`;
    const entryTimestamp = formatSleepTimestamp(timestamp);

    setSaving(true);
    try {
      const docData = {
        childId: child.id,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        text,
        notes: notesData?.text || '',
        status: 'active',
        category: 'sleep',
        tags: ['sleep'],
        timestamp: entryTimestamp,
        entryDate: entryTimestamp.toDateString(),
        authorId: user.uid,
        authorName: user.displayName || user.email?.split('@')[0] || 'User',
        authorEmail: user.email,
        source: 'sleep_log',
        content: notesData?.text || '',
        sleepDetails: {
          bedtime,
          wakeTime,
          durationHours,
          disturbances: disturbance,
          quality: sleepQuality,
          notes: notesData?.text || '',
        },
      };

      const docRef = await addDoc(collection(db, 'dailyLogs'), docData);
      let mediaUrls = [];

      if (notesData?.mediaFile || notesData?.audioBlob) {
        const uploadedRichMedia = await uploadIncidentMedia(
          notesData?.mediaFile,
          notesData?.audioBlob,
          docRef.id,
          `dailyLogs/${docRef.id}`
        );
        mediaUrls = (uploadedRichMedia || []).map((item) => item.url).filter(Boolean);
        if (mediaUrls.length > 0) {
          await updateDoc(docRef, { mediaUrls });
        }
      }

      window.dispatchEvent(new CustomEvent('captureez:timeline-entry-created', {
        detail: {
          id: docRef.id,
          collection: 'dailyLogs',
          ...docData,
          ...(mediaUrls.length > 0 && { mediaUrls }),
        },
      }));

      window.dispatchEvent(new CustomEvent('captureez:timeline-focus-date', {
        detail: {
          childId: child.id,
          date: entryTimestamp.toISOString(),
        },
      }));

      setNotesClearToken((token) => token + 1);
      onClose?.();
    } catch (error) {
      console.error('Error saving sleep log:', error);
    } finally {
      setSaving(false);
    }
  };

  const formBody = (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Stack spacing={3}>
        <DatePicker
          label="Sleep date"
          value={sleepDate}
          onChange={(value) => {
            if (value && !Number.isNaN(value.getTime())) {
              setSleepDate(value);
            }
          }}
          maxDate={new Date()}
          slotProps={{
            textField: {
              fullWidth: true,
              InputLabelProps: { shrink: true },
              sx: {
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,
                },
              },
            },
          }}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.25} sx={{ width: '100%', minWidth: 0 }}>
          <TextField
            fullWidth
            type="time"
            label="Bedtime"
            value={bedtime}
            onChange={(e) => setBedtime(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 0 }}
          />
          <TextField
            fullWidth
            type="time"
            label="Wake time"
            value={wakeTime}
            onChange={(e) => setWakeTime(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 0 }}
          />
        </Stack>

        <Box sx={{ bgcolor: 'primary.light', borderRadius: 2, p: 2, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.dark' }}>
            {durationHours !== null ? `${durationHours.toFixed(1)} hours` : 'Select bedtime and wake time'}
          </Typography>
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
            Sleep disturbances
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.2, overflowX: 'auto', pb: 1 }}>
            {disturbanceOptions.map((option) => {
              const selected = disturbance === option.value;
              return (
                <Chip
                  key={option.value}
                  label={`${option.emoji} ${option.label}`}
                  variant={selected ? 'filled' : 'outlined'}
                  color={selected ? 'primary' : 'default'}
                  onClick={() => setDisturbance(option.value)}
                  sx={{ flexShrink: 0 }}
                />
              );
            })}
          </Box>
        </Box>

        <Box>
          <Slider
            value={sleepQuality}
            onChange={(_, value) => setSleepQuality(value)}
            min={1}
            max={10}
            step={1}
            marks={sleepScaleMarks}
            sx={{
              mt: 4,
              mb: 2.25,
              color: sleepScale.color,
              '& .MuiSlider-thumb': {
                bgcolor: sleepScale.color,
              },
              '& .MuiSlider-track': {
                bgcolor: sleepScale.color,
              },
              '& .MuiSlider-rail': {
                bgcolor: alpha(sleepScale.color, 0.2),
              },
            }}
          />
          <Box
            sx={{
              bgcolor: alpha(sleepScale.color, 0.16),
              borderRadius: 2,
              px: 2.25,
              py: 1.25,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 800, color: sleepScale.color }}>
              {sleepScale.label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {sleepScale.description}
            </Typography>
          </Box>
        </Box>

        <Box>
          <RichTextInput
            value={notesData}
            onDataChange={setNotesData}
            clearData={notesClearToken}
            placeholder="Add notes about sleep, wake-ups, routines, or #tags"
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.25 }}>
            Add text notes, photos, voice recordings, or videos to provide context
          </Typography>
        </Box>
      </Stack>
    </LocalizationProvider>
  );

  const footerActions = (
    <>
      <Divider sx={{ my: 3 }} />
      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        <Button fullWidth variant="outlined" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button fullWidth variant="contained" onClick={handleSave} disabled={saving || !child?.id || !user?.uid}>
          {saving ? 'Saving...' : 'Save sleep log'}
        </Button>
      </Box>
    </>
  );

  return (
    <LogFormShell
      open={open}
      onClose={onClose}
      title={`${child?.name || 'Child'}'s Sleep`}
      subtitle="Child-specific sleep tracking with bedtime, wake time, and notes"
      footer={footerActions}
      mobileBreakpoint="md"
      maxWidth="sm"
    >
      {formBody}
    </LogFormShell>
  );
};

export default SleepLogSheet;
