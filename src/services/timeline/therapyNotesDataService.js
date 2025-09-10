import { getDayDateRange } from './dateUtils';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Get therapy notes for a specific child and date
 * Follows same pattern as incidentDataService, journalDataService, etc.
 * @param {string} childId - Child ID
 * @param {Date} selectedDate - Date to fetch therapy notes for
 * @returns {Promise<Array>} - Array of therapy note objects
 */
export const getTherapyNotes = async (childId, selectedDate) => {
  try {
    const { start, end } = getDayDateRange(selectedDate);
    
    // Query therapyNotes collection - same pattern as other services
    const therapyNotesQuery = query(
      collection(db, 'therapyNotes'),
      where('childId', '==', childId),
      where('timestamp', '>=', start),
      where('timestamp', '<=', end),
      orderBy('timestamp', 'desc')
    );
    
    const snapshot = await getDocs(therapyNotesQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date(doc.data().createdAt),
      type: 'therapyNote', // Timeline entry type
      collection: 'therapyNotes'
    }));
    
  } catch (error) {
    console.error('Error fetching therapy notes:', error);
    // Fallback query without orderBy if index missing
    try {
      const { start, end } = getDayDateRange(selectedDate);
      const fallbackQuery = query(
        collection(db, 'therapyNotes'),
        where('childId', '==', childId),
        where('timestamp', '>=', start),
        where('timestamp', '<=', end)
      );
      
      const snapshot = await getDocs(fallbackQuery);
      const entries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(doc.data().createdAt),
        type: 'therapyNote',
        collection: 'therapyNotes'
      }));
      
      // Sort in memory if index not available
      return entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (fallbackError) {
      console.error('Error with fallback therapy notes query:', fallbackError);
      return [];
    }
  }
};

/**
 * Create a new therapy note entry
 * @param {string} childId - Child ID
 * @param {Object} noteData - Therapy note data
 * @returns {Promise<string>} - Created document ID
 */
export const createTherapyNote = async (childId, noteData) => {
  try {
    const therapyNote = {
      childId,
      createdBy: noteData.createdBy,
      createdAt: serverTimestamp(),
      timestamp: new Date(),
      
      // Therapy-specific fields
      noteType: noteData.noteType || 'observation', // observation|progress|recommendation|question
      title: noteData.title || '',
      content: noteData.content || '',
      
      // Professional context
      sessionType: noteData.sessionType || 'therapy', // therapy|assessment|consultation
      clinicalArea: noteData.clinicalArea || '', // speech|motor|behavioral|cognitive
      
      // Tagging system  
      tags: noteData.tags || [], // ['#therapy', '#progress', '#speech']
      category: noteData.category || 'therapy', // therapy|assessment|progress
      
      // Threading support (like other timeline entries)
      replies: [],
      
      // Permissions
      visibility: noteData.visibility || 'care_team',
      
      // Professional metadata
      professionalNote: true,
      userRole: 'therapist'
    };
    
    const docRef = await addDoc(collection(db, 'therapyNotes'), therapyNote);
    return docRef.id;
  } catch (error) {
    console.error('Error creating therapy note:', error);
    throw error;
  }
};

/**
 * Add reply to therapy note (same threading pattern as other timeline entries)
 * @param {string} noteId - Therapy note ID
 * @param {Object} replyData - Reply data
 * @returns {Promise<void>}
 */
export const addReplyToTherapyNote = async (noteId, replyData) => {
  try {
    const noteRef = doc(db, 'therapyNotes', noteId);
    
    const reply = {
      id: Date.now().toString(), // Simple ID for reply
      userId: replyData.userId,
      userRole: replyData.userRole,
      text: replyData.text,
      createdAt: new Date(),
      timestamp: serverTimestamp()
    };
    
    // Add reply to the replies array (same pattern as incidents)
    const currentDoc = await getDocs(query(collection(db, 'therapyNotes'), where('__name__', '==', noteId)));
    const currentData = currentDoc.docs[0]?.data();
    const currentReplies = currentData?.replies || [];
    
    await updateDoc(noteRef, {
      replies: [...currentReplies, reply],
      lastModified: serverTimestamp()
    });
  } catch (error) {
    console.error('Error adding reply to therapy note:', error);
    throw error;
  }
};