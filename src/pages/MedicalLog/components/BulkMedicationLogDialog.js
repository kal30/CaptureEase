import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { addDoc, collection, doc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import LogFormShell from '../../../components/UI/LogFormShell';
import { normalizeMedicationDetail } from '../../../components/Dashboard/shared/childMedicationHelpers';
import { auth, db } from '../../../services/firebase';
import { fetchMedications } from '../../../services/medicationService';
import colors from '../../../assets/theme/colors';
import MedicationBackfillDialog from './MedicationBackfillDialog';
import MedicationDuplicateWarningDialog from './MedicationDuplicateWarningDialog';
import {
  detectPossibleMedicationDuplicate,
  getMedicationLogDateKey,
  normalizeMedicationLogRecord,
} from '../../../services/medicationLogDuplicateService';

const todayKey = getMedicationLogDateKey(new Date());
const getMedicationTakenStorageKey = (childId) => `captureez:medication-log:${childId || 'unknown'}:${todayKey}`;
const medicationTakenMemoryCache = typeof window !== 'undefined'
  ? (window.__captureezMedicationTakenCache || (window.__captureezMedicationTakenCache = {}))
  : {};

const getCachedTakenEvents = (childId) => {
  const cacheKey = getMedicationTakenStorageKey(childId);
  const memoryValue = medicationTakenMemoryCache[cacheKey];
  if (memoryValue && typeof memoryValue === 'object') {
    return memoryValue;
  }

  const storedValue = readStoredTakenEvents(childId);
  medicationTakenMemoryCache[cacheKey] = storedValue;
  return storedValue;
};

const setCachedTakenEvents = (childId, nextMap) => {
  const cacheKey = getMedicationTakenStorageKey(childId);
  medicationTakenMemoryCache[cacheKey] = { ...(nextMap || {}) };
  writeStoredTakenEvents(childId, medicationTakenMemoryCache[cacheKey]);
};

const readStoredTakenEvents = (childId) => {
  if (typeof window === 'undefined' || !childId) {
    return {};
  }

  try {
    const cacheKey = getMedicationTakenStorageKey(childId);
    const raw = window.localStorage.getItem(cacheKey) || window.sessionStorage.getItem(cacheKey);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    return {};
  }
};

const writeStoredTakenEvents = (childId, nextMap) => {
  if (typeof window === 'undefined' || !childId) {
    return;
  }

  try {
    const safeMap = Object.keys(nextMap || {}).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    const serialized = JSON.stringify(safeMap);
    const cacheKey = getMedicationTakenStorageKey(childId);
    window.localStorage.setItem(cacheKey, serialized);
    window.sessionStorage.setItem(cacheKey, serialized);
  } catch (error) {
    // Ignore storage failures; Firestore writes remain the source of record.
  }
};

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

const MedicationRow = ({
  event,
  onMarkTaken,
  onLogTime,
  onUndo,
  savingKey,
  canMarkTaken,
}) => {
  const isTaken = event.state === 'taken';
  const isMissed = event.state === 'missed';
  const isDue = event.state === 'due';
  const isSaving = savingKey === event.eventKey;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 1.25,
        px: 0.25,
        py: 1,
        borderBottom: '1px solid rgba(217, 209, 238, 0.42)',
        opacity: isTaken ? 0.72 : 1,
      }}
    >
      <Box sx={{ minWidth: 0, flex: '1 1 auto' }}>
        <Typography sx={{ fontWeight: 750, lineHeight: 1.2, color: '#111827' }}>
          {event.medicationName}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.15, lineHeight: 1.25 }}>
          {[event.dose, event.unit].filter(Boolean).join(' ').trim() || 'Dose not set'}
        </Typography>

        {!isTaken ? (
          <Typography
            variant="caption"
            sx={{
              display: 'inline-flex',
              mt: 0.4,
              color: isMissed ? '#b91c1c' : '#4b5563',
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            {isMissed ? 'Missed' : isDue ? 'Due' : ''}
          </Typography>
        ) : null}
        {isTaken && event.takenLate ? (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 0.4,
              color: '#6b7280',
              fontWeight: 600,
              lineHeight: 1.1,
            }}
          >
            taken late
          </Typography>
        ) : null}
      </Box>

      <Stack direction="row" spacing={0.75} sx={{ flexShrink: 0, alignItems: 'center' }}>
        {isTaken ? (
          <>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 800,
                color: '#166534',
                whiteSpace: 'nowrap',
              }}
            >
              ✓ Taken
            </Typography>
            {onUndo ? (
              <Button
                type="button"
                variant="text"
                onClick={() => onUndo(event)}
                sx={{
                  minWidth: 0,
                  px: 0,
                  py: 0,
                  textTransform: 'none',
                  fontWeight: 700,
                  color: '#6b7280',
                  lineHeight: 1,
                  '&:hover': {
                    bgcolor: 'transparent',
                    textDecoration: 'underline',
                  },
                }}
              >
                Undo
              </Button>
            ) : null}
          </>
        ) : null}

        {!isTaken ? (
          <Stack direction="column" spacing={0.35} sx={{ alignItems: 'flex-end' }}>
            <Button
              type="button"
              variant="text"
              disabled={isSaving || !canMarkTaken}
              onClick={() => onMarkTaken(event)}
              sx={{
                minWidth: 0,
                px: 0,
                py: 0,
                textTransform: 'none',
                fontWeight: 800,
                color: '#6f5ea8',
                lineHeight: 1,
                '&:hover': {
                  bgcolor: 'transparent',
                  textDecoration: 'underline',
                },
              }}
            >
              {isSaving ? 'Marking…' : 'Mark'}
            </Button>
            {onLogTime ? (
              <Button
                type="button"
                variant="text"
                disabled={isSaving || !canMarkTaken}
                onClick={() => onLogTime(event)}
                sx={{
                  minWidth: 0,
                  px: 0,
                  py: 0,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  color: '#8b95a7',
                  lineHeight: 1,
                  '&:hover': {
                    bgcolor: 'transparent',
                    textDecoration: 'underline',
                  },
                }}
              >
                Log time
              </Button>
            ) : null}
          </Stack>
        ) : null}
      </Stack>
    </Box>
  );
};

