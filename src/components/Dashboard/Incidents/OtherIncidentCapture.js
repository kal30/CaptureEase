import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Popover,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useTheme } from '@mui/material/styles';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../services/firebase';
import {
  addIncident,
  checkForCategorySuggestion,
} from '../../../services/incidentService';
import { saveBehaviorIncident } from '../../../services/behaviorIncidentService';
import { getTimelineEntries } from '../../../services/timelineService';
import { useAsyncForm } from '../../../hooks/useAsyncForm';
import CategoryCreationModal from '../CategoryCreationModal';
import { incidentTheme } from './incidentTheme';
import colors from '../../../assets/theme/colors';
import LogDateField from '../../UI/LogDateField';
import LogTimeField from '../../UI/LogTimeField';

const TRIGGER_GROUPS = [
  {
    key: 'medication_timing',
    label: 'Medication timing',
  },
  {
    key: 'food_dietary',
    label: 'Food / Dietary',
  },
  {
    key: 'activity_people',
    label: 'Activity / Therapist / People',
  },
  {
    key: 'sleep_quality',
    label: 'Sleep quality',
  },
  {
    key: 'sensory_environment',
    label: 'Sensory / Environment',
  },
  {
    key: 'other',
    label: 'Other',
  },
];

const SEVERITY_PRESETS = [
  {
    key: 'low',
    label: 'Low',
    value: 2,
    description: 'Mild concern',
    bg: '#EAF7EE',
    border: '#B9E3C6',
    text: '#25603B',
  },
  {
    key: 'moderate',
    label: 'Moderate',
    value: 5,
    description: 'Noticeable issue',
    bg: '#FFF6DB',
    border: '#F2D98B',
    text: '#8A5A00',
  },
  {
    key: 'high',
    label: 'High',
    value: 6,
    description: 'Significant impact',
    bg: incidentTheme.severityHigh,
    border: '#F2C08F',
    text: incidentTheme.severityText,
  },
  {
    key: 'critical',
    label: 'Critical',
    value: 9,
    description: 'Urgent help needed',
    bg: '#FECACA',
    border: '#F59CA3',
    text: '#8C1D18',
  },
];

const formatTimeLabel = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
};

const toDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value?.toDate === 'function') return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getLocalDayKey = (date) => {
  const target = toDate(date) || new Date();
  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const day = String(target.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDisplayText = (entry) => {
  const title = String(entry?.title || entry?.content || entry?.notes || 'Entry').trim();
  if (!title) return 'Entry';

  const withoutPrefix = title.includes(':') ? title.split(':').slice(1).join(':').trim() : title;
  return withoutPrefix || title;
};

const buildContextSummary = (entry) => {
  const label = getDisplayText(entry);
  const timeLabel = formatTimeLabel(toDate(entry?.timestamp));

  if (!timeLabel) {
    return label;
  }

  if (label.includes('@')) {
    return label;
  }

  return `${label} @ ${timeLabel}`;
};

const getClosestEntry = (entries, predicate, incidentTime, maxMinutes = Infinity) => {
  const matches = entries
    .map((entry) => ({
      entry,
      date: toDate(entry.timestamp),
    }))
    .filter(({ entry, date }) => date && predicate(entry))
    .filter(({ date }) => date <= incidentTime)
    .map(({ entry, date }) => ({
      entry,
      date,
      diffMinutes: Math.round((incidentTime - date) / 60000),
    }))
    .filter(({ diffMinutes }) => diffMinutes >= 0 && diffMinutes <= maxMinutes)
    .sort((a, b) => a.diffMinutes - b.diffMinutes);

  return matches[0] || null;
};

const getSleepEntry = (entries, incidentTime) => {
  const matches = entries
    .map((entry) => ({
      entry,
      date: toDate(entry.timestamp),
    }))
    .filter(({ entry, date }) => date && (entry.type === 'sleep' || /sleep/i.test(`${entry.title || ''} ${entry.content || ''}`)))
    .filter(({ date }) => date <= incidentTime)
    .map(({ entry, date }) => ({
      entry,
      date,
      diffMinutes: Math.round((incidentTime - date) / 60000),
    }))
    .filter(({ diffMinutes }) => diffMinutes >= 0 && diffMinutes <= 24 * 60)
    .sort((a, b) => a.diffMinutes - b.diffMinutes);

  return matches[0] || null;
};

const buildContextItems = (entries, incidentTime) => {
  const medication = getClosestEntry(
    entries,
    (entry) => entry.type === 'medication' || /med/i.test(`${entry.title || ''} ${entry.content || ''}`),
    incidentTime,
    180
  );
  const food = getClosestEntry(
    entries,
    (entry) => entry.type === 'food' || /food|meal|snack|eat/i.test(`${entry.title || ''} ${entry.content || ''}`),
    incidentTime,
    360
  );
  const activity = getClosestEntry(
    entries,
    (entry) => entry.type === 'activity' || /activity|therapy|outing|people/i.test(`${entry.title || ''} ${entry.content || ''}`),
    incidentTime,
    360
  );
  const sleep = getSleepEntry(entries, incidentTime);

  return [
    medication && {
      key: 'medication',
      label: 'Medications logged',
      value: buildContextSummary(medication.entry),
      note: medication.diffMinutes <= 60
        ? `Timing signal: Medication given ${medication.diffMinutes} min before incident`
        : `Medication logged ${medication.diffMinutes} min before incident`,
    },
    food && {
      key: 'food',
      label: 'Food logged',
      value: buildContextSummary(food.entry),
      note: food.diffMinutes <= 120
        ? `Food logged ${food.diffMinutes} min before incident`
        : `Food logged earlier today`,
    },
    activity && {
      key: 'activity',
      label: 'Activity logged',
      value: buildContextSummary(activity.entry),
      note: activity.diffMinutes <= 120
        ? `Activity happened ${activity.diffMinutes} min before incident`
        : `Activity earlier today`,
    },
    sleep && {
      key: 'sleep',
      label: 'Sleep last night',
      value: buildContextSummary(sleep.entry),
      note: `Sleep logged ${sleep.diffMinutes} min before incident`,
    },
  ].filter(Boolean);
};

const buildFallbackContextSnapshot = (items = [], insight = '') => {
  const medications = items.find((item) => item.key === 'medication');
  const food = items.find((item) => item.key === 'food');
  const activity = items.find((item) => item.key === 'activity');
  const sleep = items.find((item) => item.key === 'sleep');

  return {
    medicationsTaken: medications?.value ? [medications.value] : ['Not logged yet'],
    foodLogged: food?.value || 'Not logged yet',
    activities: activity?.value ? [activity.value] : ['Not logged yet'],
    sleepQuality: sleep?.value || 'Not logged yet',
    dataCompleteness: {
      hasMedicationData: Boolean(medications),
      hasFoodData: Boolean(food),
      hasActivityData: Boolean(activity),
      hasSleepData: Boolean(sleep),
    },
    patternInsight: insight || 'Timing signal: No clear same-day pattern yet',
  };
};

const OtherIncidentCapture = ({
  childId,
  childName,
  onSaved,
  onCategoryCreated,
  isCustomCategory = false,
  customCategoryType = null,
  incidentTypeOverride = null,
}) => {
  const theme = useTheme();
  const [user] = useAuthState(auth);
  const [incidentName, setIncidentName] = useState('');
  const [severity, setSeverity] = useState(5);
  const [notes, setNotes] = useState('');
  const [incidentDateTime, setIncidentDateTime] = useState(new Date());
  const [datePickerAnchor, setDatePickerAnchor] = useState(null);
  const [selectedTriggers, setSelectedTriggers] = useState([]);
  const [timelineEntries, setTimelineEntries] = useState([]);
  const [showMoreContext, setShowMoreContext] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categorySuggestion, setCategorySuggestion] = useState(null);

  const incidentForm = useAsyncForm({
    validate: ({ incidentName: inputName, isCustomCategory: custom }) => {
      if (!custom && !incidentTypeOverride && !inputName?.trim()) {
        throw new Error('Please enter what happened');
      }
    },
  });

  useEffect(() => {
    if (!childId) return undefined;

    const unsubscribe = getTimelineEntries(childId, (entries) => {
      setTimelineEntries(entries || []);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [childId]);

  const incidentTime = useMemo(
    () => (incidentDateTime instanceof Date ? incidentDateTime : new Date()),
    [incidentDateTime]
  );
  const selectedSeverityPreset = SEVERITY_PRESETS.find((preset) => preset.value === severity) || SEVERITY_PRESETS[1];

  const contextItems = useMemo(
    () => buildContextItems(timelineEntries, incidentTime),
    [timelineEntries, incidentTime]
  );

  const patternInsight = useMemo(() => {
    const medication = contextItems.find((item) => item.key === 'medication');
    if (medication?.note?.startsWith('Timing signal')) {
      return medication.note;
    }

    const activity = contextItems.find((item) => item.key === 'activity');
    if (activity?.note) {
      return `Timing signal: ${activity.note}`;
    }

    const food = contextItems.find((item) => item.key === 'food');
    if (food?.note) {
      return `Timing signal: ${food.note}`;
    }

    return 'Timing signal: No clear same-day pattern yet';
  }, [contextItems]);

  const canSave = isCustomCategory || Boolean(incidentTypeOverride) || incidentName.trim().length > 0;

  const handleSave = () => {
    incidentForm.submitForm(
      async () => {
        const triggerText = selectedTriggers
          .map((triggerKey) => TRIGGER_GROUPS.find((group) => group.key === triggerKey)?.label)
          .filter(Boolean)
          .join(', ');

        const isBehaviorFlow = incidentTypeOverride === 'behavioral' || incidentTypeOverride === 'behavior';
        const incidentTimestamp = new Date(incidentTime);
        const incidentData = {
          type: isCustomCategory
            ? customCategoryType
            : (incidentTypeOverride || 'other'),
          customIncidentName: isCustomCategory ? '' : incidentName.trim(),
          severity,
          remedy: triggerText || 'General observation and monitoring',
          triggerSummary: triggerText,
          suspectedTriggers: selectedTriggers,
          notes: notes.trim(),
          description: incidentName.trim() || notes.trim(),
          incidentDateTime: incidentTimestamp.toISOString(),
          incidentDayKey: getLocalDayKey(incidentTimestamp),
          entryDateLabel: incidentTimestamp.toDateString(),
          authorId: user?.uid,
          authorName: user?.displayName || user?.email?.split('@')[0] || 'User',
          authorEmail: user?.email,
        };

        if (isBehaviorFlow) {
          const savedEntry = await saveBehaviorIncident({
            childId,
            incidentData,
            userId: user?.uid,
            fallbackContextSnapshot: buildFallbackContextSnapshot(contextItems, patternInsight),
          });

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('captureez:timeline-entry-created', {
              detail: {
                ...savedEntry.entry,
                timestamp: incidentTimestamp,
                childId,
              },
            }));

            window.dispatchEvent(new CustomEvent('captureez:timeline-refresh', {
              detail: {
                childId,
                entryId: savedEntry.id,
                timestamp: incidentTimestamp,
                collection: 'dailyLogs',
              },
            }));
          }

          onSaved();
          return;
        } else {
          await addIncident(childId, incidentData, true, childName || 'child');
        }

        if (!isCustomCategory && !incidentTypeOverride) {
          const suggestionCheck = await checkForCategorySuggestion(childId, incidentName.trim());

          if (suggestionCheck.shouldSuggest) {
            setCategorySuggestion(suggestionCheck.suggestion);
            setShowCategoryModal(true);
            return;
          }
        }

        onSaved();
      },
      { incidentName, isCustomCategory }
    );
  };

  const handleCategoryCreated = () => {
    setShowCategoryModal(false);
    setCategorySuggestion(null);

    if (onCategoryCreated) {
      onCategoryCreated();
    }

    onSaved();
  };

  const handleCategoryModalClose = () => {
    setShowCategoryModal(false);
    setCategorySuggestion(null);
    onSaved();
  };

  const toggleTrigger = (triggerKey) => {
    setSelectedTriggers((current) =>
      current.includes(triggerKey)
        ? current.filter((item) => item !== triggerKey)
        : [...current, triggerKey]
    );
  };

  const updateIncidentTime = (nextTimeValue) => {
    const nextDate = new Date(incidentTime);
    const [hours, minutes] = String(nextTimeValue || '00:00')
      .split(':')
      .map((value) => Number(value));

    nextDate.setHours(Number.isFinite(hours) ? hours : 0, Number.isFinite(minutes) ? minutes : 0, 0, 0);
    setIncidentDateTime(nextDate);
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

  const dateFieldValue = formatDisplayDate(incidentTime);
  const timeFieldValue = `${String(incidentTime.getHours()).padStart(2, '0')}:${String(incidentTime.getMinutes()).padStart(2, '0')}`;
  const visibleContextItems = showMoreContext ? contextItems : contextItems.slice(0, 3);
  const saveLabel = incidentForm.loading ? 'Saving...' : 'Save incident';

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

    const nextDateTime = new Date(incidentTime);
    nextDateTime.setFullYear(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate());
    setIncidentDateTime(nextDateTime);
    setDatePickerAnchor(null);
  };

  return (
    <Box
      sx={{
        minHeight: '100%',
        bgcolor: incidentTheme.header,
        px: { xs: 1.5, sm: 2 },
        py: { xs: 1.5, sm: 2 },
      }}
    >
      {incidentForm.error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => incidentForm.clearError()}>
          {incidentForm.error}
        </Alert>
      )}

      <Stack spacing={2.5}>
        <Box
          sx={{
            p: { xs: 1.1, sm: 1.25 },
            borderRadius: '24px',
            bgcolor: colors.brand.ice,
            border: `1px solid ${colors.brand.tint}`,
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{
              width: '100%',
              alignItems: 'stretch',
            }}
          >
            <Box sx={{ flex: 1.05, minWidth: 0 }}>
              <LogDateField
                label="Date"
                value={dateFieldValue}
                onClick={handleDatePickerOpen}
              />
            </Box>
            <Box sx={{ flex: 0.95, minWidth: 0 }}>
              <LogTimeField
                label="Time"
                value={timeFieldValue}
                onChange={(event) => updateIncidentTime(event.target.value)}
              />
            </Box>
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
                value={incidentTime}
                onChange={handleDateChange}
              />
            </LocalizationProvider>
          </Popover>
        </Box>

        <Box sx={{ px: 0 }}>
          <TextField
            fullWidth
            multiline
            minRows={3}
            maxRows={8}
            value={incidentName}
            onChange={(event) => setIncidentName(event.target.value)}
            placeholder="What happened?"
            sx={{
              mt: 0,
            }}
          />
        </Box>

        <Box>
          <Typography variant="caption" sx={{ mb: 0.5, display: 'block', fontWeight: 700, letterSpacing: '0.02em' }}>
            Severity
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, color: theme.palette.text.secondary }}>
            {selectedSeverityPreset.label} - {selectedSeverityPreset.description}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: 1.25, overflowX: 'auto', pb: 0.5, WebkitOverflowScrolling: 'touch' }}>
            {SEVERITY_PRESETS.map((preset) => {
              const selected = severity === preset.value;
              return (
                <Chip
                  key={preset.key}
                  clickable
                  onClick={() => setSeverity(preset.value)}
                  label={preset.label}
                  sx={{
                    minWidth: 96,
                    flexShrink: 0,
                    borderRadius: 999,
                    px: 1.5,
                    py: 2.2,
                    fontWeight: 800,
                    bgcolor: selected ? preset.bg : 'rgba(255,255,255,0.7)',
                    color: selected ? preset.text : theme.palette.text.primary,
                    border: `1px solid ${selected ? preset.border : incidentTheme.border}`,
                    '&:hover': {
                      bgcolor: selected ? preset.bg : 'rgba(255,255,255,0.95)',
                    },
                  }}
                />
              );
            })}
          </Box>
        </Box>

        <Box
          sx={{
            px: 0,
            py: { xs: 2, sm: 2.25 },
            bgcolor: incidentTheme.context,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.25, color: '#184D83' }}>
            Context from today
          </Typography>
          <Typography sx={{ fontWeight: 700, color: '#184D83', mb: 1.5 }}>
            ⚠ {patternInsight}
          </Typography>

          {visibleContextItems.length > 0 ? (
            <Stack spacing={1.5}>
              {visibleContextItems.map((item) => (
                <Box key={item.key} sx={{ pb: 1.25, borderBottom: '1px solid rgba(17, 24, 39, 0.08)' }}>
                  <Typography sx={{ fontWeight: 800, mb: 0.25, color: '#184D83' }}>
                    {item.label}
                  </Typography>
                  <Typography sx={{ color: '#1D5EA6', fontWeight: 500 }}>
                    {item.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#3B82F6', mt: 0.25 }}>
                    {item.note}
                  </Typography>
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography sx={{ color: '#1D5EA6' }}>
              No earlier logs found for today yet.
            </Typography>
          )}

          {contextItems.length > 3 ? (
            <Button
              variant="text"
              onClick={() => setShowMoreContext((value) => !value)}
              sx={{ mt: 1.25, px: 0, fontWeight: 700, color: '#1D5EA6' }}
            >
              {showMoreContext ? 'Show less context' : 'Show more context'}
            </Button>
          ) : null}
        </Box>

        <Box
          sx={{
            px: 0,
            py: { xs: 2, sm: 2.25 },
            bgcolor: incidentTheme.triggers,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.25, color: '#8A264B' }}>
            What might have triggered this?
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: 1.25, overflowX: 'auto', pb: 0.5, WebkitOverflowScrolling: 'touch' }}>
            {TRIGGER_GROUPS.map((group) => {
              const selected = selectedTriggers.includes(group.key);
              return (
                <Chip
                  key={group.key}
                  clickable
                  onClick={() => toggleTrigger(group.key)}
                  label={group.label}
                  sx={{
                    borderRadius: 999,
                    px: 1.5,
                    py: 2.2,
                    fontWeight: 700,
                    flexShrink: 0,
                    bgcolor: selected ? '#F7B8CC' : 'rgba(255,255,255,0.55)',
                    color: selected ? '#7B2248' : '#8A264B',
                    border: `1px solid ${selected ? '#F07AA8' : 'rgba(123, 34, 72, 0.2)'}`,
                    '&:hover': {
                      bgcolor: selected ? '#F7B8CC' : 'rgba(255,255,255,0.8)',
                    },
                  }}
                />
              );
            })}
          </Box>

          <TextField
            fullWidth
            multiline
            minRows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Additional notes..."
            sx={{
              mt: 2,
            }}
          />
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            mt: 0.25,
            pb: 0.5,
          }}
        >
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!canSave || incidentForm.loading}
            startIcon={incidentForm.loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              minHeight: 52,
              borderRadius: 3,
              bgcolor: incidentTheme.save,
              color: '#FFFFFF',
              '&:hover': {
                bgcolor: incidentTheme.saveHover,
              },
              '&.Mui-disabled': {
                bgcolor: incidentTheme.save,
                opacity: 0.55,
                color: '#FFFFFF',
              },
            }}
          >
            {saveLabel}
          </Button>
        </Box>
      </Stack>

      <CategoryCreationModal
        open={showCategoryModal}
        onClose={handleCategoryModalClose}
        childId={childId}
        suggestion={categorySuggestion}
        onCategoryCreated={handleCategoryCreated}
      />
    </Box>
  );
};

export default OtherIncidentCapture;
