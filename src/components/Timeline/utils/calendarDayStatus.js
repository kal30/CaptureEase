import { getCalendarEntryDateKey } from '../../../utils/calendarDateKey';
import { getTimelineEntryDate } from '../../../services/timeline/dateUtils';
import { isBehaviorIncidentEntry } from '../../../constants/logTypeRegistry';

const normalizeText = (value = '') => String(value ?? '').trim().toLowerCase();

const SEVERE_SEVERITY_THRESHOLD = 6;

const INCIDENT_KEYWORDS = [
  /behavior concern/i,
  /behaviour concern/i,
  /aggress/i,
  /\bhit(?:ting|s|)?\b/i,
  /\bbit(?:e|ing|es)?\b/i,
  /\bkick(?:ed|ing|s)?\b/i,
  /\bthrow(?:s|ing|n)?\b/i,
  /school refusal/i,
  /refus(?:ed|al).*school/i,
  /won'?t go to school/i,
  /\bschool\b.*\brefus/i,
  /meltdown/i,
  /tantrum/i,
  /escalat/i,
  /\bunsafe\b/i,
  /restraint/i,
  /panic/i,
  /incident/i,
  /important moment/i,
  /major concern/i,
  /\bmajor\b/i,
  /\bcritical\b/i,
  /\bsevere\b/i,
];

const getSeverityValue = (entry = {}) => {
  const candidates = [
    entry.severity,
    entry.severityLevel,
    entry.severityInfo?.value,
    entry.incidentData?.severity,
    entry.incidentData?.severityLevel,
  ];

  const severityCandidate = candidates.find((candidate) => candidate != null && candidate !== '');
  const numericSeverity = Number(severityCandidate);
  return Number.isFinite(numericSeverity) ? numericSeverity : null;
};

const getSeverityLabel = (entry = {}) => normalizeText([
  entry.severityLabel,
  entry.severityInfo?.label,
  entry.severityInfo?.displayLabel,
  entry.incidentData?.severityLabel,
].filter(Boolean).join(' '));

const getIncidentSearchText = (entry = {}) => normalizeText([
  entry.title,
  entry.titlePrefix,
  entry.label,
  entry.displayLabel,
  entry.description,
  entry.summary,
  entry.text,
  entry.content,
  entry.notes,
  entry.note,
  entry.categoryLabel,
  entry.categoryId,
  entry.category,
  entry.type,
  entry.timelineType,
  entry.logCategory,
  entry.actionType,
  entry.incidentCategoryLabel,
  entry.incidentType,
  entry.severityLabel,
  entry.incidentData?.description,
  entry.incidentData?.notes,
  entry.incidentData?.triggerSummary,
  entry.incidentData?.remedy,
  entry.incidentData?.severityLabel,
  entry.incidentData?.incidentType,
  entry.incidentData?.customIncidentName,
  entry.triggerSummary,
  entry.remedy,
  ...(Array.isArray(entry.tags) ? entry.tags : []),
  ...(Array.isArray(entry.suspectedTriggers) ? entry.suspectedTriggers : []),
].filter(Boolean).join(' '));

const hasExplicitIncidentFlag = (entry = {}) => Boolean(
  entry.importantMoment
  || entry.isImportantMoment
  || entry.important
  || entry.isImportant
  || entry.notableEvent
  || entry.isNotableEvent
  || entry.incidentStyle
  || entry.entryType === 'incident'
  || entry.collection === 'incidents'
  || entry.type === 'incident'
  || entry.timelineType === 'incident'
  || entry.category === 'incident'
  || entry.category === 'importantMoment'
  || entry.timelineType === 'importantMoment'
  || entry.type === 'importantMoment'
  || entry.category === 'important'
  || entry.incidentData?.importantMoment
  || entry.originalData?.importantMoment
);

const hasIncidentKeywords = (entry = {}) => INCIDENT_KEYWORDS.some((pattern) => pattern.test(getIncidentSearchText(entry)));

const hasHighSeveritySignal = (entry = {}) => {
  const severity = getSeverityValue(entry);
  if (severity != null && severity >= SEVERE_SEVERITY_THRESHOLD) {
    return true;
  }

  const severityLabel = getSeverityLabel(entry);
  return Boolean(
    severityLabel
    && /(high|critical|severe|major)/i.test(severityLabel)
  );
};

const isIncidentOrImportantEntry = (entry = {}) => {
  if (!entry) {
    return false;
  }

  return Boolean(
    hasExplicitIncidentFlag(entry)
    || isBehaviorIncidentEntry(entry)
    || hasHighSeveritySignal(entry)
    || hasIncidentKeywords(entry)
  );
};

const getEntryDate = (entry = {}) => (
  getTimelineEntryDate(entry)
  || (typeof entry?.timestamp?.toDate === 'function' ? entry.timestamp.toDate() : null)
  || new Date(entry?.timestamp)
);

const isValidDate = (date) => date instanceof Date && !Number.isNaN(date.getTime());

export const buildCalendarDayStatusMap = (entries = [], activityDateKeys = []) => {
  const dayStatusMap = new Map();
  const fallbackActivityKeys = new Set((activityDateKeys || []).filter(Boolean));

  entries.forEach((entry) => {
    const date = getEntryDate(entry);
    if (!isValidDate(date)) {
      return;
    }

    const dateKey = getCalendarEntryDateKey(entry);
    if (!dateKey) {
      return;
    }

    const current = dayStatusMap.get(dateKey) || { hasLogs: false, hasIncident: false };
    const isIncident = isIncidentOrImportantEntry(entry);
    current.hasIncident = current.hasIncident || isIncident;
    current.hasLogs = current.hasLogs || !isIncident;
    dayStatusMap.set(dateKey, current);
  });

  fallbackActivityKeys.forEach((dateKey) => {
    if (!dayStatusMap.has(dateKey)) {
      dayStatusMap.set(dateKey, { hasLogs: true, hasIncident: false });
      return;
    }

    const current = dayStatusMap.get(dateKey);
    current.hasLogs = true;
    dayStatusMap.set(dateKey, current);
  });

  return dayStatusMap;
};

export const getCalendarDayStatus = (dayStatus = {}) => ({
  hasLogs: Boolean(dayStatus.hasLogs),
  hasIncident: Boolean(dayStatus.hasIncident),
  dayStatus: dayStatus.hasIncident ? 'incident' : (dayStatus.hasLogs ? 'log' : 'none'),
});