const BulkMedicationLogDialog = ({
  open,
  childId,
  childName,
  medications,
  onClose,
  onSaved,
  user,
}) => {
  const navigate = useNavigate();
  const [authUser] = useAuthState(auth);
  const [loading, setLoading] = useState(false);
  const [medicationLoading, setMedicationLoading] = useState(false);
  const [resolvedMedications, setResolvedMedications] = useState([]);
  const [savingKey, setSavingKey] = useState(null);
  const [loggedEvents, setLoggedEvents] = useState({});
  const [allMedicationLogs, setAllMedicationLogs] = useState([]);
  const [takenKeys, setTakenKeys] = useState(() => getCachedTakenEvents(childId));
  const [showBackfillDialog, setShowBackfillDialog] = useState(false);
  const [timeEntryPreset, setTimeEntryPreset] = useState(null);
  const [duplicatePrompt, setDuplicatePrompt] = useState(null);
  const activeUser = user || authUser;
  const providedMedications = useMemo(() => (
    Array.isArray(medications) ? medications : []
  ), [medications]);

  const handleManageMedications = () => {
    if (onClose) {
      onClose();
    }
    navigate('/dashboard', {
      state: {
        openChildMedicationManager: {
          childId,
        },
      },
    });
  };

  const handleOpenBackfillDialog = () => {
    setTimeEntryPreset(null);
    setShowBackfillDialog(true);
  };

  const handleCloseBackfillDialog = () => {
    setShowBackfillDialog(false);
    setTimeEntryPreset(null);
  };

  const handleOpenTimeEntry = (event) => {
    setTimeEntryPreset({
      medicationId: event.medicationId,
      scheduleId: event.scheduleId,
      status: 'taken',
      initialDate: new Date(),
      initialTime: new Date().toTimeString().slice(0, 5),
    });
    setShowBackfillDialog(true);
  };

  const closeDuplicatePrompt = () => {
    setDuplicatePrompt(null);
  };

  const openDuplicatePrompt = ({ reason, medicationName, existingTimeLabel, onConfirm }) => {
    setDuplicatePrompt({
      reason,
      medicationName,
      existingTimeLabel,
      onConfirm,
    });
  };

  useEffect(() => {
    let active = true;

    const loadActiveMedications = async () => {
      if (!open || !childId) {
        setResolvedMedications([]);
        return;
      }

      if (providedMedications.length > 0) {
        setResolvedMedications(providedMedications);
        return;
      }

      setMedicationLoading(true);
      try {
        const fetched = await fetchMedications(childId, false);
        if (active) {
          setResolvedMedications(Array.isArray(fetched) ? fetched : []);
        }
      } catch (error) {
        console.error('Error loading active medications:', error);
        if (active) {
          setResolvedMedications([]);
        }
      } finally {
        if (active) {
          setMedicationLoading(false);
        }
      }
    };

    loadActiveMedications();
    return () => {
      active = false;
    };
  }, [open, childId, providedMedications]);


  useEffect(() => {
    let active = true;

    const loadLoggedEvents = async () => {
      if (!open || !childId) {
        setLoggedEvents({});
        setAllMedicationLogs([]);
        setTakenKeys({});
        return;
      }

      setTakenKeys(getCachedTakenEvents(childId));

      setLoading(true);
      try {
        const q = query(
          collection(db, 'dailyLogs'),
          where('childId', '==', childId),
        );
        const snapshot = await getDocs(q);
        const nextLogs = [];
        const todayMap = {};

        snapshot.forEach((logDoc) => {
          const data = logDoc.data() || {};
          const normalized = normalizeMedicationLogRecord({ id: logDoc.id, ...data });
          if (normalized.category !== 'medication') {
            return;
          }
          if (normalized.status === 'deleted') {
            return;
          }

          nextLogs.push(normalized);

          if (normalized.dateKey !== todayKey) {
            return;
          }

          const key = buildEventKey(
            normalized.medicationId,
            normalized.medicationScheduleId,
            normalized.medicationScheduleIndex,
            normalized.medicationScheduleTime
          ) || normalized.medicationScheduleKey;
          todayMap[key] = normalized;
        });

        if (active) {
          setAllMedicationLogs(nextLogs);
          setLoggedEvents(todayMap);
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
  }, [open, childId]);

  useEffect(() => {
    if (!open) {
      setShowBackfillDialog(false);
      closeDuplicatePrompt();
    }
  }, [open]);

  useEffect(() => {
    if (!childId) {
      return undefined;
    }

    setCachedTakenEvents(childId, takenKeys);
    return undefined;
  }, [childId, takenKeys]);

  const scheduledEvents = useMemo(() => {
    const nowMinutes = (() => {
      const now = new Date();
      return now.getHours() * 60 + now.getMinutes();
    })();

    const events = (Array.isArray(resolvedMedications) ? resolvedMedications : [])
      .filter((medication) => !medication.isArchived)
      .map((medication, medicationIndex) => normalizeMedicationDetail(
        medication,
        medication.id || `med-${medicationIndex}`
      ))
      .filter((medication) => medication.name)
      .flatMap((medication) => {
        const schedules = Array.isArray(medication.schedules) && medication.schedules.length
          ? medication.schedules
          : [];

        return schedules.map((schedule, scheduleIndex) => {
          const timeMinutes = parseTimeToMinutes(schedule.time);
          const eventKey = buildEventKey(medication.id, schedule.id, scheduleIndex, schedule.time);
          const loggedEvent = loggedEvents[eventKey];
          const isTaken = Boolean(loggedEvent || takenKeys[eventKey]);
          const state = isTaken ? 'taken' : (timeMinutes !== null && timeMinutes < nowMinutes ? 'missed' : 'due');
          const takenLate = Boolean(
            loggedEvent?.takenAt
            && loggedEvent?.scheduledFor
            && new Date(loggedEvent.takenAt).getTime() > new Date(loggedEvent.scheduledFor).getTime()
          );
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
            medicationCategory: medication.category || medication.medicationCategory || '',
            medicationFrequency: medication.frequency || medication.medicationFrequency || '',
            state,
            isTaken,
            takenLate,
            loggedEvent,
          };
        });
      })
      .sort((a, b) => a.timeMinutes - b.timeMinutes || a.medicationName.localeCompare(b.medicationName));

    return events;
  }, [loggedEvents, resolvedMedications, takenKeys]);

  const medicationDuplicateCandidates = useMemo(() => allMedicationLogs, [allMedicationLogs]);

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

  const persistTakenLog = async (event) => {
    const loggedDocData = buildTakenLogData(event);
    const docRef = await addDoc(collection(db, 'dailyLogs'), loggedDocData);
    await updateDoc(doc(db, 'dailyLogs', docRef.id), {
      status: 'taken',
    });

    const savedLog = normalizeMedicationLogRecord({
      id: docRef.id,
      ...loggedDocData,
      status: 'taken',
    });
    const nextLoggedEvent = {
      ...savedLog,
      status: 'taken',
    };

    setLoggedEvents((current) => ({
      ...current,
      [event.eventKey]: nextLoggedEvent,
    }));
    setAllMedicationLogs((current) => {
      const next = current.filter((log) => log.id !== docRef.id);
      next.unshift(savedLog);
      return next;
    });
    setTakenKeys((current) => {
      const next = {
        ...current,
        [event.eventKey]: true,
      };
      setCachedTakenEvents(childId, next);
      return next;
    });
    window.dispatchEvent(new CustomEvent('captureez:timeline-entry-created', {
      detail: {
        id: docRef.id,
        collection: 'dailyLogs',
        childId,
        ...loggedDocData,
      },
    }));

    return { docRef, loggedDocData };
  };

  const buildTakenLogData = (event) => {
    const now = new Date();
    const scheduledFor = (() => {
      if (!event.time) {
        return null;
      }

      const [hours, minutes] = event.time.split(':').map((value) => Number(value));
      if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        return null;
      }

      const scheduled = new Date();
      scheduled.setHours(hours, minutes, 0, 0);
      return scheduled;
    })();

    const loggedDocData = {
      childId,
      createdBy: activeUser.uid,
      createdAt: serverTimestamp(),
      status: 'active',
      category: 'medication',
      source: 'medication_schedule_log',
      text: `Gave ${event.medicationName} ${[event.dose, event.unit].filter(Boolean).join(' ').trim()}`.trim(),
      timestamp: now,
      timestampUtc: now.toISOString(),
      entryDate: todayKey,
      authorId: activeUser.uid,
      authorName: activeUser.displayName || activeUser.email?.split('@')[0] || 'User',
      authorEmail: activeUser.email,
      medicationId: event.medicationId,
      medicationScheduleId: event.scheduleId,
      medicationScheduleIndex: event.scheduleIndex,
      medicationScheduleKey: event.eventKey,
      medicationScheduleTime: event.time,
      medicationScheduleDose: event.dose,
      medicationScheduleUnit: event.unit,
      medicationName: event.medicationName,
      medicationCategory: event.medicationCategory || event.category || '',
      medicationFrequency: event.medicationFrequency || '',
      scheduledFor: scheduledFor ? scheduledFor.toISOString() : null,
      takenAt: now.toISOString(),
    };

    return loggedDocData;
  };

  const checkMedicationDuplicate = async (event, options = {}) => {
    const candidate = normalizeMedicationLogRecord({
      childId,
      category: 'medication',
      source: 'medication_schedule_log',
      status: 'active',
      medicationId: event.medicationId,
      medicationName: event.medicationName,
      medicationScheduleId: event.scheduleId,
      medicationScheduleIndex: event.scheduleIndex,
      medicationScheduleTime: event.time,
      medicationScheduleDose: event.dose,
      medicationScheduleUnit: event.unit,
      medicationCategory: event.medicationCategory,
      medicationFrequency: event.medicationFrequency,
      timestamp: new Date(),
      takenAt: new Date(),
      scheduledFor: event.time ? new Date() : null,
    });

    const duplicateInfo = detectPossibleMedicationDuplicate(
      candidate,
      medicationDuplicateCandidates,
      options
    );

    if (!duplicateInfo.matched) {
      return { matched: false, duplicateInfo: null };
    }

    return { matched: true, duplicateInfo };
  };

  const handleMarkTaken = async (event, { allowDuplicate = false } = {}) => {
    if (
      !childId
      || !activeUser?.uid
      || takenKeys[event.eventKey]
      || savingKey === event.eventKey
    ) {
      return;
    }

    if (!allowDuplicate) {
      const { matched, duplicateInfo } = await checkMedicationDuplicate(event);
      if (matched) {
        openDuplicatePrompt({
          reason: duplicateInfo.reason,
          medicationName: event.medicationName,
          existingTimeLabel: duplicateInfo.existingLog?.timeLabel,
          onConfirm: () => {
            closeDuplicatePrompt();
            handleMarkTaken(event, { allowDuplicate: true });
          },
        });
        return;
      }
    }

    const optimisticLog = {
      id: `optimistic-${event.eventKey}`,
      ...buildTakenLogData(event),
      status: 'taken',
    };

    setSavingKey(event.eventKey);
    setLoggedEvents((current) => ({
      ...current,
      [event.eventKey]: optimisticLog,
    }));
    setTakenKeys((current) => {
      const next = {
        ...current,
        [event.eventKey]: true,
      };
      setCachedTakenEvents(childId, next);
      return next;
    });

    try {
      await persistTakenLog(event);
      onSaved?.({
        eventKey: event.eventKey,
        medicationName: event.medicationName,
        time: event.timeLabel,
      });
    } catch (error) {
      console.error('Error logging medication dose:', error);
      setLoggedEvents((current) => {
        const next = { ...current };
        delete next[event.eventKey];
        return next;
      });
      setTakenKeys((current) => {
        const next = { ...current };
        delete next[event.eventKey];
        setCachedTakenEvents(childId, next);
        return next;
      });
    } finally {
      setSavingKey(null);
    }
  };

  const handleUndo = async (event) => {
    const loggedEvent = loggedEvents[event.eventKey];
    if (!loggedEvent?.id || savingKey === event.eventKey) {
      return;
    }

    const previousLog = loggedEvent;
    setSavingKey(event.eventKey);
    setLoggedEvents((current) => {
      const next = { ...current };
      delete next[event.eventKey];
      return next;
    });
    setAllMedicationLogs((current) => current.filter((log) => log.id !== loggedEvent.id));
    setTakenKeys((current) => {
      const next = { ...current };
      delete next[event.eventKey];
      setCachedTakenEvents(childId, next);
      return next;
    });
    try {
      await updateDoc(doc(db, 'dailyLogs', loggedEvent.id), {
        status: 'deleted',
      });
    } catch (error) {
      console.error('Error undoing medication dose:', error);
      setLoggedEvents((current) => ({
        ...current,
        [event.eventKey]: previousLog,
      }));
      setAllMedicationLogs((current) => {
        const next = current.filter((log) => log.id !== loggedEvent.id);
        next.unshift(normalizeMedicationLogRecord(previousLog));
        return next;
      });
      setTakenKeys((current) => {
        const next = {
          ...current,
          [event.eventKey]: true,
        };
        setCachedTakenEvents(childId, next);
        return next;
      });
    } finally {
      setSavingKey(null);
    }
  };

  const handleMarkAllTaken = async (group, { allowDuplicate = false } = {}) => {
    if (!childId || !activeUser?.uid) {
      return;
    }

    const pendingEvents = group.events.filter((event) => !loggedEvents[event.eventKey] && !takenKeys[event.eventKey]);
    if (pendingEvents.length === 0) {
      return;
    }

    if (!allowDuplicate) {
      const duplicateCandidate = pendingEvents.find((event) => {
        const match = detectPossibleMedicationDuplicate(
          normalizeMedicationLogRecord({
            childId,
            category: 'medication',
            source: 'medication_schedule_log',
            medicationId: event.medicationId,
            medicationName: event.medicationName,
            medicationScheduleId: event.scheduleId,
            medicationScheduleIndex: event.scheduleIndex,
            medicationScheduleTime: event.time,
            medicationScheduleDose: event.dose,
            medicationScheduleUnit: event.unit,
            medicationCategory: event.medicationCategory,
            medicationFrequency: event.medicationFrequency,
            timestamp: new Date(),
            takenAt: new Date(),
          }),
          medicationDuplicateCandidates
        );
        return match.matched;
      });

      if (duplicateCandidate) {
        const duplicateInfo = detectPossibleMedicationDuplicate(
          normalizeMedicationLogRecord({
            childId,
            category: 'medication',
            source: 'medication_schedule_log',
            medicationId: duplicateCandidate.medicationId,
            medicationName: duplicateCandidate.medicationName,
            medicationScheduleId: duplicateCandidate.scheduleId,
            medicationScheduleIndex: duplicateCandidate.scheduleIndex,
            medicationScheduleTime: duplicateCandidate.time,
            medicationScheduleDose: duplicateCandidate.dose,
            medicationScheduleUnit: duplicateCandidate.unit,
            medicationCategory: duplicateCandidate.medicationCategory,
            medicationFrequency: duplicateCandidate.medicationFrequency,
            timestamp: new Date(),
            takenAt: new Date(),
          }),
          medicationDuplicateCandidates
        );

        openDuplicatePrompt({
          reason: duplicateInfo.reason,
          medicationName: duplicateCandidate.medicationName,
          existingTimeLabel: duplicateInfo.existingLog?.timeLabel,
          onConfirm: () => {
            closeDuplicatePrompt();
            handleMarkAllTaken(group, { allowDuplicate: true });
          },
        });
        return;
      }
    }

    setLoggedEvents((current) => {
      const next = { ...current };
      pendingEvents.forEach((event) => {
        next[event.eventKey] = {
          id: `optimistic-${event.eventKey}`,
          ...buildTakenLogData(event),
          status: 'taken',
        };
      });
      return next;
    });
    setTakenKeys((current) => {
      const next = { ...current };
      pendingEvents.forEach((event) => {
        next[event.eventKey] = true;
      });
      setCachedTakenEvents(childId, next);
      return next;
    });

    try {
      const results = await Promise.allSettled(
        pendingEvents.map((event) => persistTakenLog(event))
      );
      const failedEvents = pendingEvents.filter((_, index) => results[index].status === 'rejected');

      if (failedEvents.length > 0) {
        console.error('Error marking some medication doses as taken:', failedEvents);
        setLoggedEvents((current) => {
          const next = { ...current };
          failedEvents.forEach((event) => {
            delete next[event.eventKey];
          });
          return next;
        });
        setTakenKeys((current) => {
          const next = { ...current };
          failedEvents.forEach((event) => {
            delete next[event.eventKey];
          });
          setCachedTakenEvents(childId, next);
          return next;
        });
      }
    } catch (error) {
      console.error('Error marking all medication doses as taken:', error);
    }
  };

  const handleKeepExistingDuplicate = () => {
    closeDuplicatePrompt();
  };

  const handleLogAgainDuplicate = () => {
    if (duplicatePrompt?.onConfirm) {
      duplicatePrompt.onConfirm();
    }
  };

  return (
    <>
      <LogFormShell
      open={open}
      onClose={onClose}
      title="Today’s medications"
      subtitle="Tap to mark doses as taken"
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
        <Button
          type="button"
          variant="text"
          onClick={handleManageMedications}
          sx={{
            alignSelf: 'flex-start',
            minWidth: 0,
            px: 0,
            py: 0,
            textTransform: 'none',
            fontWeight: 650,
            color: '#6b7280',
            '&:hover': {
              bgcolor: 'transparent',
              textDecoration: 'underline',
            },
          }}
        >
          Manage medications →
        </Button>

        <Button
          type="button"
          variant="text"
          onClick={handleOpenBackfillDialog}
          sx={{
            alignSelf: 'flex-start',
            minWidth: 0,
            px: 0,
            py: 0,
            textTransform: 'none',
            fontWeight: 650,
            color: '#6b7280',
            '&:hover': {
              bgcolor: 'transparent',
              textDecoration: 'underline',
            },
          }}
        >
          Missed something earlier? Log it →
        </Button>

        {(loading || medicationLoading) ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 700, color: '#6b7280' }}>
              Loading today&apos;s doses…
            </Typography>
          </Box>
        ) : groupedEvents.length > 0 ? (
          <Stack spacing={1.15}>
            {groupedEvents.map((group) => {
              const completedCount = group.events.filter((event) => event.state === 'taken').length;
              const allTaken = completedCount === group.events.length;

              return (
                <Box key={group.time} sx={{ minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.65, px: 0.25 }}>
                    <Typography sx={{ fontWeight: 800, color: colors.brand.navy, lineHeight: 1.2 }}>
                      {group.time} • {group.events.length} dose{group.events.length === 1 ? '' : 's'}
                    </Typography>
                    {allTaken ? (
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 800,
                          color: '#166534',
                          lineHeight: 1.1,
                        }}
                      >
                        ✓ All taken
                      </Typography>
                    ) : (
                      <Button
                        type="button"
                        variant="text"
                        onClick={() => handleMarkAllTaken(group)}
                        disabled={loading || medicationLoading}
                        sx={{
                          minWidth: 0,
                          px: 0,
                          py: 0,
                          textTransform: 'none',
                          fontWeight: 700,
                          color: '#6f5ea8',
                          lineHeight: 1.1,
                          '&:hover': {
                            bgcolor: 'transparent',
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        Mark all
                      </Button>
                    )}
                  </Box>

                  <Stack spacing={0}>
                    {group.events.map((event) => (
                      <MedicationRow
                        key={event.eventKey}
                        event={event}
                        onMarkTaken={handleMarkTaken}
                        onLogTime={handleOpenTimeEntry}
                        onUndo={handleUndo}
                        savingKey={savingKey}
                        canMarkTaken={Boolean(activeUser?.uid)}
                      />
                    ))}
                  </Stack>
                </Box>
              );
            })}
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

      <MedicationBackfillDialog
        open={showBackfillDialog}
        childId={childId}
        childName={childName}
        medications={resolvedMedications}
        initialMedicationId={timeEntryPreset?.medicationId || ''}
        initialScheduleId={timeEntryPreset?.scheduleId || ''}
        initialStatus={timeEntryPreset?.status || 'taken'}
        initialDate={timeEntryPreset?.initialDate || null}
        initialTime={timeEntryPreset?.initialTime || ''}
        onClose={handleCloseBackfillDialog}
        onSaved={onSaved}
      />

      <MedicationDuplicateWarningDialog
        open={Boolean(duplicatePrompt)}
        reason={duplicatePrompt?.reason || ''}
        medicationName={duplicatePrompt?.medicationName || ''}
        existingTimeLabel={duplicatePrompt?.existingTimeLabel || ''}
        onKeepExisting={handleKeepExistingDuplicate}
        onLogAgainAnyway={handleLogAgainDuplicate}
      />
    </>
  );
};

export default BulkMedicationLogDialog;
