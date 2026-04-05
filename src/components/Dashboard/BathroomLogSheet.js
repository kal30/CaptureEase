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
import { useAuthState } from 'react-firebase-hooks/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import LogFormShell from '../UI/LogFormShell';
import useChildName from '../../hooks/useChildName';
import { auth, db } from '../../services/firebase';
import { BATHROOM_SCALE } from '../../constants/habitTypes';

const pad = (n) => String(n).padStart(2, '0');

const getDefaultDate = () => new Date().toISOString().split('T')[0];

const getDefaultTime = () => {
  const now = new Date();
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

const toiletingTypes = ['Urination', 'Bowel movement', 'Both', 'Accident'];
const locationTypes = ['Home', 'School', 'Community', 'Car', 'Other'];

const isBowelMovementType = (value) => value === 'Bowel movement' || value === 'Both';

const BathroomLogSheet = ({ open, onClose, child }) => {
  const [user] = useAuthState(auth);
  const { childName } = useChildName(child?.id);
  const [bathroomDate, setBathroomDate] = useState(getDefaultDate);
  const [bathroomTime, setBathroomTime] = useState(getDefaultTime);
  const [bathroomType, setBathroomType] = useState(null);
  const [location, setLocation] = useState(null);
  const [consistency, setConsistency] = useState(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setBathroomDate(getDefaultDate());
    setBathroomTime(getDefaultTime());
    setBathroomType(null);
    setLocation(null);
    setConsistency(null);
    setNotes('');
  }, [open, child?.id]);

  useEffect(() => {
    if (!isBowelMovementType(bathroomType)) {
      setConsistency(null);
    }
  }, [bathroomType]);

  const resolvedChildName = childName || child?.name || 'Child';

  const bathroomTimestamp = useMemo(() => {
    const timestamp = new Date(`${bathroomDate}T${bathroomTime}`);
    return Number.isNaN(timestamp.getTime()) ? new Date() : timestamp;
  }, [bathroomDate, bathroomTime]);

  const renderChipGroup = (options, value, onChange) => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {options.map((option) => {
        const selected = value === option;
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

  const selectedConsistency = consistency ? BATHROOM_SCALE[consistency] : null;
  const consistencyMarks = Object.keys(BATHROOM_SCALE).map((value) => ({
    value: Number(value),
    label: value,
  }));
  const consistencyValue = consistency || 3;
  const showConsistencyScale = !bathroomType || isBowelMovementType(bathroomType);
  const handleConsistencyChange = (_, value) => {
    if (!isBowelMovementType(bathroomType)) {
      setBathroomType('Bowel movement');
    }
    setConsistency(value);
  };

  const handleSave = async () => {
    if (!child?.id || !user?.uid) return;

    const summary = [
      bathroomType,
      location ? `at ${location}` : null,
      isBowelMovementType(bathroomType) && consistency
        ? `Consistency: ${BATHROOM_SCALE[consistency]?.label || consistency}`
        : null,
    ].filter(Boolean).join(' — ');

    setSaving(true);
    try {
      const docData = {
        childId: child.id,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        title: 'Bathroom',
        titlePrefix: 'Bathroom',
        text: summary || 'Bathroom logged',
        status: 'active',
        category: 'bathroom',
        tags: ['bathroom', bathroomType?.toLowerCase()].filter(Boolean),
        timestamp: bathroomTimestamp,
        entryDate: new Date(bathroomDate).toDateString(),
        authorId: user.uid,
        authorName: user.displayName || user.email?.split('@')[0] || 'User',
        authorEmail: user.email,
        source: 'bathroom_log',
        notes,
        bathroomDetails: {
          type: bathroomType,
          location,
          consistency: isBowelMovementType(bathroomType) ? consistency : null,
          consistencyLabel: isBowelMovementType(bathroomType) ? BATHROOM_SCALE[consistency]?.label || null : null,
          notes,
        },
      };

      const docRef = await addDoc(collection(db, 'dailyLogs'), docData);

      window.dispatchEvent(new CustomEvent('captureez:timeline-entry-created', {
        detail: {
          id: docRef.id,
          collection: 'dailyLogs',
          ...docData,
        },
      }));

      window.dispatchEvent(new CustomEvent('captureez:timeline-focus-date', {
        detail: {
          childId: child.id,
          date: bathroomTimestamp.toISOString(),
        },
      }));

      onClose?.();
    } catch (error) {
      console.error('Error saving bathroom log:', error);
    } finally {
      setSaving(false);
    }
  };

  const formBody = (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          fullWidth
          type="date"
          label="Date"
          value={bathroomDate}
          onChange={(e) => setBathroomDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 0 }}
        />
        <TextField
          fullWidth
          type="time"
          label="Time"
          value={bathroomTime}
          onChange={(e) => setBathroomTime(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 0 }}
        />
      </Stack>

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
          Type
        </Typography>
        {renderChipGroup(toiletingTypes, bathroomType, setBathroomType)}
      </Box>

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
          Location
        </Typography>
        {renderChipGroup(locationTypes, location, setLocation)}
      </Box>

      {showConsistencyScale ? (
        <Box>
          <Slider
            value={consistencyValue}
            onChange={handleConsistencyChange}
            min={1}
            max={7}
            step={1}
            marks={consistencyMarks}
            sx={{
              mt: 0.5,
              mb: 2,
              color: selectedConsistency?.color || '#CBD5E1',
              '& .MuiSlider-thumb': {
                bgcolor: selectedConsistency?.color || '#64748B',
                width: 30,
                height: 30,
                '&:hover, &.Mui-focusVisible': {
                  boxShadow: '0 0 0 8px rgba(100, 116, 139, 0.15)',
                },
              },
              '& .MuiSlider-track': {
                height: 6,
                border: 'none',
              },
              '& .MuiSlider-rail': {
                height: 6,
                opacity: 1,
                bgcolor: 'rgba(148, 163, 184, 0.18)',
              },
              '& .MuiSlider-mark': {
                width: 2,
                height: 2,
                borderRadius: '50%',
                bgcolor: 'currentColor',
              },
              '& .MuiSlider-markLabel': {
                fontSize: '0.8rem',
                fontWeight: 600,
                mt: 1.5,
              },
              '& .MuiSlider-markLabelActive': {
                color: selectedConsistency?.color || 'text.primary',
              },
            }}
          />
          <Box
            sx={{
              bgcolor: selectedConsistency?.color
                ? `${selectedConsistency.color}18`
                : 'primary.light',
              borderRadius: 2,
              p: 2,
              mt: 3,
              textAlign: 'center',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 800,
                color: selectedConsistency?.color || 'primary.dark',
              }}
            >
              {selectedConsistency ? selectedConsistency.label : 'Select a consistency level'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {selectedConsistency
                ? selectedConsistency.description
                : 'Pick the stool form that best matches the bowel movement.'}
            </Typography>
          </Box>
        </Box>
      ) : null}

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
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <Button fullWidth variant="outlined" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={handleSave}
          disabled={saving || !child?.id || !user?.uid}
        >
          {saving ? 'Saving...' : 'Save bathroom log'}
        </Button>
      </Box>
    </>
  );

  return (
    <LogFormShell
      open={open}
      onClose={onClose}
      title={`Log Bathroom for ${resolvedChildName}`}
      subtitle="Child-specific bathroom and toileting tracking"
      footer={footerActions}
      mobileBreakpoint="md"
      maxWidth="sm"
    >
      {formBody}
    </LogFormShell>
  );
};

export default BathroomLogSheet;
