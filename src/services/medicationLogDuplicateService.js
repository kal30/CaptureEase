import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

const DEFAULT_DUPLICATE_WINDOW_MINUTES = 12;
const PRN_DUPLICATE_WINDOW_MINUTES = 5;

const normalizeText = (value = '') => String(value)
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

const toDate = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value?.toDate === 'function') {
    const next = value.toDate();
    return next instanceof Date && !Number.isNaN(next.getTime()) ? next : null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getLocalDateKey = (value) => {
  const date = toDate(value);
  if (!date) {
    return '';
  }

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
};

export const getMedicationLogDateKey = (value) => getLocalDateKey(value);

const parseScheduleMinutes = (value) => {
  if (!value) {
    return null;
  }

  const parts = String(value).split(':').map((part) => Number(part));
  if (parts.length < 2 || parts.some((part) => Number.isNaN(part))) {
    return null;
  }

  return parts[0] * 60 + parts[1];
};

const getReferenceDate = (record = {}) => (
  toDate(record.takenAt)
  || toDate(record.timestamp)
  || toDate(record.scheduledFor)
  || toDate(record.createdAt)
  || null
);

const formatTimeLabel = (value) => {
  const date = toDate(value);
  if (!date) {
    return 'recently';
  }

  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
};

const getMedicationCategory = (record = {}) => normalizeText(
  record.medicationCategory
  || record.category
  || ''
);

const isPrnMedication = (record = {}) => {
  const category = getMedicationCategory(record);
  const frequency = normalizeText(record.medicationFrequency || record.frequency || '');
  return (
    category === 'prn'
    || category === 'as_needed'
    || category === 'as needed'
    || frequency === 'prn'
    || frequency === 'as_needed'
    || frequency === 'as needed'
  );
};

const getDoseUnitText = (record = {}) => {
  const dose = String(
    record.medicationScheduleDose
    || record.dosage
    || record.dose
    || record.medicationDetails?.dosage
    || record.medicationDetails?.dose
    || ''
  ).trim();
  const unit = String(
    record.medicationScheduleUnit
    || record.unit
    || record.medicationDetails?.unit
    || ''
  ).trim();

  return [dose, unit].filter(Boolean).join(' ').trim();
};

const getScheduleToken = (record = {}) => {
  const parts = [
    record.medicationId || '',
    record.medicationScheduleId || '',
    record.medicationScheduleIndex ?? '',
    record.medicationScheduleTime || '',
    record.scheduledFor || '',
  ];

  return normalizeText(parts.join('|'));
};

export const normalizeMedicationLogRecord = (record = {}) => {
  const referenceDate = getReferenceDate(record);
  const dateKey = getLocalDateKey(record.entryDate || referenceDate || record.scheduledFor || record.timestamp);
  const medicationName = String(
    record.medicationName
    || record.medicationDetails?.medicationName
    || record.medicationDetails?.name
    || record.name
    || ''
  ).trim();
  const doseUnitText = getDoseUnitText(record);
  const scheduledTime = String(record.medicationScheduleTime || '').trim();
  const scheduleToken = getScheduleToken(record);

  return {
    ...record,
    dateKey,
    referenceDate,
    referenceMinutes: referenceDate
      ? referenceDate.getHours() * 60 + referenceDate.getMinutes()
      : parseScheduleMinutes(record.medicationScheduleTime || record.time || ''),
    medicationName,
    normalizedMedicationName: normalizeText(medicationName),
    doseUnitText,
    normalizedDoseUnitText: normalizeText(doseUnitText),
    scheduleToken,
    normalizedScheduleToken: normalizeText(scheduleToken),
    medicationCategory: getMedicationCategory(record),
    isPrn: isPrnMedication(record),
    scheduledTime,
    timeLabel: formatTimeLabel(
      referenceDate
      || record.takenAt
      || record.timestamp
      || record.scheduledFor
      || record.medicationScheduleTime
      || record.time
    ),
  };
};

const getEffectiveWindowMinutes = (record = {}, options = {}) => {
  if (record.isPrn) {
    return options.prnWindowMinutes || PRN_DUPLICATE_WINDOW_MINUTES;
  }

  return options.windowMinutes || DEFAULT_DUPLICATE_WINDOW_MINUTES;
};

export const detectPossibleMedicationDuplicate = (candidate = {}, existingLogs = [], options = {}) => {
  const normalizedCandidate = normalizeMedicationLogRecord(candidate);
  const candidateDateKey = normalizedCandidate.dateKey;
  const candidateName = normalizedCandidate.normalizedMedicationName;
  const candidateScheduleToken = normalizedCandidate.normalizedScheduleToken;
  const candidateDoseUnitText = normalizedCandidate.normalizedDoseUnitText;
  const candidateMinutes = normalizedCandidate.referenceMinutes;
  const windowMinutes = getEffectiveWindowMinutes(normalizedCandidate, options);

  if (!candidateName || !candidateDateKey || !existingLogs.length) {
    return { matched: false, reason: '', existingLog: null };
  }

  for (const log of existingLogs) {
    const existing = normalizeMedicationLogRecord(log);
    if (existing.status === 'deleted') {
      continue;
    }

    if (existing.childId && normalizedCandidate.childId && existing.childId !== normalizedCandidate.childId) {
      continue;
    }

    if (existing.dateKey && existing.dateKey !== candidateDateKey) {
      continue;
    }

    const existingName = existing.normalizedMedicationName;
    if (!existingName) {
      continue;
    }

    const sameMedication = (
      normalizedCandidate.medicationId
      && existing.medicationId
        ? normalizedCandidate.medicationId === existing.medicationId
        : candidateName === existingName
    );

    if (!sameMedication) {
      continue;
    }

    const sameDose = !candidateDoseUnitText
      || !existing.normalizedDoseUnitText
      || candidateDoseUnitText === existing.normalizedDoseUnitText;
    const sameSchedule = Boolean(
      candidateScheduleToken
      && existing.normalizedScheduleToken
      && candidateScheduleToken === existing.normalizedScheduleToken
    );
    const existingMinutes = existing.referenceMinutes;
    const withinWindow = (
      Number.isFinite(candidateMinutes)
      && Number.isFinite(existingMinutes)
      && Math.abs(candidateMinutes - existingMinutes) <= windowMinutes
    );

    if (sameSchedule || (sameMedication && sameDose && withinWindow)) {
      return {
        matched: true,
        reason: `Already logged at ${existing.timeLabel}`,
        existingLog: existing,
      };
    }
  }

  return { matched: false, reason: '', existingLog: null };
};

export const fetchMedicationLogsForChild = async (childId) => {
  if (!childId) {
    return [];
  }

  const snapshot = await getDocs(
    query(
      collection(db, 'dailyLogs'),
      where('childId', '==', childId)
    )
  );

  return snapshot.docs.map((logDoc) => (
    normalizeMedicationLogRecord({
      id: logDoc.id,
      ...logDoc.data(),
    })
  )).filter((record) => record.category === 'medication' || record.medicationId || record.medicationName);
};

export const fetchMedicationLogsForChildDate = async (childId, dateValue) => {
  const dateKey = getLocalDateKey(dateValue);
  const logs = await fetchMedicationLogsForChild(childId);
  return logs.filter((log) => log.dateKey === dateKey);
};

export const formatMedicationDuplicateTime = (record = {}) => {
  const normalized = normalizeMedicationLogRecord(record);
  return normalized.timeLabel;
};
