import {
  getCanonicalEntryDisplayInfo,
  isBehaviorIncidentEntry,
  LOG_TYPES,
} from '../../constants/logTypeRegistry';
import {
  ACTIVITY_TYPE_OPTIONS,
  getActivityTheme,
  getPrimaryActivityTheme,
} from '../../constants/activityThemes';
import { coerceCalendarDate } from '../../utils/calendarDateKey';

const normalizeText = (value) => String(value || '').trim();

const getInitials = (name) => {
  if (!name) {
    return null;
  }

  return String(name)
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
    .slice(0, 2);
};

const getSemanticSeverityMeta = (severity) => {
  if (severity == null) {
    return null;
  }

  const numericValue = Number(severity);
  if (Number.isNaN(numericValue)) {
    return null;
  }

  if (numericValue >= 9) {
    return {
      value: numericValue,
      label: 'Critical',
      displayLabel: `Critical (${numericValue}/10)`,
      color: '#B42318',
      textColor: '#9F1239',
      bg: '#FEF2F2',
      border: '#FECACA',
    };
  }

  if (numericValue >= 6) {
    return {
      value: numericValue,
      label: 'High',
      displayLabel: `High (${numericValue}/10)`,
      color: '#C2410C',
      textColor: '#9A3412',
      bg: '#FFF7ED',
      border: '#FDBA74',
    };
  }

  if (numericValue >= 3) {
    return {
      value: numericValue,
      label: 'Moderate',
      displayLabel: `Moderate (${numericValue}/10)`,
      color: '#B45309',
      textColor: '#92400E',
      bg: '#FFFBEB',
      border: '#FCD34D',
    };
  }

  return {
    value: numericValue,
    label: 'Good',
    displayLabel: `Good (${numericValue}/10)`,
    color: '#047857',
    textColor: '#065F46',
    bg: '#ECFDF3',
    border: '#A7F3D0',
  };
};

const getEngagementMeta = (value) => {
  const metaMap = {
    1: { label: '😴 Refused', color: '#64748B', bg: '#FFFFFF', textColor: '#334155' },
    2: { label: '😐 Passive', color: '#64748B', bg: '#FFFFFF', textColor: '#334155' },
    3: { label: '🙂 Participated', color: '#6366F1', bg: '#EEF2FF', textColor: '#312E81' },
    4: { label: '😊 Engaged', color: '#4F46E5', bg: '#EEF2FF', textColor: '#312E81' },
    5: { label: '🤩 Focused', color: '#4338CA', bg: '#E0E7FF', textColor: '#1E1B4B' },
  };

  return metaMap[Number(value)] || null;
};

const getBehaviorContextSignals = (contextSnapshot = {}) => {
  const signals = [
    {
      icon: '💊',
      label: 'Meds',
      present: Array.isArray(contextSnapshot.medicationsTaken)
        ? contextSnapshot.medicationsTaken.some((item) => item && item !== 'Not logged yet')
        : Boolean(contextSnapshot.medicationsTaken && contextSnapshot.medicationsTaken !== 'Not logged yet'),
    },
    {
      icon: '🍽️',
      label: 'Food',
      present: Boolean(contextSnapshot.foodLogged && contextSnapshot.foodLogged !== 'Not logged yet'),
    },
    {
      icon: '🏃',
      label: 'Activity',
      present: Array.isArray(contextSnapshot.activities)
        ? contextSnapshot.activities.some((item) => item && item !== 'Not logged yet')
        : Boolean(contextSnapshot.activities && contextSnapshot.activities !== 'Not logged yet'),
    },
    {
      icon: '😴',
      label: 'Sleep',
      present: Boolean(contextSnapshot.sleepQuality && contextSnapshot.sleepQuality !== 'Not logged yet'),
    },
  ];

  return signals.filter((signal) => signal.present);
};

const buildContextSignalsFromSnapshot = (contextSnapshot = {}) => (
  getBehaviorContextSignals(contextSnapshot).map((signal) => ({
    icon: signal.icon,
    label: signal.label,
    present: true,
  }))
);

