import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import LogFormShell from '../../../components/UI/LogFormShell';
import { normalizeMedicationDetail } from '../../../components/Dashboard/shared/childMedicationHelpers';
import { db } from '../../../services/firebase';
import colors from '../../../assets/theme/colors';

const todayKey = new Date().toDateString();

const parseTimeToMinutes = (timeValue) => {
  if (!timeValue) {
    return null;
  }

  const [hours, minutes] = timeValue.split(':').map((value) => Number(value));
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
};

const formatTimeLabel = (timeValue) => {
  if (!timeValue) {
    return 'Anytime';
  }

  const [hours, minutes] = timeValue.split(':').map((value) => Number(value));
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return timeValue;
  }

  const preview = new Date();
  preview.setHours(hours, minutes, 0, 0);
  return preview.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
};

const buildEventKey = (medicationId, scheduleId, scheduleIndex, scheduleTime) => (
  [medicationId, scheduleId || scheduleIndex, scheduleTime || 'anytime'].join(':')
);

const getStatusMeta = (status) => {
  switch (status) {
    case 'taken':
      return {
        label: 'Taken',
        bg: 'rgba(198, 239, 222, 0.92)',
        color: '#166534',
        border: 'rgba(134, 239, 172, 0.55)',
      };
    case 'missed':
      return {
        label: 'Missed',
        bg: 'rgba(254, 226, 226, 0.95)',
        color: '#b91c1c',
        border: 'rgba(248, 113, 113, 0.48)',
      };
    default:
      return {
        label: 'Due',
        bg: 'rgba(244, 241, 248, 0.9)',
        color: '#4b5563',
        border: 'rgba(217, 209, 238, 0.9)',
      };
  }
};

