import * as XLSX from 'xlsx';
import * as mammoth from 'mammoth/mammoth.browser';
import { httpsCallable } from 'firebase/functions';
import { collection, doc, getDocs, query, serverTimestamp, where, writeBatch } from 'firebase/firestore';
import { db, functions } from '../../../services/firebase';
const parseImportedLogsCallable = httpsCallable(functions, 'parseImportedLogs');
export const MAX_IMPORT_FILE_SIZE_BYTES = 8 * 1024 * 1024;
export const MAX_IMPORT_TEXT_LENGTH = 250000;

const getFileExtension = (fileName = '') => {
  const parts = String(fileName).toLowerCase().split('.');
  return parts.length > 1 ? parts.pop() : '';
};

const readFileAsArrayBuffer = async (file) => {
  if (typeof file?.arrayBuffer === 'function') {
    return file.arrayBuffer();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Unable to read file.'));
    reader.onload = () => resolve(reader.result);
    reader.readAsArrayBuffer(file);
  });
};

const parseDateForStorage = (value) => {
  if (!value) {
    return new Date();
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? new Date() : value;
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  if (typeof value === 'string') {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      const [, year, month, day] = match;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }
  }

  return new Date();
};

const normalizeComparableText = (value = '') => String(value || '')
  .toLowerCase()
  .replace(/https?:\/\/\S+/g, ' ')
  .replace(/[^a-z0-9]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const getDateKey = (value) => {
  const date = parseDateForStorage(value);
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '';
  }

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
};

const normalizeImportCategory = (category) => {
  const normalized = String(category || 'log').trim().toLowerCase();

  const aliases = {
    daily: 'log',
    other: 'log',
    behavior: 'challenge',
    behavior_meltdown: 'challenge',
    meltdown: 'challenge',
    mood: 'mood',
    anxiety: 'mood',
    health: 'health',
    milestone: 'milestone',
    win: 'milestone',
    sleep: 'sleep',
    food: 'food',
    mealtime: 'food',
    bathroom: 'bathroom',
    toilet: 'bathroom',
    toileting: 'bathroom',
    medication: 'medication',
    medical_note: 'health',
    log: 'log',
    challenge: 'challenge',
  };

  return aliases[normalized] || 'log';
};

export const fetchExistingLogsForChild = async (childId) => {
  if (!childId) {
    return [];
  }

  const snapshot = await getDocs(
    query(
      collection(db, 'dailyLogs'),
      where('childId', '==', childId),
      where('status', '==', 'active')
    )
  );

  return snapshot.docs.map((snapshotDoc) => {
    const data = snapshotDoc.data();
    const timestamp = data.timestamp?.toDate?.()
      || data.createdAt?.toDate?.()
      || data.timestamp
      || data.createdAt
      || null;

    return {
      id: snapshotDoc.id,
      childId: data.childId || childId,
      category: normalizeImportCategory(data.category),
      importance: data.importance === 'important' ? 'important' : 'normal',
      note: data.text || data.note || data.content || '',
      timestamp,
      dateKey: getDateKey(timestamp),
      normalizedNote: normalizeComparableText(data.text || data.note || data.content || ''),
      normalizedCategory: normalizeImportCategory(data.category),
    };
  });
};

export const detectPossibleDuplicateImportRow = (row, existingLogs = []) => {
  const rowDateKey = getDateKey(row.date);
  const rowNote = normalizeComparableText(row.note);
  const rowCategory = normalizeImportCategory(row.category);

  if (!rowNote || !existingLogs.length) {
    return { matched: false, reason: '' };
  }

  for (const existing of existingLogs) {
    const existingNote = existing.normalizedNote || normalizeComparableText(existing.note);
    if (!existingNote) {
      continue;
    }

    const categoryMatches = rowCategory === (existing.normalizedCategory || normalizeImportCategory(existing.category));
    const dateMatches = !rowDateKey || !existing.dateKey || rowDateKey === existing.dateKey;
    const exactNoteMatch = rowNote === existingNote;
    const noteContainsMatch = rowNote.length >= 12 && (
      rowNote.includes(existingNote) ||
      existingNote.includes(rowNote)
    );

    if (categoryMatches && dateMatches && (exactNoteMatch || noteContainsMatch)) {
      return {
        matched: true,
        reason: exactNoteMatch ? 'Same date, category, and note' : 'Same date and similar note',
        existingId: existing.id,
      };
    }
  }

  return { matched: false, reason: '' };
};

export const extractTextFromImportFile = async (file) => {
  if (!file) {
    throw new Error('No file selected.');
  }

  if (file.size > MAX_IMPORT_FILE_SIZE_BYTES) {
    throw new Error('That file is too large to import. Please split it into a smaller file and try again.');
  }

  const extension = getFileExtension(file.name);
  const arrayBuffer = await readFileAsArrayBuffer(file);

  if (extension === 'xlsx') {
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const extractedText = workbook.SheetNames.map((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        raw: false,
        defval: '',
      });

      const normalizedRows = rows
        .map((row) => (Array.isArray(row)
          ? row.map((cell) => String(cell).trim()).filter(Boolean).join('\t')
          : String(row).trim()))
        .filter(Boolean);

      return [`Sheet: ${sheetName}`, ...normalizedRows].join('\n');
    }).join('\n\n');

    return extractedText.trim();
  }

  if (extension === 'docx') {
    const result = await mammoth.extractRawText({ arrayBuffer });
    return (result.value || '').trim();
  }

  throw new Error('Unsupported file type. Please upload an .xlsx or .docx file.');
};

export const parseImportedLogs = async (text) => {
  if (typeof text === 'string' && text.length > MAX_IMPORT_TEXT_LENGTH) {
    throw new Error('That file is too large to import. Please split it into a smaller file and try again.');
  }

  const response = await parseImportedLogsCallable({ text });
  return response.data;
};

export const saveImportedLogs = async ({
  rows = [],
  childId,
  user,
}) => {
  if (!childId) {
    throw new Error('Please select a child before importing logs.');
  }

  if (!user?.uid) {
    throw new Error('You must be signed in to import logs.');
  }

  if (!rows.length) {
    throw new Error('There are no rows to save.');
  }

  const batch = writeBatch(db);
  const normalizedRows = rows.map((row) => {
    const normalizedDate = parseDateForStorage(row.date);
    const safeDate = Number.isNaN(normalizedDate.getTime()) ? new Date() : normalizedDate;

    return {
      childId,
      createdBy: user?.uid,
      createdAt: serverTimestamp(),
      text: row.note,
      status: 'active',
      category: normalizeImportCategory(row.category),
      tags: [],
      timestamp: safeDate,
      entryDate: safeDate.toDateString(),
      authorId: user?.uid,
      authorName: user?.displayName || user?.email?.split('@')[0] || 'User',
      authorEmail: user?.email,
      source: 'import',
      importance: row.importance === 'important' ? 'important' : 'normal',
    };
  });

  normalizedRows.forEach((docData) => {
    const docRef = doc(collection(db, 'dailyLogs'));
    batch.set(docRef, docData);
  });

  await batch.commit();
  return { count: normalizedRows.length };
};

export const IMPORT_LOG_CATEGORIES = [
  'behavior',
  'health',
  'milestone',
  'mood',
  'daily',
  'other',
];
