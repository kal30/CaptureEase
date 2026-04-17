import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  Popover,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { addDoc, collection, serverTimestamp, updateDoc } from 'firebase/firestore';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import LogFormShell from '../UI/LogFormShell';
import LogDateField from '../UI/LogDateField';
import LogTimeField from '../UI/LogTimeField';
import RichTextInput from '../UI/RichTextInput';
import useChildName from '../../hooks/useChildName';
import { auth, db } from '../../services/firebase';
import { uploadIncidentMedia } from '../Dashboard/Incidents/Media/mediaUploadService';

const pad = (n) => String(n).padStart(2, '0');

const getDefaultDate = () => new Date().toISOString().split('T')[0];

const getDefaultTime = () => {
  const now = new Date();
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Drink', 'Other'];
const portionOptions = ['All of it', 'Most of it', 'Half', 'A few bites', 'Refused'];
const reactionOptions = [
  'None',
  'Spit out',
  'Gagged',
  'Refused',
  'Allergy concern',
  'Upset stomach',
];

const getDefaultNotes = () => ({ text: '', mediaFile: null, audioBlob: null });

const FoodLogSheet = ({ open, onClose, child }) => {
  const [user] = useAuthState(auth);
  const { childName } = useChildName(child?.id);
  const [foodDate, setFoodDate] = useState(getDefaultDate);
  const [foodTime, setFoodTime] = useState(getDefaultTime);
  const [mealType, setMealType] = useState(null);
  const [whatWasEatenData, setWhatWasEatenData] = useState(getDefaultNotes);
  const [whatWasEatenClearToken, setWhatWasEatenClearToken] = useState(0);
  const [portion, setPortion] = useState(null);
  const [reaction, setReaction] = useState('None');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [datePickerAnchor, setDatePickerAnchor] = useState(null);

  useEffect(() => {
    if (!open) return;
    setFoodDate(getDefaultDate());
    setFoodTime(getDefaultTime());
    setMealType(null);
    setWhatWasEatenData(getDefaultNotes());
    setWhatWasEatenClearToken((token) => token + 1);
    setPortion(null);
    setReaction('None');
    setNotes('');
  }, [open, child?.id]);

  const resolvedChildName = childName || child?.name || 'Child';
  const foodTimestamp = useMemo(() => {
    const timestamp = new Date(`${foodDate}T${foodTime}`);
    return Number.isNaN(timestamp.getTime()) ? new Date() : timestamp;
  }, [foodDate, foodTime]);

  const foodDateObject = useMemo(() => {
    const parsed = new Date(`${foodDate}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }, [foodDate]);

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

    setFoodDate([
      nextDate.getFullYear(),
      String(nextDate.getMonth() + 1).padStart(2, '0'),
      String(nextDate.getDate()).padStart(2, '0'),
    ].join('-'));
    handleDatePickerClose();
  };

  const handleSave = async () => {
    if (!child?.id || !user?.uid) return;

    const mealText = [
      mealType,
      whatWasEatenData?.text,
      portion && portion !== 'All of it' ? `Portion: ${portion}` : null,
      reaction && reaction !== 'None' ? `Reaction: ${reaction}` : null,
    ].filter(Boolean).join(' — ');

    setSaving(true);
    try {
      const timeZoneOffsetMinutes = -foodTimestamp.getTimezoneOffset();
      const timeZoneName = Intl.DateTimeFormat().resolvedOptions().timeZone || null;
      const docData = {
        childId: child.id,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        text: mealText || 'Food logged',
        status: 'active',
        category: 'food',
        tags: ['food', mealType?.toLowerCase()].filter(Boolean),
        timestamp: foodTimestamp,
        timestampUtc: foodTimestamp.toISOString(),
        timestampSource: 'local-input',
        entryDate: new Date(foodDate).toDateString(),
        localDate: foodDate,
        localTime: foodTime,
        timeZoneOffsetMinutes,
        timeZoneName,
        authorId: user.uid,
        authorName: user.displayName || user.email?.split('@')[0] || 'User',
        authorEmail: user.email,
        source: 'food_log',
        foodDetails: {
          mealType,
          portion,
          reaction,
          whatWasEaten: whatWasEatenData?.text || '',
          notes,
          localDate: foodDate,
          localTime: foodTime,
          timeZoneOffsetMinutes,
          timeZoneName,
          timestampSource: 'local-input',
        },
      };

      const docRef = await addDoc(collection(db, 'dailyLogs'), docData);
      let mediaUrls = [];

      if (whatWasEatenData?.mediaFile || whatWasEatenData?.audioBlob) {
        const uploadedRichMedia = await uploadIncidentMedia(
          whatWasEatenData?.mediaFile,
          whatWasEatenData?.audioBlob,
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
          date: foodTimestamp.toISOString(),
        },
      }));

      setWhatWasEatenClearToken((token) => token + 1);
      onClose?.();
    } catch (error) {
      console.error('Error saving food log:', error);
    } finally {
      setSaving(false);
    }
  };

  const renderChipGroup = (options, value, onChange, selectedValue = value) => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {options.map((option) => {
        const selected = selectedValue === option;
        return (
          <Chip
            key={option}
            label={option}
            variant={selected ? 'filled' : 'outlined'}
            color={selected ? 'primary' : 'default'}
            onClick={() => onChange(option)}
            sx={{ flexShrink: 0 }}
          />
        );
      })}
    </Box>
  );

  const formBody = (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Stack spacing={2.5}>
        <Box
          sx={{
            p: { xs: 1.1, sm: 1.25 },
            borderRadius: '24px',
            bgcolor: '#F4F1F8',
            border: '1px solid #D9D1EE',
          }}
        >
          <Stack
            direction="row"
            spacing={1.25}
            sx={{ width: '100%' }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <LogDateField
                label="Date"
                value={formatDisplayDate(foodDateObject)}
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
                  value={foodDateObject}
                  onChange={handleDateChange}
                  maxDate={new Date()}
                />
              </Popover>
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <LogTimeField
                label="Time"
                value={foodTime}
                onChange={(e) => setFoodTime(e.target.value)}
              />
            </Box>
          </Stack>
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
            Meal type
          </Typography>
          {renderChipGroup(mealTypes, mealType, setMealType)}
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
            What was eaten?
          </Typography>
          <RichTextInput
            value={whatWasEatenData}
            onDataChange={setWhatWasEatenData}
            clearData={whatWasEatenClearToken}
            placeholder="Describe the food, portions, and context"
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.25 }}>
            Add text notes, photos, voice recordings, or videos to provide context
          </Typography>
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
            How much?
          </Typography>
          {renderChipGroup(portionOptions, portion, setPortion)}
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
            Any reactions?
          </Typography>
          {renderChipGroup(reactionOptions, reaction, setReaction)}
        </Box>

        <TextField
          fullWidth
          multiline
          rows={2}
          label="Notes"
          placeholder="Any additional context"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Stack>
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
          {saving ? 'Saving...' : 'Save food log'}
        </Button>
      </Box>
    </>
  );

  return (
    <LogFormShell
      open={open}
      onClose={onClose}
      title="Food"
      titleBadge={resolvedChildName}
      compactTitle
      footer={footerActions}
      mobileBreakpoint="md"
      maxWidth="sm"
    >
      {formBody}
    </LogFormShell>
  );
};

export default FoodLogSheet;
