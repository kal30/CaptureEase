import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const normalizeSnapshot = (snapshot = {}) => ({
  medicationsTaken: Array.isArray(snapshot.medicationsTaken) && snapshot.medicationsTaken.length > 0
    ? snapshot.medicationsTaken
    : ['Not logged yet'],
  foodLogged: snapshot.foodLogged || 'Not logged yet',
  activities: Array.isArray(snapshot.activities) && snapshot.activities.length > 0
    ? snapshot.activities
    : ['Not logged yet'],
  sleepQuality: snapshot.sleepQuality || 'Not logged yet',
  dataCompleteness: snapshot.dataCompleteness || {
    hasMedicationData: false,
    hasFoodData: false,
    hasActivityData: false,
    hasSleepData: false,
  },
  patternInsight: snapshot.patternInsight || 'Timing signal: No clear same-day pattern yet',
});

const buildLocalBehaviorDoc = ({ childId, incidentData, userId, fallbackContextSnapshot }) => {
  const incidentDate = incidentData?.incidentDateTime ? new Date(incidentData.incidentDateTime) : new Date();
  const severityNumber = incidentData?.severity ?? 5;
  const severityLabel = incidentData?.severityLabel
    || (severityNumber <= 3 ? 'Low' : severityNumber <= 5 ? 'Moderate' : severityNumber <= 8 ? 'High' : 'Critical');
  const notes = String(incidentData?.notes || incidentData?.description || '').trim();
  const triggerSummary = String(incidentData?.triggerSummary || '').trim();
  const remedy = String(incidentData?.remedy || '').trim();
  const contextSnapshot = normalizeSnapshot(fallbackContextSnapshot);

  const docData = {
    childId,
    collection: 'dailyLogs',
    status: 'active',
    createdBy: userId || incidentData?.authorId || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    timestamp: incidentDate,
    entryDate: incidentData?.entryDateLabel || incidentDate.toDateString(),
    entryDayKey: incidentData?.incidentDayKey || incidentData?.entryDayKey || incidentDate.toISOString().slice(0, 10),
    category: 'log',
    type: 'log',
    timelineType: 'incident',
    entryType: 'incident',
    incidentStyle: true,
    incidentCategoryId: 'behavior',
    incidentCategoryLabel: 'Behavior',
    incidentCategoryColor: '#E099B6',
    incidentCategoryIcon: '🌋',
    title: 'Behavior',
    titlePrefix: 'Behavior',
    text: incidentData?.description || notes || 'Behavior incident',
    content: [
      `Severity: ${severityLabel}${severityNumber ? ` (${severityNumber})` : ''}`,
      notes ? `Notes: ${notes}` : null,
      remedy ? `Remedy: ${remedy}` : null,
    ].filter(Boolean).join(' • '),
    severity: severityNumber,
    severityLabel,
    notes,
    triggerSummary,
    remedy,
    suspectedTriggers: Array.isArray(incidentData?.suspectedTriggers) ? incidentData.suspectedTriggers : [],
    contextSnapshot,
    incidentData: {
      severity: severityNumber,
      severityLabel,
      notes,
      triggerSummary,
      suspectedTriggers: Array.isArray(incidentData?.suspectedTriggers) ? incidentData.suspectedTriggers : [],
      remedy,
      description: incidentData?.description || notes || '',
      incidentDateTime: incidentDate.toISOString(),
      contextSnapshot,
      followUpScheduled: false,
      followUpDate: null,
      followUpNotes: null,
    },
    authorId: incidentData?.authorId || userId || null,
    authorName: incidentData?.authorName || 'Caregiver',
    authorEmail: incidentData?.authorEmail || null,
    userId: userId || incidentData?.authorId || null,
  };

  return docData;
};

export const saveBehaviorIncident = async ({ childId, incidentData, userId, fallbackContextSnapshot }) => {
  const fallbackDoc = buildLocalBehaviorDoc({
    childId,
    incidentData,
    userId,
    fallbackContextSnapshot,
  });

  const docRef = await addDoc(collection(db, 'dailyLogs'), fallbackDoc);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('captureez:timeline-entry-created', {
      detail: {
        id: docRef.id,
        ...fallbackDoc,
        childId,
      },
    }));
  }

  return {
    success: true,
    id: docRef.id,
    entry: {
      id: docRef.id,
      ...fallbackDoc,
    },
    fallbackUsed: true,
  };
};
