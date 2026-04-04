import * as XLSX from 'xlsx';
import * as mammoth from 'mammoth/mammoth.browser';
import { httpsCallable } from 'firebase/functions';
import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db, functions } from '../../../services/firebase';
const parseImportedLogsCallable = httpsCallable(functions, 'parseImportedLogs');

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

export const extractTextFromImportFile = async (file) => {
  if (!file) {
    throw new Error('No file selected.');
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
      category: row.category || 'other',
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