const normalizeActivityValue = (entry = {}) => {
  const candidates = [
    entry.activityThemeLabel,
    entry.data?.activityThemeLabel,
    Array.isArray(entry.activityTypes) ? entry.activityTypes[0] : entry.activityTypes,
    Array.isArray(entry.data?.activityTypes) ? entry.data.activityTypes[0] : entry.data?.activityTypes,
    entry.activityType,
    entry.data?.activityType,
    entry.categoryLabel,
    entry.data?.categoryLabel,
    entry.titlePrefix,
  ];

  return candidates.find((candidate) => normalizeText(candidate)) || '';
};

const resolveActivityMeta = (entry = {}) => {
  const activityLabel = normalizeActivityValue(entry);
  const normalizedValue = normalizeText(activityLabel).toLowerCase();
  const matchedOption = ACTIVITY_TYPE_OPTIONS.find((option) => {
    const optionValue = normalizeText(option.value).toLowerCase();
    const optionLabel = normalizeText(option.label).toLowerCase();
    return normalizedValue === optionValue || normalizedValue === optionLabel;
  });
  const theme = matchedOption
    ? getActivityTheme(matchedOption.value)
    : getPrimaryActivityTheme(
        entry.activityTypes
        || entry.data?.activityTypes
        || normalizeText(activityLabel).toLowerCase()
        || 'other'
      );

  return {
    label: matchedOption?.label || theme.label || activityLabel || 'Activity',
    icon: matchedOption?.emoji || LOG_TYPES.activity.icon,
    color: entry.activityThemeColor || entry.data?.activityThemeColor || theme.color || LOG_TYPES.activity.palette.dot,
    softBg: theme.softBg,
    dark: theme.dark,
    border: theme.border,
    key: entry.activityThemeKey || entry.data?.activityThemeKey || theme.key,
  };
};

const getFoodMealType = (entry = {}) => (
  entry.foodDetails?.mealType
  || entry.data?.foodDetails?.mealType
  || entry.categoryLabel
  || entry.titlePrefix
  || 'Food'
);

const getFoodHeadline = (entry = {}) => (
  entry.foodDetails?.whatWasEaten
  || entry.data?.foodDetails?.whatWasEaten
  || entry.text
  || entry.content
  || entry.notes
  || entry.description
  || ''
);

const getFoodDetails = (entry = {}) => {
  const foodDetails = entry.foodDetails || entry.data?.foodDetails || {};
  const rows = [];

  if (foodDetails.portion) {
    rows.push({ label: 'Amount', value: String(foodDetails.portion) });
  }

  if (foodDetails.reaction && foodDetails.reaction !== 'None') {
    rows.push({ label: 'Reaction', value: String(foodDetails.reaction) });
  }

  return rows;
};

const getMedicationDetails = (entry = {}) => {
  const medicationDetails = entry.medicationDetails || entry.data?.medicationDetails || {};
  const rows = [];
  const dosage = medicationDetails.dosage || entry.title || entry.text || entry.content || '';
  const timeTaken = medicationDetails.timeTaken || entry.timeTaken || entry.timestampText || '';

  if (dosage) {
    rows.push({ label: 'Dose', value: String(dosage) });
  }

  if (timeTaken) {
    rows.push({ label: 'Time', value: String(timeTaken) });
  }

  return rows;
};

const getSleepDetails = (entry = {}) => {
  const sleepDetails = entry.sleepDetails || entry.data?.sleepDetails || {};
  const rows = [];
  const anchorDate = coerceCalendarDate(
    sleepDetails.anchorDate
    || sleepDetails.localDate
    || entry.anchorDate
    || entry.localDate
    || entry.entryDate
  );

  if (anchorDate) {
    rows.push({
      label: 'Night of',
      value: anchorDate.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      }),
    });
  }

  if (sleepDetails.bedtime || entry.bedtime) {
    rows.push({ label: 'Bedtime', value: String(sleepDetails.bedtime || entry.bedtime) });
  }

  if (sleepDetails.wakeTime || entry.wakeTime) {
    rows.push({ label: 'Wake time', value: String(sleepDetails.wakeTime || entry.wakeTime) });
  }

  if (sleepDetails.durationHours != null || entry.sleepDuration != null) {
    const durationValue = sleepDetails.durationHours != null ? sleepDetails.durationHours : entry.sleepDuration;
    rows.push({ label: 'Duration', value: `${durationValue} hours` });
  }

  if (sleepDetails.quality || entry.sleepQuality) {
    rows.push({ label: 'Quality', value: String(sleepDetails.quality || entry.sleepQuality) });
  }

  return rows;
};

