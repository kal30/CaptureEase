const createPalette = (bg, text, border, dot = border) => ({ bg, text, border, dot });

export const LOG_TYPES = {
  sleep: {
    id: 'sleep',
    category: 'sleep',
    type: 'sleep',
    timelineType: 'sleep',
    displayLabel: 'Sleep',
    filterLabel: 'Sleep',
    trackLabel: 'Sleep',
    icon: '😴',
    palette: createPalette('#F5F6FC', '#3949AB', '#D7DAEE', '#3949AB'),
    trackChip: true,
    trackOrder: 2,
    filterGroup: 'entryType',
  },
  food: {
    id: 'food',
    category: 'food',
    type: 'food',
    timelineType: 'food',
    displayLabel: 'Food',
    filterLabel: 'Food',
    trackLabel: 'Food',
    icon: '🍽️',
    palette: createPalette('#FAF9F8', '#7C5A3A', '#E5DFD8', '#7C5A3A'),
    trackChip: true,
    trackOrder: 3,
    filterGroup: 'entryType',
  },
  medication: {
    id: 'medication',
    category: 'medication',
    type: 'medication',
    timelineType: 'medication',
    displayLabel: 'Meds',
    filterLabel: 'Meds',
    trackLabel: 'Meds',
    icon: '💊',
    palette: createPalette('#F5FAF6', '#355534', '#D7E2D6', '#355534'),
    trackChip: true,
    trackOrder: 1,
    filterGroup: 'entryType',
  },
  bathroom: {
    id: 'bathroom',
    category: 'bathroom',
    type: 'bathroom',
    timelineType: 'bathroom',
    displayLabel: 'Toilet',
    filterLabel: 'Toilet',
    trackLabel: 'Toilet',
    icon: '🚽',
    palette: createPalette('#F4FAF9', '#267F6E', '#D4E5E2', '#267F6E'),
    trackChip: true,
    trackOrder: 4,
    filterGroup: 'entryType',
  },
  activity: {
    id: 'activity',
    category: 'activity',
    type: 'activity',
    timelineType: 'activity',
    displayLabel: 'Activity',
    filterLabel: 'Activity',
    trackLabel: 'Activity',
    icon: '🕐',
    palette: createPalette('rgba(255, 77, 109, 0.05)', '#FF4D6D', '#FFB3C1', '#FF4D6D'),
    trackChip: true,
    trackOrder: 5,
    filterGroup: 'entryType',
  },
  health: {
    id: 'health',
    category: 'health',
    type: 'health',
    timelineType: 'health',
    displayLabel: 'Health',
    filterLabel: 'Health',
    trackLabel: 'Health',
    icon: '💊',
    palette: createPalette('#F0FAF5', '#0A6640', '#1E9E6B'),
    trackChip: false,
    filterGroup: 'entryType',
  },
  behavior: {
    id: 'behavior',
    category: 'behavior',
    type: 'behavior',
    timelineType: 'behavior',
    displayLabel: 'Behavior',
    filterLabel: 'Behavior',
    trackLabel: 'Behavior',
    icon: '🌪️',
    palette: createPalette('rgba(199, 125, 17, 0.05)', '#C77D11', '#E5C9A0', '#C77D11'),
    trackChip: true,
    trackOrder: 6,
    filterGroup: 'flagged',
  },
  mood: {
    id: 'mood',
    category: 'mood',
    type: 'mood',
    timelineType: 'mood',
    displayLabel: 'Mood',
    filterLabel: 'Mood',
    trackLabel: 'Mood',
    icon: '😰',
    palette: createPalette('#FFF0F5', '#9E1A4A', '#D44D7A'),
    trackChip: false,
    filterGroup: 'flagged',
  },
  milestone: {
    id: 'milestone',
    category: 'milestone',
    type: 'milestone',
    timelineType: 'milestone',
    displayLabel: 'Win',
    filterLabel: 'Win',
    trackLabel: 'Win',
    icon: '⭐',
    palette: createPalette('#F0FAF0', '#1E7E34', '#34A853'),
    trackChip: false,
    filterGroup: 'flagged',
  },
  log: {
    id: 'log',
    category: 'dailyLog',
    type: 'dailyLog',
    timelineType: 'dailyLog',
    displayLabel: 'Daily Log',
    filterLabel: 'Daily Log',
    trackLabel: 'Daily Log',
    icon: '📝',
    palette: createPalette('#F5F5F5', '#555555', '#AAAAAA'),
    trackChip: false,
    filterGroup: 'entryType',
  },
};

