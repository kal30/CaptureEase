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
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import LogFormShell from '../UI/LogFormShell';
import LogDateField from '../UI/LogDateField';
import LogTimeField from '../UI/LogTimeField';
import BristolStoolScaleSelector from '../UI/BristolStoolScaleSelector';
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
  const [datePickerAnchor, setDatePickerAnchor] = useState(null);

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

  const bathroomDateObject = useMemo(() => {
    const parsed = new Date(`${bathroomDate}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }, [bathroomDate]);

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

    setBathroomDate([
      nextDate.getFullYear(),
      String(nextDate.getMonth() + 1).padStart(2, '0'),
      String(nextDate.getDate()).padStart(2, '0'),
    ].join('-'));
    handleDatePickerClose();
  };

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

  const showConsistencyScale = !bathroomType || isBowelMovementType(bathroomType);
  const handleConsistencyChange = (nextValue) => {
    if (!isBowelMovementType(bathroomType)) {
      setBathroomType('Bowel movement');
    }
    setConsistency(nextValue);
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
          <Stack direction="row" spacing={1.25} sx={{ width: '100%' }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <LogDateField
                label="Date"
                value={formatDisplayDate(bathroomDateObject)}
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
                  value={bathroomDateObject}
                  onChange={handleDateChange}
                  maxDate={new Date()}
                />
              </Popover>
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <LogTimeField
                label="Time"
                value={bathroomTime}
                onChange={(e) => setBathroomTime(e.target.value)}
              />
            </Box>
          </Stack>
        </Box>

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
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
              Bristol stool scale
            </Typography>
            <BristolStoolScaleSelector value={consistency} onChange={handleConsistencyChange} />
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
          {saving ? 'Saving...' : 'Save bathroom log'}
        </Button>
      </Box>
    </>
  );

  return (
    <LogFormShell
      open={open}
      onClose={onClose}
      title="Bathroom"
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

export default BathroomLogSheet;