const getToiletDetails = (entry = {}) => {
  const bathroomDetails = entry.bathroomDetails || entry.data?.bathroomDetails || {};
  const rows = [];

  if (bathroomDetails.type || entry.toiletType) {
    rows.push({ label: 'Type', value: String(bathroomDetails.type || entry.toiletType) });
  }

  if (bathroomDetails.notes || entry.notes) {
    rows.push({ label: 'Notes', value: String(bathroomDetails.notes || entry.notes) });
  }

  return rows;
};

const getBehaviorDetails = (entry = {}, contextSnapshot = {}) => {
  const rows = [];
  const triggerSummary = normalizeText(entry.triggerSummary || entry.incidentData?.triggerSummary);
  const remedy = normalizeText(entry.remedy || entry.incidentData?.remedy);
  const notes = normalizeText(entry.notes || entry.description || entry.text || entry.content);

  if (triggerSummary) {
    rows.push({ label: 'Pattern insight', value: triggerSummary });
  }

  if (remedy) {
    rows.push({ label: 'Remedy', value: remedy });
  }

  if (notes && notes !== triggerSummary) {
    rows.push({ label: 'Notes', value: notes });
  }

  const contextFlags = buildContextSignalsFromSnapshot(contextSnapshot);

  return {
    rows,
    contextFlags,
  };
};