export const TAG_TYPES = {
  meltdown: {
    id: 'meltdown',
    label: 'Meltdown',
    icon: '🌋',
    category: 'behavior',
    placeholder: 'What triggered it? How long did it last?',
  },
  win: {
    id: 'win',
    label: 'Win',
    icon: '⭐',
    category: 'milestone',
    placeholder: 'What happened? Celebrate it!',
  },
  anxiety: {
    id: 'anxiety',
    label: 'Anxiety',
    icon: '😰',
    category: 'mood',
    placeholder: 'What caused it? How did they respond?',
  },
  sensory: {
    id: 'sensory',
    label: 'Sensory',
    icon: '🌀',
    category: 'health',
    placeholder: 'What triggered it? Sounds, lights, textures, crowds?',
  },
};

export const SPECIAL_FILTER_TYPES = {
  importantMoment: {
    id: 'importantMoment',
    value: 'importantMoment',
    label: 'Important Moments',
    titlePrefix: 'Important Moment',
    icon: '⭐',
    color: createPalette('#FFFBF0', '#8A5A00', '#F4B400'),
  },
};

export const CATEGORY_COLORS = Object.entries(LOG_TYPES).reduce((acc, [, type]) => {
  acc[type.category] = type.palette;
  return acc;
}, {
  importantMoment: SPECIAL_FILTER_TYPES.importantMoment.color,
});

export const QUICK_TAG_CATEGORY_MAP = Object.entries(TAG_TYPES).reduce((acc, [tagId, tagType]) => {
  acc[tagId] = tagType.category;
  return acc;
}, {});

export const QUICK_TAG_PLACEHOLDERS = Object.entries(TAG_TYPES).reduce((acc, [tagId, tagType]) => {
  acc[tagId] = tagType.placeholder;
  return acc;
}, {});

export const QUICK_TAG_GROUPS = [
  {
    id: 'quick-context',
    label: 'Quick context',
    items: ['meltdown', 'win', 'anxiety', 'sensory'].map((tagId) => ({
      key: tagId,
      label: TAG_TYPES[tagId].label,
      icon: TAG_TYPES[tagId].icon,
    })),
  },
];

export const TRACK_LOG_TYPES = Object.values(LOG_TYPES)
  .filter((type) => type.trackChip)
  .sort((a, b) => (a.trackOrder || 999) - (b.trackOrder || 999));

export const CORE_ENTRY_ACTIONS = [
  {
    key: 'meds',
    type: 'medication',
    label: LOG_TYPES.medication.displayLabel,
    icon: LOG_TYPES.medication.icon,
    color: LOG_TYPES.medication.palette.dot,
  },
  {
    key: 'sleep',
    type: 'sleep',
    label: LOG_TYPES.sleep.displayLabel,
    icon: LOG_TYPES.sleep.icon,
    color: LOG_TYPES.sleep.palette.dot,
  },
  {
    key: 'food',
    type: 'food',
    label: LOG_TYPES.food.displayLabel,
    icon: LOG_TYPES.food.icon,
    color: LOG_TYPES.food.palette.dot,
  },
  {
    key: 'toilet',
    type: 'bathroom',
    label: LOG_TYPES.bathroom.displayLabel,
    icon: LOG_TYPES.bathroom.icon,
    color: LOG_TYPES.bathroom.palette.dot,
  },
  {
    key: 'activity',
    type: 'activity',
    label: LOG_TYPES.activity.displayLabel,
    icon: LOG_TYPES.activity.icon,
    color: LOG_TYPES.activity.palette.dot,
  },
  {
    key: 'behavior',
    type: 'behavior',
    label: LOG_TYPES.behavior.displayLabel,
    icon: LOG_TYPES.behavior.icon,
    color: LOG_TYPES.behavior.palette.dot,
  },
];

export const TIMELINE_FILTER_SECTIONS = {
  allEntries: {
    value: null,
    label: 'All entries',
  },
  entryType: {
    label: 'Entry type',
    items: TRACK_LOG_TYPES.map((type) => ({
      value: type.category,
      label: type.filterLabel,
      icon: type.icon,
    })),
  },
  flaggedAs: {
    label: 'Flagged as',
    items: [
      SPECIAL_FILTER_TYPES.importantMoment,
      LOG_TYPES.behavior,
      LOG_TYPES.milestone,
      LOG_TYPES.mood,
    ].map((type) => ({
      value: type.value || type.category,
      label: type.label || type.filterLabel,
      icon: type.icon,
    })),
  },
};

export const getLogTypeById = (id) => LOG_TYPES[id] || LOG_TYPES.log;

export const getLogTypeByCategory = (category) => {
  if (!category) return LOG_TYPES.log;
  if (LOG_TYPES[category]) return LOG_TYPES[category];

  if (category === 'dailyLog' || category === 'log') {
    return LOG_TYPES.log;
  }

  return LOG_TYPES.log;
};

const BATHROOM_KEYWORDS = [
  'bathroom',
  'toileting',
  'toilet',
  'urination',
  'urinated',
  'pee',
  'peeing',
  'bowel movement',
  'bowel',
  'poop',
  'stool',
  'diaper',
  'accident',
];

