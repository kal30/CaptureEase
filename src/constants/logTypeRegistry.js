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
    palette: createPalette('#F0EEFA', '#5B2D9E', '#7C4DCC'),
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
    palette: createPalette('#FFF8E6', '#A05C00', '#F4A400'),
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
    palette: createPalette('#EEF9F1', '#0A6640', '#1E9E6B'),
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
    palette: createPalette('#F5E8DB', '#7A4B22', '#B8773A'),
    trackChip: true,
    trackOrder: 4,
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
    filterLabel: 'Behavior / Meltdown',
    trackLabel: 'Behavior',
    icon: '🌋',
    palette: createPalette('#FFF0E6', '#C4420A', '#E8683A'),
    trackChip: false,
    filterGroup: 'flagged',
  },
  mood: {
    id: 'mood',
    category: 'mood',
    type: 'mood',
    timelineType: 'mood',
    displayLabel: 'Mood',
    filterLabel: 'Anxiety',
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

export const getLogTypeByEntry = (entry = {}) => {
  if (!entry || typeof entry !== 'object') {
    return LOG_TYPES.log;
  }

  const directCategory = entry.category || entry.timelineType || entry.type;
  const directType = getLogTypeByCategory(directCategory);
  if (directType !== LOG_TYPES.log || directCategory === 'log') {
    return directType;
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

  return {
    category: categoryType.category || entry.category || entry.type || 'log',
    label: categoryMeta.trackLabel || categoryMeta.displayLabel || categoryMeta.filterLabel || 'Log',
    icon: categoryMeta.icon || '•',
    palette: categoryMeta.palette || null,
    titlePrefix: categoryMeta.trackLabel || categoryMeta.displayLabel || 'Log',
  };
};
