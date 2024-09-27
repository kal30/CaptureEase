// src/services/journalService.js
import { collection, addDoc, deleteDoc, doc, updateDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase'; // Adjust the path if necessary

// Fetch all journal entries for a specific child
export const fetchJournals = async (childId) => {
  const journalQuery = query(collection(db, `children/${childId}/journals`), orderBy('date', 'desc'));
  const querySnapshot = await getDocs(journalQuery);
  
  const journalEntries = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  return journalEntries;
};

// Add a new journal entry
export const addJournalEntry = async (childId, journalData) => {
  await addDoc(collection(db, `children/${childId}/journals`), {
    ...journalData,
    date: journalData.date || new Date(),
    timestamp: new Date(),
  });
};

// Update an existing journal entry
export const updateJournalEntry = async (childId, journalId, updatedData) => {
  const journalRef = doc(db, `children/${childId}/journals`, journalId);
  await updateDoc(journalRef, updatedData);
};

// Delete a journal entry
export const deleteJournalEntry = async (childId, journalId) => {
  const journalRef = doc(db, `children/${childId}/journals`, journalId);
  await deleteDoc(journalRef);
};