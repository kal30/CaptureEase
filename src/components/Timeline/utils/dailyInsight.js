import { getTimelineEntryDate } from '../../../services/timeline/dateUtils';

const normalizeText = (value = '') => String(value ?? '').replace(/\s+/g, ' ').trim();

const getSearchText = (entry = {}) => normalizeText([
  entry.text,
  entry.description,
  entry.summary,
  entry.content,
  entry.notes,
  entry.note,
  entry.title,
  entry.categoryLabel,
  entry.categoryId,
  entry.category,
  entry.incidentCategoryLabel,
  entry.incidentType,
  entry.resolution,
  entry.titlePrefix,
  entry.medicationName,
  entry.medicationDetails?.medicationName,
  entry.medicationDetails?.name,
  entry.medicationScheduleDose,
  entry.medicationDetails?.dosage,
  entry.medicationDetails?.dose,
  entry.medicationScheduleUnit,
  entry.medicationDetails?.unit,
  ...(entry.triggers || []),
  ...(entry.interventions || []),
  ...(entry.tags || []),
].filter(Boolean).join(' ')).toLowerCase();

const getEntryDate = (entry = {}) => (
  getTimelineEntryDate(entry)
  || (typeof entry?.timestamp?.toDate === 'function' ? entry.timestamp.toDate() : null)
  || new Date(entry?.timestamp)
);

const isValidDate = (date) => date instanceof Date && !Number.isNaN(date.getTime());

const MOOD_PATTERNS = [
  { label: 'Frustrated', terms: [/frustrat/i, /angry/i, /mad/i, /annoy/i, /stres/i, /upset/i, /irritat/i] },
  { label: 'Down', terms: [/sad/i, /down/i, /cry/i, /tired/i, /overwhelmed/i] },
  { label: 'Neutral', terms: [/neutral/i, /\bok\b/i, /\bokay\b/i, /\bfine\b/i, /\bmeh\b/i] },
  { label: 'Calm', terms: [/calm/i, /relaxed/i, /peaceful/i, /content/i] },
  { label: 'Happy', terms: [/happy/i, /great/i, /joyful/i, /smiling/i, /\bgood\b/i] },
];

