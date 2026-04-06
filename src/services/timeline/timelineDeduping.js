const getEntryTimestamp = (entry) => {
  const raw = entry?.timestamp?.toDate?.() || entry?.timestamp || entry?.createdAt || entry?.date;
  const date = raw instanceof Date ? raw : new Date(raw);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
};

const normalizeText = (value = '') =>
  String(value)
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const getEntrySignature = (entry = {}) => {
  const parts = [
    entry.titlePrefix,
    entry.title,
    entry.content,
    entry.notes,
    entry.text,
    entry.description,
    entry.summary,
    entry.category,
    entry.timelineType,
    entry.type,
  ]
    .filter(Boolean)
    .map(normalizeText);

  return parts.join(' | ');
};

const getEntryStrength = (entry = {}) => {
  let score = 0;

  if (entry.titlePrefix && normalizeText(entry.titlePrefix) !== 'daily log') score += 3;
  if (entry.title && normalizeText(entry.title) !== 'daily log') score += 2;
  if (entry.content || entry.notes || entry.text || entry.description || entry.summary) score += 3;
  if (entry.category && entry.category !== 'log') score += 1;
  if (entry.source) score += 1;
  if (entry.tags?.length) score += 1;
  if (entry.sleepDetails || entry.foodDetails || entry.bathroomDetails || entry.medicationDetails) score += 2;

  return score;
};

export const getTimelineDedupKey = (entry = {}) => {
  const minuteBucket = Math.floor(getEntryTimestamp(entry).getTime() / 60000);
  const signature = getEntrySignature(entry);
  const importantMoment = entry.importantMoment || entry.isImportantMoment ? 'important' : 'normal';
  return [importantMoment, entry.childId || 'child', entry.category || entry.type || 'log', minuteBucket, signature].join('|');
};

export const dedupeTimelineEntries = (entries = []) => {
  const sortedEntries = [...entries].sort((a, b) => getEntryTimestamp(b) - getEntryTimestamp(a));
  const deduped = new Map();

  sortedEntries.forEach((entry) => {
    const key = getTimelineDedupKey(entry);
    const existing = deduped.get(key);

    if (!existing) {
      deduped.set(key, entry);
      return;
    }

    if (getEntryStrength(entry) > getEntryStrength(existing)) {
      deduped.set(key, entry);
    }
  });

  return [...deduped.values()].sort((a, b) => getEntryTimestamp(b) - getEntryTimestamp(a));
};