const MedicationRow = ({
  event,
  onMarkTaken,
  savingKey,
}) => {
  const statusMeta = getStatusMeta(event.status);
  const isTaken = event.status === 'taken';
  const isSaving = savingKey === event.eventKey;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        justifyContent: 'space-between',
        gap: 1,
        px: { xs: 1.25, sm: 1.5 },
        py: 1.1,
        borderRadius: 3,
        bgcolor: '#fff',
        border: '1px solid rgba(217, 209, 238, 0.42)',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
      }}
    >
      <Box sx={{ minWidth: 0, flex: '1 1 auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
          <Typography sx={{ fontWeight: 800, lineHeight: 1.15, color: '#2f3440' }}>
            {event.timeLabel}
          </Typography>
          <Chip
            label={statusMeta.label}
            size="small"
            sx={{
              height: 22,
              borderRadius: 999,
              bgcolor: statusMeta.bg,
              color: statusMeta.color,
              border: `1px solid ${statusMeta.border}`,
              fontSize: '0.68rem',
              fontWeight: 800,
              '& .MuiChip-label': {
                px: 0.8,
              },
            }}
          />
        </Box>

        <Typography sx={{ mt: 0.5, fontWeight: 750, lineHeight: 1.2, color: '#111827' }}>
          {event.medicationName}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.15, lineHeight: 1.25 }}>
          {[event.dose, event.unit].filter(Boolean).join(' ').trim() || 'Dose not set'}
        </Typography>
      </Box>

      <Button
        type="button"
        variant={isTaken ? 'outlined' : 'contained'}
        disabled={isTaken || isSaving}
        onClick={() => onMarkTaken(event)}
        sx={{
          flex: '0 0 auto',
          minHeight: 42,
          borderRadius: 999,
          textTransform: 'none',
          whiteSpace: 'nowrap',
          px: 1.6,
          fontWeight: 800,
          bgcolor: isTaken ? 'rgba(198, 239, 222, 0.92)' : '#D9D1EE',
          color: isTaken ? '#166534' : '#4b3f73',
          borderColor: isTaken ? 'rgba(134, 239, 172, 0.55)' : 'rgba(217, 209, 238, 0.92)',
          boxShadow: 'none',
          '&:hover': {
            bgcolor: isTaken ? 'rgba(198, 239, 222, 0.92)' : '#cec2eb',
            boxShadow: 'none',
          },
        }}
      >
        {isTaken ? 'Taken' : isSaving ? 'Saving…' : 'Mark taken'}
      </Button>
    </Box>
  );
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
  const [loading, setLoading] = useState(false);
  const [savingKey, setSavingKey] = useState(null);
  const [loggedEvents, setLoggedEvents] = useState({});

  useEffect(() => {
    let active = true;

    const loadLoggedEvents = async () => {
      if (!open || !childId) {
        setLoggedEvents({});
        return;
      }

      setLoading(true);
      try {
        const q = query(
          collection(db, 'dailyLogs'),
          where('childId', '==', childId),
          where('category', '==', 'medication'),
          where('source', '==', 'medication_schedule_log')
        );
        const snapshot = await getDocs(q);
        const nextMap = {};

        snapshot.forEach((logDoc) => {
          const data = logDoc.data() || {};
          if (data.entryDate !== todayKey) {
            return;
          }

          const key = data.medicationScheduleKey || buildEventKey(
            data.medicationId,
            data.medicationScheduleId,
            data.medicationScheduleIndex,
            data.medicationScheduleTime
          );
          nextMap[key] = { id: logDoc.id, ...data };
        });

        if (active) {
          setLoggedEvents(nextMap);
        }
      } catch (error) {
        console.error('Error loading daily medication logs:', error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadLoggedEvents();
    return () => {
      active = false;
    };
  }, [open, childId, medications]);

  const scheduledEvents = useMemo(() => {
    const nowMinutes = (() => {
      const now = new Date();
      return now.getHours() * 60 + now.getMinutes();
    })();

    const events = (Array.isArray(medications) ? medications : [])
      .filter((medication) => !medication.isArchived)
      .map((medication) => normalizeMedicationDetail(medication))
      .filter((medication) => medication.name)
      .flatMap((medication) => {
        const schedules = Array.isArray(medication.schedules) && medication.schedules.length
          ? medication.schedules
          : [];

        return schedules.map((schedule, scheduleIndex) => {
          const timeMinutes = parseTimeToMinutes(schedule.time);
          const eventKey = buildEventKey(medication.id, schedule.id, scheduleIndex, schedule.time);
          const isLogged = Boolean(loggedEvents[eventKey]);
          const isFuture = timeMinutes !== null ? timeMinutes > nowMinutes : false;

          return {
            eventKey,
            medicationId: medication.id,
            scheduleId: schedule.id || `${scheduleIndex}`,
            scheduleIndex,
            time: schedule.time || '',
            timeLabel: formatTimeLabel(schedule.time),
            timeMinutes: timeMinutes ?? Number.MAX_SAFE_INTEGER,
            medicationName: medication.name,
            dose: schedule.dose || medication.dose || '',
            unit: schedule.unit || medication.unit || 'mg',
            status: isLogged ? 'taken' : (isFuture ? 'due' : 'missed'),
          };
        });
      })
      .sort((a, b) => a.timeMinutes - b.timeMinutes || a.medicationName.localeCompare(b.medicationName));

    return events;
  }, [loggedEvents, medications]);

  const groupedEvents = useMemo(() => {
    const groups = [];
    scheduledEvents.forEach((event) => {
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.time === event.timeLabel) {
        lastGroup.events.push(event);
        return;
      }
      groups.push({
        time: event.timeLabel,
        events: [event],
      });
    });
    return groups;
  }, [scheduledEvents]);

  const handleMarkTaken = async (event) => {
    if (!childId || !user?.uid || loggedEvents[event.eventKey] || savingKey === event.eventKey) {
      return;
    }

    setSavingKey(event.eventKey);
    try {
      const now = new Date();
      const loggedDocData = {
        childId,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        status: 'active',
        category: 'medication',
        source: 'medication_schedule_log',
        text: `Gave ${event.medicationName} ${[event.dose, event.unit].filter(Boolean).join(' ').trim()}`.trim(),
        timestamp: now,
        timestampUtc: now.toISOString(),
        entryDate: todayKey,
        authorId: user.uid,
        authorName: user.displayName || user.email?.split('@')[0] || 'User',
        authorEmail: user.email,
        medicationId: event.medicationId,
        medicationScheduleId: event.scheduleId,
        medicationScheduleIndex: event.scheduleIndex,
        medicationScheduleKey: event.eventKey,
        medicationScheduleTime: event.time,
        medicationScheduleDose: event.dose,
        medicationScheduleUnit: event.unit,
        medicationName: event.medicationName,
      };

      const docRef = await addDoc(collection(db, 'dailyLogs'), loggedDocData);
      setLoggedEvents((current) => ({
        ...current,
        [event.eventKey]: { id: docRef.id, ...loggedDocData },
      }));
      onSaved?.({
        eventKey: event.eventKey,
        medicationName: event.medicationName,
        time: event.timeLabel,
      });
      window.dispatchEvent(new CustomEvent('captureez:timeline-entry-created', {
        detail: {
          id: docRef.id,
          collection: 'dailyLogs',
          childId,
          ...loggedDocData,
        },
      }));
    } catch (error) {
      console.error('Error logging medication dose:', error);
    } finally {
      setSavingKey(null);
    }
  };

  const eventCount = scheduledEvents.length;

  return (
    <LogFormShell
      open={open}
      onClose={onClose}
      title="Medication log"
      subtitle={childName ? `${childName} • today's scheduled doses` : "Today's scheduled doses"}
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
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            px: 0.25,
          }}
        >
          <Typography sx={{ fontWeight: 800, color: '#2f3440' }}>
            {eventCount > 0 ? `${eventCount} scheduled doses today` : 'No scheduled doses today'}
          </Typography>
          <Chip
            label={loading ? 'Loading…' : 'Today'}
            size="small"
            sx={{
              height: 24,
              borderRadius: 999,
              bgcolor: 'rgba(244, 241, 248, 0.82)',
              color: colors.brand.deep,
              border: '1px solid rgba(217, 209, 238, 0.75)',
              fontWeight: 700,
            }}
          />
        </Box>

        {groupedEvents.length > 0 ? (
          <Stack spacing={1.15}>
            {groupedEvents.map((group) => (
              <Box key={group.time} sx={{ minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75, px: 0.25 }}>
                  <Typography sx={{ fontWeight: 800, color: colors.brand.navy }}>
                    {group.time}
                  </Typography>
                  <Chip
                    label={`${group.events.length} dose${group.events.length === 1 ? '' : 's'}`}
                    size="small"
                    sx={{
                      height: 22,
                      borderRadius: 999,
                      bgcolor: 'rgba(236, 232, 245, 0.95)',
                      color: colors.brand.deep,
                      border: '1px solid rgba(217, 209, 238, 0.9)',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      '& .MuiChip-label': {
                        px: 0.8,
                      },
                    }}
                  />
                </Box>

                <Stack spacing={0.85}>
                  {group.events.map((event) => (
                    <MedicationRow
                      key={event.eventKey}
                      event={event}
                      onMarkTaken={handleMarkTaken}
                      savingKey={savingKey}
                    />
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        ) : (
          <Box
            sx={{
              py: 6,
              px: 2,
              textAlign: 'center',
              borderRadius: 3,
              bgcolor: 'rgba(244, 241, 248, 0.55)',
              border: '1px solid rgba(217, 209, 238, 0.45)',
            }}
          >
            <Typography sx={{ fontWeight: 800, color: '#2f3440', mb: 0.5 }}>
              Nothing scheduled yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add dosage times to your medications to build today&apos;s log.
            </Typography>
          </Box>
        )}
      </Stack>
    </LogFormShell>
  );
};

export default BulkMedicationLogDialog;
