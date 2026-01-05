import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from './firebase';

export const updateLog = async (logId, updates = {}) => {
  if (!logId) {
    throw new Error('logId is required');
  }

  const payload = {
    ...updates,
    updatedAt: serverTimestamp()
  };

  await updateDoc(doc(db, 'logs', logId), payload);
};

export const archiveLog = async (logId) => {
  if (!logId) {
    throw new Error('logId is required');
  }

  const auth = getAuth();
  const userId = auth.currentUser?.uid || 'unknown';

  await updateDoc(doc(db, 'logs', logId), {
    status: 'archived',
    archivedAt: serverTimestamp(),
    archivedBy: userId,
    updatedAt: serverTimestamp()
  });
};
