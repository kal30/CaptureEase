const MONTH_INDEX_BY_NAME = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

const parseLocalDateString = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const toDateStringMatch = trimmed.match(/^[A-Za-z]{3}\s+([A-Za-z]{3})\s+(\d{1,2})\s+(\d{4})$/);
  if (toDateStringMatch) {
    const monthKey = toDateStringMatch[1].toLowerCase();
    const month = MONTH_INDEX_BY_NAME[monthKey];
    const day = Number(toDateStringMatch[2]);
    const year = Number(toDateStringMatch[3]);
    if (month !== undefined && !Number.isNaN(day) && !Number.isNaN(year)) {
      return new Date(year, month, day);
    }
  }

  const isoDateOnlyMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDateOnlyMatch) {
    const year = Number(isoDateOnlyMatch[1]);
    const month = Number(isoDateOnlyMatch[2]) - 1;
    const day = Number(isoDateOnlyMatch[3]);
    return new Date(year, month, day);
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const coerceCalendarDate = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value?.toDate === 'function') {
    const resolved = value.toDate();
    return resolved instanceof Date && !Number.isNaN(resolved.getTime()) ? resolved : null;
  }

  if (typeof value === 'string') {
    return parseLocalDateString(value);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const getCalendarDateKey = (value) => {
  const date = coerceCalendarDate(value);
  if (!date) {
    return '';
  }

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
};

export const getCalendarEntryDateKey = (entry) => {
  const source = entry?.originalData || entry?.rawData || entry;
  const candidates = [
    source?.entryDate?.toDate?.(),
    source?.entryDate,
    source?.date?.toDate?.(),
    source?.date,
    source?.timestamp?.toDate?.(),
    source?.timestamp,
    source?.createdAt?.toDate?.(),
    source?.createdAt,
    entry?.entryDate?.toDate?.(),
    entry?.entryDate,
    entry?.date?.toDate?.(),
    entry?.date,
    entry?.timestamp?.toDate?.(),
    entry?.timestamp,
    entry?.createdAt?.toDate?.(),
    entry?.createdAt,
  ];

  for (const candidate of candidates) {
    const key = getCalendarDateKey(candidate);
    if (key) {
      return key;
    }
  }

  return '';
};

export const getCalendarDateKeys = (entries = []) => {
  const keys = new Set();

  entries.forEach((entry) => {
    const key = getCalendarEntryDateKey(entry);
    if (key) {
      keys.add(key);
    }
  });

  return keys;
};
