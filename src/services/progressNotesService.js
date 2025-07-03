// src/services/progressNotesService.js
import { collection, addDoc, deleteDoc, doc, updateDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase'; // Adjust the path if necessary
import { Timestamp } from 'firebase/firestore';


// Fetch all progress notes for a specific child
export const fetchProgressNotes = async (childId) => {
  const progressNotesQuery = query(collection(db, `children/${childId}/progressNotes`), orderBy('date', 'desc'));
  const querySnapshot = await getDocs(progressNotesQuery);
  
  const progressNotesEntries = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  return progressNotesEntries;
};

// Add a new progress note
export const addProgressNote = async (childId, progressNoteData) => {
  await addDoc(collection(db, `children/${childId}/progressNotes`), {
    ...progressNoteData,
    date: Timestamp.fromDate(new Date()),
    timestamp: new Date(),
  });
};

// Update an existing progress note
export const updateProgressNote = async (childId, progressNoteId, updatedData) => {
  const progressNoteRef = doc(db, `children/${childId}/progressNotes`, progressNoteId);
  await updateDoc(progressNoteRef, updatedData);
};

// Delete a progress note
export const deleteProgressNote = async (childId, progressNoteId) => {
  const progressNoteRef = doc(db, `children/${childId}/progressNotes`, progressNoteId);
  await deleteDoc(progressNoteRef);
};