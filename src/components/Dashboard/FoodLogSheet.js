import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { addDoc, collection, serverTimestamp, updateDoc } from 'firebase/firestore';
import LogFormShell from '../UI/LogFormShell';
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
      const docData = {
        childId: child.id,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        text: mealText || 'Food logged',
        status: 'active',
        category: 'food',
        tags: ['food', mealType?.toLowerCase()].filter(Boolean),
        timestamp: foodTimestamp,
        entryDate: new Date(foodDate).toDateString(),
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
    <Stack spacing={2.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          fullWidth
          type="date"
          label="Date"
          value={foodDate}
          onChange={(e) => setFoodDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 0 }}
        />
        <TextField
          fullWidth
          type="time"
          label="Time"
          value={foodTime}
          onChange={(e) => setFoodTime(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 0 }}
        />
      </Stack>

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
        <Button
          fullWidth
          variant="contained"
          onClick={handleSave}
          disabled={saving || !child?.id || !user?.uid}
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
      title={`Log Food for ${resolvedChildName}`}
      subtitle="Child-specific food and meal tracking"
      footer={footerActions}
      mobileBreakpoint="md"
      maxWidth="sm"
    >
      {formBody}
    </LogFormShell>
  );
};

export default FoodLogSheet;
