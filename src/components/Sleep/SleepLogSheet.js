import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  Popover,
  Snackbar,
  Stack,
  Typography,
  ButtonBase,
  Alert,
} from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuthState } from 'react-firebase-hooks/auth';
import { addDoc, collection, serverTimestamp, updateDoc } from 'firebase/firestore';
import RichTextInput from '../UI/RichTextInput';
import LogFormShell from '../UI/LogFormShell';
import LogDateField from '../UI/LogDateField';
import LogTimeField from '../UI/LogTimeField';
import { auth, db } from '../../services/firebase';
import useChildName from '../../hooks/useChildName';
import colors from '../../assets/theme/colors';
import { uploadIncidentMedia } from '../Dashboard/Incidents/Media/mediaUploadService';

const DEFAULT_BEDTIME = '21:00';
const DEFAULT_WAKE_TIME = '07:00';

const disturbanceOptions = [
  { label: 'None', value: 'none', emoji: '✅' },
  { label: 'Woke once', value: 'woke_once', emoji: '🌙' },
  { label: 'Woke multiple times', value: 'woke_multiple_times', emoji: '🌜' },
  { label: "Didn't sleep", value: 'didnt_sleep', emoji: '😴' },
];

const sleepQualityOptions = [
  {
    value: 1,
    label: 'Awful',
    selectedBg: '#FEE2E2',
    selectedBorder: '#FCA5A5',
    selectedText: '#9F1239',
  },
  {
    value: 2,
    label: 'Poor',
    selectedBg: '#FFEDD5',
    selectedBorder: '#FDBA74',
    selectedText: '#9A3412',
  },
  {
    value: 3,
    label: 'Fair',
    selectedBg: '#FEF3C7',
    selectedBorder: '#FCD34D',
    selectedText: '#92400E',
  },
  {
    value: 4,
    label: 'Good',
    selectedBg: '#D1FAE5',
    selectedBorder: '#86EFAC',
    selectedText: '#065F46',
  },
  {
    value: 5,
    label: 'Great',
    selectedBg: '#CFFAFE',
    selectedBorder: '#67E8F9',
    selectedText: '#155E75',
  },
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

const formatDisplayDate = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
};

const formatLocalDateKey = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const buildSleepWindow = (nightOfDate, bedtime, wakeTime) => {
  const bed = parseTime(bedtime);
  const wake = parseTime(wakeTime);
  const baseDate = nightOfDate instanceof Date && !Number.isNaN(nightOfDate.getTime())
    ? new Date(nightOfDate)
    : new Date();

  if (!bed) {
    return {
      durationHours: null,
      timestamp: new Date(baseDate),
      anchorDate: baseDate,
      start: new Date(baseDate),
      end: new Date(baseDate),
    };
  }

  const start = new Date(baseDate);
  start.setHours(bed.hours, bed.minutes, 0, 0);

  if (!wake) {
    return {
      durationHours: null,
      timestamp: start,
      anchorDate: baseDate,
      start,
      end: new Date(start),
    };
  }

  const end = new Date(baseDate);
  end.setHours(wake.hours, wake.minutes, 0, 0);

  if (end <= start) {
    end.setDate(end.getDate() + 1);
  }

  const durationHours = Number(((end - start) / (1000 * 60 * 60)).toFixed(1));
  return { durationHours, timestamp: start, start, end, anchorDate: baseDate };
};

const formatSleepTimestamp = (timestamp) => {
  if (!timestamp || Number.isNaN(timestamp.getTime())) return new Date();
  return timestamp;
};

const getDefaultNotes = () => ({ text: '', mediaFile: null, audioBlob: null });

const formatRecordedSleepLabel = (dateValue, timeValue) => {
  const date = dateValue instanceof Date && !Number.isNaN(dateValue.getTime())
    ? dateValue
    : new Date();

  const [hours, minutes] = String(timeValue || '00:00').split(':').map((value) => Number(value));
  const recordedTime = new Date(date);
  if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
    recordedTime.setHours(hours, minutes, 0, 0);
  }

  return `${recordedTime.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })} at ${recordedTime.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })}`;
};