export const transformTimelineEntry = (entry = {}, presentation = {}, timeString = '') => {
  const categoryDisplay = getCanonicalEntryDisplayInfo(entry);
  const isBehaviorIncident = isBehaviorIncidentEntry(entry);
  const isDailyCareActivity = entry.collection === 'dailyCare' && entry.actionType === 'activity';
  const contextSnapshot = entry.contextSnapshot || entry.incidentData?.contextSnapshot || null;
  const activityMeta = isDailyCareActivity ? resolveActivityMeta(entry) : null;
  const severityMeta = getSemanticSeverityMeta(entry.severity ?? entry.incidentData?.severity);
  const engagementMeta = isDailyCareActivity
    ? getEngagementMeta(entry.engagement ?? entry.data?.engagement ?? entry.value)
    : null;

  const kind = isBehaviorIncident
    ? 'behavior'
    : isDailyCareActivity
      ? 'activity'
      : entry.category === 'food'
        ? 'food'
        : entry.category === 'medication'
          ? 'meds'
          : entry.category === 'sleep'
            ? 'sleep'
            : entry.category === 'bathroom'
              ? 'toilet'
              : 'generic';

  const label = isBehaviorIncident
    ? LOG_TYPES.behavior.displayLabel
    : isDailyCareActivity
      ? 'Activity'
      : presentation.entryLabel || categoryDisplay.label || 'Log';

  const icon = isBehaviorIncident
    ? (entry.incidentCategoryIcon || LOG_TYPES.behavior.icon)
    : isDailyCareActivity
      ? (activityMeta?.icon || LOG_TYPES.activity.icon)
      : (presentation.entryIcon || categoryDisplay.icon || '•');

  const accentColor = isBehaviorIncident
    ? (entry.incidentCategoryColor || LOG_TYPES.behavior.palette.dot)
    : isDailyCareActivity
      ? (activityMeta?.color || activityMeta?.border || LOG_TYPES.activity.palette.dot)
      : (presentation.entryColor || categoryDisplay.palette?.dot || LOG_TYPES.log.palette.dot);

  const primaryText = isBehaviorIncident
    ? normalizeText(
        entry.description
        || entry.incidentData?.description
        || entry.text
        || entry.summary
        || entry.notes
        || entry.content
        || 'Behavior logged'
      )
    : isDailyCareActivity
      ? normalizeText(entry.data?.notes || entry.notes || entry.description || entry.content || entry.text || 'Activity logged')
      : kind === 'food'
        ? normalizeText(getFoodHeadline(entry))
        : kind === 'meds'
          ? normalizeText(entry.notes || entry.description || entry.text || entry.content || 'Medication logged')
          : kind === 'sleep'
            ? normalizeText(entry.notes || entry.description || entry.summary || entry.content || entry.text || 'Sleep logged')
            : kind === 'toilet'
              ? normalizeText(entry.notes || entry.description || entry.text || entry.content || 'Toilet logged')
              : normalizeText(entry.notes || entry.description || entry.summary || entry.content || entry.text || entry.title || '');

  const subtype = isBehaviorIncident
    ? ''
    : isDailyCareActivity
      ? normalizeText(activityMeta?.label || entry.activityThemeLabel || entry.data?.activityThemeLabel || '')
      : kind === 'food'
        ? normalizeText(getFoodMealType(entry))
        : kind === 'meds'
          ? normalizeText(entry.medicationDetails?.medicationName || entry.categoryLabel || entry.titlePrefix || '')
          : kind === 'sleep'
            ? normalizeText(entry.sleepDetails?.quality || entry.categoryLabel || entry.titlePrefix || '')
            : kind === 'toilet'
              ? normalizeText(entry.bathroomDetails?.type || entry.categoryLabel || entry.titlePrefix || '')
              : normalizeText(entry.categoryLabel || entry.titlePrefix || '');

  const insight = normalizeText(
    contextSnapshot?.patternInsight
      || entry.patternInsight
      || ''
  );
  const triggerSummary = normalizeText(entry.triggerSummary || entry.incidentData?.triggerSummary || '');
  const notesText = normalizeText(entry.notes || entry.incidentData?.notes || '');
  const dedupedNotesText = notesText && notesText !== primaryText ? notesText : '';

  const initials = getInitials(entry.loggedByUser || entry.authorName || entry.authorEmail || entry.author || '');

  const metaBadge = isBehaviorIncident
    ? (severityMeta
      ? {
          label: severityMeta.displayLabel,
          color: severityMeta.color,
          textColor: severityMeta.textColor,
          bg: severityMeta.bg,
          border: severityMeta.border,
        }
      : null)
    : isDailyCareActivity
      ? (engagementMeta
        ? {
            label: engagementMeta.label,
            color: activityMeta?.color || LOG_TYPES.activity.palette.dot,
            textColor: engagementMeta.textColor,
            bg: engagementMeta.bg,
            border: activityMeta?.border || 'rgba(99, 102, 241, 0.18)',
          }
        : null)
      : (severityMeta
        ? {
            label: severityMeta.displayLabel,
            color: severityMeta.color,
            textColor: severityMeta.textColor,
            bg: severityMeta.bg,
            border: severityMeta.border,
          }
        : null);

  const behaviorDetails = isBehaviorIncident ? getBehaviorDetails(entry, contextSnapshot || {}) : null;

  const detailRows = isBehaviorIncident
    ? []
    : kind === 'activity'
      ? []
      : kind === 'food'
        ? getFoodDetails(entry)
        : kind === 'meds'
          ? getMedicationDetails(entry)
          : kind === 'sleep'
            ? getSleepDetails(entry)
            : kind === 'toilet'
              ? getToiletDetails(entry)
              : [];

  const contextFlags = isBehaviorIncident ? behaviorDetails.contextFlags : [];

  return {
    type: entry.collection || entry.type || 'log',
    kind,
    label,
    icon,
    time: timeString,
    subtype,
    primaryText,
    insight,
    triggerSummary,
    notesText: dedupedNotesText,
    contextFlags,
    initials,
    accentColor,
    metaBadge,
    detailRows,
    activityTheme: activityMeta,
  };
};

export {
  getSemanticSeverityMeta,
  getEngagementMeta,
  getBehaviorContextSignals,
  resolveActivityMeta,
};