const BEHAVIOR_SIGNAL_RULES = [
  { key: 'aggression', label: 'Behavior concerns', score: 100, terms: [/aggress/i, /\bhit(?:ting|s|)?\b/i, /\bbit(?:e|ing|es)?\b/i, /\bkick(?:ed|ing|s)?\b/i, /\bthrow(?:s|ing|n)?\b/i] },
  { key: 'school_refusal', label: 'School refusal', score: 98, terms: [/school refusal/i, /refus(?:ed|al).*school/i, /won'?t go to school/i, /\bschool\b.*\brefus/i] },
  { key: 'distress', label: 'Distress', score: 95, terms: [/meltdown/i, /tantrum/i, /escalat/i, /\bunsafe\b/i, /panic/i, /restraint/i] },
];

const DISTURBED_SLEEP_PATTERNS = [
  /restless/i,
  /disturb/i,
  /woke/i,
  /waking/i,
  /broken sleep/i,
  /poor sleep/i,
  /trouble sleeping/i,
  /night waking/i,
  /interrupted/i,
  /short sleep/i,
  /bad night/i,
  /sleep \w*poor/i,
];

const FOOD_SIGNAL_PATTERNS = [
  /low appetite/i,
  /poor appetite/i,
  /didn'?t eat/i,
  /did not eat/i,
  /skipped (?:breakfast|lunch|dinner|a meal|meals)/i,
  /refused to eat/i,
  /picky/i,
  /selective eating/i,
  /snack(?:s)? only/i,
  /small meal/i,
  /barely ate/i,
  /ate a little/i,
];

const isSleepEntry = (entry = {}) => {
  const type = String(entry.type || entry.timelineType || entry.category || entry.logCategory || '').toLowerCase();
  const category = String(entry.category || entry.originalData?.category || '').toLowerCase();
  const text = getSearchText(entry);
  return type.includes('sleep') || category.includes('sleep') || /\bsleep\b/i.test(text);
};

const isFoodEntry = (entry = {}) => {
  const type = String(entry.type || entry.timelineType || entry.category || entry.logCategory || '').toLowerCase();
  const category = String(entry.category || entry.originalData?.category || '').toLowerCase();
  const text = getSearchText(entry);
  return type.includes('food') || category.includes('food') || /\bfood\b/i.test(text);
};

const isMedicationEntry = (entry = {}) => {
  const type = String(entry.type || entry.timelineType || entry.category || entry.logCategory || '').toLowerCase();
  const category = String(entry.category || entry.originalData?.category || '').toLowerCase();
  if (type.includes('medication') || type === 'meds') {
    return true;
  }

  if (category.includes('medication') || category === 'meds') {
    return true;
  }

  const label = normalizeText([entry.titlePrefix, entry.categoryLabel, entry.title].filter(Boolean).join(' ')).toLowerCase();
  return /\bmedication(s)?\b/.test(label) || /\bmeds?\b/.test(label);
};

const isBehaviorEntry = (entry = {}) => {
  const type = String(entry.type || entry.timelineType || entry.category || entry.logCategory || '').toLowerCase();
  const category = String(entry.category || entry.originalData?.category || '').toLowerCase();
  if (type.includes('behavior') || type === 'incident') {
    return true;
  }

  return category.includes('behavior')
    || /behavior|meltdown|tantrum|aggress|hit|bite|kick|elop|refus|unsafe|restraint/i.test(getSearchText(entry));
};

const isMoodEntry = (entry = {}) => {
  const type = String(entry.type || entry.timelineType || entry.category || entry.logCategory || '').toLowerCase();
  const category = String(entry.category || entry.originalData?.category || '').toLowerCase();
  return type === 'mood' || type.includes('mood') || category === 'mood' || category.includes('mood') || entry.actionType === 'mood';
};

const getMoodLabel = (entry = {}) => {
  const candidates = [
    entry.moodValue,
    entry.value,
    entry.title,
    entry.content,
    entry.categoryLabel,
    entry.originalData?.moodValue,
    entry.originalData?.value,
    entry.originalData?.title,
    entry.originalData?.level,
    entry.originalData?.mood,
  ];

  const rawMood = normalizeText(candidates.find((candidate) => normalizeText(candidate)) || '');
  if (!rawMood) {
    return null;
  }

  const matchedMood = MOOD_PATTERNS.find((pattern) => pattern.terms.some((term) => term.test(rawMood)));
  return matchedMood?.label || rawMood.charAt(0).toUpperCase() + rawMood.slice(1);
};

const getMedicationLabel = (entry = {}) => {
  const name = normalizeText(
    entry.medicationName
    || entry.medicationDetails?.medicationName
    || entry.medicationDetails?.name
    || entry.title
    || entry.categoryLabel
    || entry.titlePrefix
    || 'Medication'
  ) || 'Medication';

  const dose = normalizeText([
    entry.medicationScheduleDose || entry.medicationDetails?.dosage || entry.medicationDetails?.dose || entry.dosage || entry.dose,
    entry.medicationScheduleUnit || entry.medicationDetails?.unit || entry.unit,
  ].filter(Boolean).join(' '));

  return dose ? `${name} ${dose}` : name;
};

const buildMedicationInsight = (entries = []) => {
  const medicationEntries = entries.filter(isMedicationEntry);
  if (medicationEntries.length < 2) {
    return null;
  }

  const grouped = medicationEntries.reduce((acc, entry) => {
    const label = getMedicationLabel(entry);
    const key = label.toLowerCase();
    if (!acc[key]) {
      acc[key] = { label, count: 0 };
    }

    acc[key].count += 1;
    return acc;
  }, {});

  const groups = Object.values(grouped)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  if (!groups.length) {
    return null;
  }

  if (groups.length === 1 && groups[0].count >= 3) {
    return {
      text: `${groups[0].label} was tracked consistently`,
      score: 20,
      kind: 'medication',
    };
  }

  const topGroup = groups[0];
  const extraCount = groups.length - 1;
  return {
    text: `${topGroup.label} was tracked consistently${extraCount > 0 ? `; +${extraCount} more medication${extraCount === 1 ? '' : 's'}` : ''}`,
    score: 20,
    kind: 'medication',
  };
};

const buildMoodInsight = (entries = []) => {
  const moodEntries = entries.filter(isMoodEntry);
  if (moodEntries.length < 2) {
    return null;
  }

  const labels = [];
  moodEntries
    .slice()
    .sort((a, b) => getEntryDate(a) - getEntryDate(b))
    .forEach((entry) => {
      const label = getMoodLabel(entry);
      if (!label) {
        return;
      }

      if (labels[labels.length - 1] !== label) {
        labels.push(label);
      }
    });

  if (labels.length < 2) {
    return null;
  }

  const uniqueLabels = labels.filter((label, index) => labels.indexOf(label) === index);
  return {
    text: `Mood shifted (${uniqueLabels.slice(0, 3).join(' → ')}${uniqueLabels.length > 3 ? '…' : ''})`,
    score: 80,
    kind: 'mood',
  };
};

const buildSleepInsight = (entries = []) => {
  const sleepEntries = entries.filter(isSleepEntry);
  if (!sleepEntries.length) {
    return null;
  }

  const disturbedCount = sleepEntries.filter((entry) => DISTURBED_SLEEP_PATTERNS.some((pattern) => pattern.test(getSearchText(entry)))).length;
  if (disturbedCount > 0) {
    return {
      text: disturbedCount > 1
        ? 'Sleep looked restless on multiple entries'
        : 'Sleep looked restless',
      score: 90,
      kind: 'sleep',
    };
  }

  const durations = sleepEntries
    .map((entry) => Number(entry.durationHours || entry.sleepHours || entry.originalData?.durationHours || entry.originalData?.sleepHours))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (durations.length >= 2) {
    const average = durations.reduce((sum, value) => sum + value, 0) / durations.length;
    if (average < 7) {
      return {
        text: `Sleep averaged ${average.toFixed(1)} hours`,
        score: 85,
        kind: 'sleep',
      };
    }
  }

  return null;
};

const buildBehaviorInsight = (entries = []) => {
  const behaviorEntries = entries.filter(isBehaviorEntry);
  if (!behaviorEntries.length) {
    return null;
  }

  const buckets = behaviorEntries.reduce((acc, entry) => {
    const text = getSearchText(entry);
    const matchedRule = BEHAVIOR_SIGNAL_RULES.find((rule) => rule.terms.some((pattern) => pattern.test(text)));
    if (!matchedRule) {
      return acc;
    }

    if (!acc[matchedRule.key]) {
      acc[matchedRule.key] = {
        label: matchedRule.label,
        score: matchedRule.score,
        count: 0,
      };
    }

    acc[matchedRule.key].count += 1;
    return acc;
  }, {});

  const bucketsList = Object.values(buckets)
    .sort((a, b) => b.score - a.score || b.count - a.count || a.label.localeCompare(b.label));

  if (!bucketsList.length) {
    return null;
  }

  const top = bucketsList[0];
  return {
    text: top.count > 1
      ? `${top.label} appeared ${top.count} times`
      : `${top.label} appeared`,
    score: top.score,
    kind: 'behavior',
  };
};

const buildEveningClusterInsight = (entries = []) => {
  const eveningEntries = entries.filter((entry) => {
    const date = getEntryDate(entry);
    if (!isValidDate(date)) {
      return false;
    }

    const hour = date.getHours();
    return hour >= 17 && hour <= 21;
  });

  if (eveningEntries.length >= 3) {
    return {
      text: 'Several entries clustered in the evening',
      score: 60,
      kind: 'pattern',
    };
  }

  return null;
};

const buildFoodInsight = (entries = []) => {
  const foodEntries = entries.filter(isFoodEntry);
  if (!foodEntries.length) {
    return null;
  }

  const signalEntries = foodEntries.filter((entry) => FOOD_SIGNAL_PATTERNS.some((pattern) => pattern.test(getSearchText(entry))));
  if (signalEntries.length > 0) {
    return {
      text: signalEntries.length > 1
        ? 'Food notes pointed to selective eating'
        : 'Food notes pointed to a concern',
      score: 50,
      kind: 'food',
    };
  }

  return null;
};

export const buildDailyInsight = (entries = []) => {
  if (!Array.isArray(entries) || !entries.length) {
    return { title: 'Quick take', bullets: [] };
  }

  const normalizedEntries = entries
    .map((entry) => {
      const date = getEntryDate(entry);
      return isValidDate(date) ? { entry, date } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.date - b.date)
    .map(({ entry }) => entry);

  const candidates = [
    buildMoodInsight(normalizedEntries),
    buildSleepInsight(normalizedEntries),
    buildBehaviorInsight(normalizedEntries),
    buildMedicationInsight(normalizedEntries),
    buildEveningClusterInsight(normalizedEntries),
    buildFoodInsight(normalizedEntries),
  ]
    .filter(Boolean)
    .map((candidate, index) => ({
      score: candidate.score ?? 0,
      text: candidate.text,
      kind: candidate.kind || `signal-${index}`,
    }))
    .sort((a, b) => b.score - a.score || a.text.localeCompare(b.text));

  return {
    title: 'Quick take',
    bullets: candidates.slice(0, 3).map((candidate) => ({ text: candidate.text, kind: candidate.kind })),
  };
};