const SleepLogSheet = ({ open, onClose, child }) => {
  const [user] = useAuthState(auth);
  const { childName } = useChildName(child?.id);
  const [nightOfDate, setNightOfDate] = useState(() => new Date());
  const [bedtime, setBedtime] = useState(DEFAULT_BEDTIME);
  const [wakeTime, setWakeTime] = useState(DEFAULT_WAKE_TIME);
  const [disturbance, setDisturbance] = useState('none');
  const [sleepQuality, setSleepQuality] = useState(3);
  const [notesData, setNotesData] = useState(getDefaultNotes);
  const [notesClearToken, setNotesClearToken] = useState(0);
  const [saving, setSaving] = useState(false);
  const [datePickerAnchor, setDatePickerAnchor] = useState(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');

  useEffect(() => {
    if (!open) return;
    setNightOfDate(new Date());
    setBedtime(DEFAULT_BEDTIME);
    setWakeTime(DEFAULT_WAKE_TIME);
    setDisturbance('none');
    setSleepQuality(3);
    setNotesData(getDefaultNotes());
    setNotesClearToken((token) => token + 1);
  }, [open, child?.id]);

  const { durationHours, timestamp } = useMemo(
    () => buildSleepWindow(nightOfDate, bedtime, wakeTime),
    [nightOfDate, bedtime, wakeTime]
  );
  const anchorDateKey = useMemo(() => formatLocalDateKey(nightOfDate), [nightOfDate]);
  const handleDatePickerOpen = (event) => {
    setDatePickerAnchor(event.currentTarget);
  };

  const handleDatePickerClose = () => {
    setDatePickerAnchor(null);
  };

  const handleDateChange = (nextDate) => {
    if (!nextDate || Number.isNaN(nextDate.getTime())) {
      return;
    }

    setNightOfDate(nextDate);
    handleDatePickerClose();
  };

  const handleSave = async () => {
    if (!child?.id || !user?.uid) return;

    const text = `Slept ${durationHours !== null ? durationHours.toFixed(1) : '0.0'} hours — ${formatDisturbance(disturbance)}`;
    const entryTimestamp = formatSleepTimestamp(timestamp);
    const localDate = anchorDateKey;
    const localTime = bedtime;
    const timeZoneOffsetMinutes = -entryTimestamp.getTimezoneOffset();
    const timeZoneName = Intl.DateTimeFormat().resolvedOptions().timeZone || null;

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
        timestampUtc: entryTimestamp.toISOString(),
        timestampSource: 'sleep-anchor',
        entryDate: new Date(nightOfDate).toDateString(),
        anchorDate: localDate,
        localDate,
        localTime,
        timeZoneOffsetMinutes,
        timeZoneName,
        authorId: user.uid,
        authorName: user.displayName || user.email?.split('@')[0] || 'User',
        authorEmail: user.email,
        source: 'sleep_log',
        content: notesData?.text || '',
        sleepDetails: {
          anchorDate: localDate,
          localDate,
          localTime,
          bedtime,
          wakeTime,
          durationHours,
          disturbances: disturbance,
          quality: sleepQuality,
          notes: notesData?.text || '',
          timeZoneOffsetMinutes,
          timeZoneName,
          timestampSource: 'sleep-anchor',
          startUtc: entryTimestamp.toISOString(),
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

      setConfirmationMessage(`Sleep recorded for ${formatRecordedSleepLabel(nightOfDate, bedtime)}`);
      setConfirmationOpen(true);
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
        <Box>
          <LogDateField
            label="Night of"
            value={formatDisplayDate(nightOfDate)}
            onClick={handleDatePickerOpen}
          />

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
            <DateCalendar
              value={nightOfDate}
              onChange={handleDateChange}
              maxDate={new Date()}
            />
          </Popover>
        </Box>

        <Box
          sx={{
            p: { xs: 1.1, sm: 1.25 },
            borderRadius: '24px',
            bgcolor: colors.brand.ice,
            border: `1px solid ${colors.brand.tint}`,
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: '100%', alignItems: 'stretch' }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <LogTimeField
                label="Bedtime"
                value={bedtime}
                onChange={(e) => setBedtime(e.target.value)}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <LogTimeField
                label="Wake time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
              />
            </Box>
          </Stack>

          <Box
            sx={{
              mt: 1,
              px: 1.5,
              py: 1.05,
              borderRadius: '18px',
              bgcolor: '#FFFFFF',
              border: `1px solid ${colors.brand.tint}`,
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
              <Typography
                variant="caption"
                sx={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 700,
                  color: 'text.secondary',
                }}
              >
                Duration
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                }}
              >
                {durationHours !== null ? `${durationHours.toFixed(1)} hours` : 'Select bedtime and wake time'}
              </Typography>
            </Stack>
          </Box>
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
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
            Sleep quality
          </Typography>
          <Box
            sx={{
              display: 'flex',
              width: '100%',
              minWidth: 0,
              borderRadius: '10px',
              overflow: 'hidden',
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
            }}
          >
            {sleepQualityOptions.map((option, index) => {
              const selected = sleepQuality === option.value;

              return (
                <ButtonBase
                  key={option.value}
                  onClick={() => setSleepQuality(option.value)}
                  aria-pressed={selected}
                  sx={{
                    flex: '1 1 0',
                    minWidth: 0,
                    px: { xs: 0.35, sm: 0.65 },
                    py: { xs: 0.7, sm: 0.85 },
                    borderRadius: 0,
                    borderRight: index === sleepQualityOptions.length - 1 ? 'none' : '1px solid #E2E8F0',
                    bgcolor: selected ? option.selectedBg : '#FFFFFF',
                    borderColor: selected ? option.selectedBorder : '#E2E8F0',
                    color: selected ? option.selectedText : '#334155',
                    textTransform: 'none',
                    appearance: 'none',
                    cursor: 'pointer',
                    boxShadow: selected ? `inset 0 0 0 1px ${option.selectedBorder}` : 'none',
                    transition: 'background-color 180ms ease, color 180ms ease, box-shadow 180ms ease, transform 180ms ease',
                    '&:hover': {
                      bgcolor: selected ? option.selectedBg : '#F8FAFC',
                      transform: 'translateY(-1px)',
                    },
                    '&:focus-visible': {
                      outline: `2px solid ${selected ? option.selectedBorder : '#CBD5E1'}`,
                      outlineOffset: 2,
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.05 }}>
                    <Typography
                      component="span"
                      sx={{
                        fontSize: { xs: '0.68rem', sm: '0.82rem' },
                        fontWeight: selected ? 700 : 600,
                        lineHeight: 1.05,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {option.label}
                    </Typography>
                  </Box>
                </ButtonBase>
              );
            })}
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

      <Snackbar
        open={confirmationOpen}
        autoHideDuration={4500}
        onClose={() => setConfirmationOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setConfirmationOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {confirmationMessage}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  );

  const footerActions = (
    <>
      <Divider sx={{ my: 3 }} />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || !child?.id || !user?.uid}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          {saving ? 'Saving...' : 'Save sleep log'}
        </Button>
      </Box>
    </>
  );

  return (
    <LogFormShell
      open={open}
      onClose={onClose}
      title="Sleep"
      titleBadge={childName || child?.name || 'Child'}
      compactTitle
      footer={footerActions}
      mobileBreakpoint="md"
      maxWidth="sm"
    >
      {formBody}
    </LogFormShell>
  );
};

export default SleepLogSheet;