const inferBathroomCategory = (entry = {}) => {
  const haystack = [
    entry.category,
    entry.timelineType,
    entry.type,
    entry.titlePrefix,
    entry.title,
    entry.label,
    entry.displayLabel,
    entry.text,
    entry.content,
    entry.summary,
    entry.notes,
    entry.bathroomDetails?.type,
    entry.bathroomDetails?.location,
    ...(entry.tags || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return BATHROOM_KEYWORDS.some((keyword) => haystack.includes(keyword));
};

const BEHAVIOR_IDENTIFIERS = new Set(['behavior', 'behavioral']);

export const isBehaviorIncidentEntry = (entry = {}) => Boolean(
  (
    entry?.logCategory && String(entry.logCategory).toLowerCase() !== 'behavior'
      ? false
      : (
        entry?.incidentStyle ||
        entry?.entryType === 'incident' ||
        entry?.incidentData ||
        BEHAVIOR_IDENTIFIERS.has(String(entry?.category || '').toLowerCase()) ||
        BEHAVIOR_IDENTIFIERS.has(String(entry?.timelineType || '').toLowerCase()) ||
        BEHAVIOR_IDENTIFIERS.has(String(entry?.type || '').toLowerCase()) ||
        BEHAVIOR_IDENTIFIERS.has(String(entry?.categoryLabel || '').toLowerCase()) ||
        BEHAVIOR_IDENTIFIERS.has(String(entry?.titlePrefix || '').toLowerCase()) ||
        BEHAVIOR_IDENTIFIERS.has(String(entry?.incidentCategoryId || '').toLowerCase()) ||
        BEHAVIOR_IDENTIFIERS.has(String(entry?.label || '').toLowerCase())
      )
  )
);

export const getLogTypeByEntry = (entry = {}) => {
  if (!entry || typeof entry !== 'object') {
    return LOG_TYPES.log;
  }

  const directCategory = entry.logCategory || entry.category || entry.timelineType || entry.type;
  const directType = getLogTypeByCategory(directCategory);

  if (directCategory && (directType !== LOG_TYPES.log || directCategory === 'log')) {
    return directType;
  }

  if (isBehaviorIncidentEntry(entry)) {
    return LOG_TYPES.behavior;
  }

  if (inferBathroomCategory(entry)) {
    return LOG_TYPES.bathroom;
  }

  return directType;
};

export const getTagTypeById = (id) => TAG_TYPES[id] || null;

export const getTrackLogTypes = () => TRACK_LOG_TYPES;

export const getQuickTagGroups = () => QUICK_TAG_GROUPS;

export const getQuickTagPlaceholder = (tagId) => QUICK_TAG_PLACEHOLDERS[tagId] || "Just write what happened — we'll figure out the rest.";

export const getQuickTagCategory = (tagId) => QUICK_TAG_CATEGORY_MAP[tagId] || 'log';

export const getTimelineFilterSections = () => TIMELINE_FILTER_SECTIONS;

export const getTimelineMetaForCategory = (category, { importantMoment = false } = {}) => {
  if (importantMoment) {
    return {
      type: 'importantMoment',
      timelineType: 'importantMoment',
      titlePrefix: SPECIAL_FILTER_TYPES.importantMoment.titlePrefix,
      label: SPECIAL_FILTER_TYPES.importantMoment.titlePrefix,
      color: SPECIAL_FILTER_TYPES.importantMoment.color.dot,
      icon: SPECIAL_FILTER_TYPES.importantMoment.icon,
    };
  }

  const logType = getLogTypeByCategory(category);
  return {
    type: logType.type,
    timelineType: logType.timelineType,
    titlePrefix: logType.displayLabel,
    label: logType.displayLabel,
    color: logType.palette.dot,
    icon: logType.icon,
  };
};

export const getCanonicalEntryDisplayInfo = (entry = {}) => {
  const categoryType = getLogTypeByEntry(entry);
  const categoryMeta = getLogTypeByCategory(categoryType.category || entry.category || entry.type);
  const isBehaviorIncident = isBehaviorIncidentEntry(entry);

  return {
    category: categoryType.category || entry.category || entry.type || 'log',
    label: isBehaviorIncident
      ? LOG_TYPES.behavior.displayLabel
      : (categoryMeta.trackLabel || categoryMeta.displayLabel || categoryMeta.filterLabel || 'Log'),
    icon: isBehaviorIncident
      ? LOG_TYPES.behavior.icon
      : (categoryMeta.icon || '•'),
    palette: isBehaviorIncident
      ? LOG_TYPES.behavior.palette
      : (categoryMeta.palette || null),
    titlePrefix: isBehaviorIncident
      ? LOG_TYPES.behavior.displayLabel
      : (categoryMeta.trackLabel || categoryMeta.displayLabel || 'Log'),
  };
};
