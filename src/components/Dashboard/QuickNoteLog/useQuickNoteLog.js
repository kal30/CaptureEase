import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app, auth } from '../../../services/firebase';

import { classifyEvent } from '../../../services/classificationService';
import { addBehavior } from '../../../services/behaviorService';
import { logMood } from '../../../services/moodService';

const functions = getFunctions(app, 'us-central1');
const createLogCallable = httpsCallable(functions, 'createLog');

const stopPropagation = (event) => {
  event.stopPropagation();
};

const resetMessage = { type: '', text: '' };

const useQuickNoteLog = ({ childId, onClose, onLogged }) => {
  const [note, setNote] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(resetMessage);
  const [classificationResult, setClassificationResult] = useState(null); // New state for feedback

  const resetForm = () => {
    setNote('');
    setIsImportant(false);
    setTags([]);
  };

  const handleSubmit = async () => {
    if (!note.trim()) {
      setMessage({ type: 'error', text: 'Please enter a note before submitting.' });
      return;
    }

    setLoading(true);
    setMessage(resetMessage);
    setClassificationResult(null);

    try {
      // 1. Run Smart Classification first
      const classification = classifyEvent({ type: 'note', note: note.trim() });
      const { type, confidence, buckets } = classification.classification;
      
      console.log('Smart Classification Result:', classification.classification);
      let resultMessage = 'Note logged successfully!';
      let resultData = null;

      // 2. High Confidence Routing
      if (confidence >= 0.7) {
        if (type === 'behavior') {
           // Handle Behavior
           await addBehavior(childId, {
            name: buckets[0] === 'behavioral_positive' ? 'Good Behavior' : 'Challenging Behavior',
            description: note.trim(),
            goal: null,
            iconName: buckets[0] === 'behavioral_positive' ? 'Star' : 'Alert',
            createdAt: new Date(),
            isTemplate: false
          });
          resultMessage = `✅ Logged as BEHAVIOR (${buckets[0].replace('_', ' ')})`;
          setClassificationResult({ type: 'Behavior', detail: buckets[0] });

        } else if (type === 'mood_log') {
          // Handle Mood
          const moodLevel = buckets[0].includes('positive') ? 'Happy' : 'Upset';
          await logMood(childId, moodLevel);
          
          // Also save as a log for the text content
          await createLogCallable({
            childId,
            type: 'note',
            note: note.trim(),
            source: 'app',
            tags: ['mood', moodLevel, ...tags], // Merge with existing tags
            meta: {
              noteType: isImportant ? 'important' : 'routine'
            }
          });
          
          resultMessage = `✅ Logged Mood: ${moodLevel}`;
          setClassificationResult({ type: 'Mood', detail: moodLevel });

        } else {
           // Default high confidence but generic flow
           resultData = await createLogCallable({
            childId,
            type: 'note',
            note: note.trim(),
            source: 'app',
            tags: [type, ...tags],
            meta: {
              noteType: isImportant ? 'important' : 'routine'
            }
           });
           resultMessage = `✅ Note logged. Tagged as: ${type}`;
           setClassificationResult({ type: 'General', detail: type });
        }
      } else {
        // Low confidence - Standard Log
        resultData = await createLogCallable({
          childId,
          type: 'note',
          note: note.trim(),
          source: 'app',
          tags,
          meta: {
            noteType: isImportant ? 'important' : 'routine'
          }
        });
        
        // Feedback finding: Show what it detected even if low confidence
        const detected = buckets.length ? buckets[0].replace('_', ' ') : 'General Log';
        resultMessage = `✅ Logged as ${detected}`;
      }

      setMessage({
        type: 'success',
        text: resultMessage
      });

      // Construct optimistic entry based on classification
      const trimmedNote = note.trim();
      let optimisticEntry = {
         id: resultData?.data?.logId || 'temp-' + Date.now(),
         childId,
         timestamp: new Date(),
         author: auth.currentUser?.uid || 'Unknown'
      };

      if (confidence >= 0.7 && type === 'behavior') {
        const behaviorName = buckets[0] === 'behavioral_positive' ? 'Good Behavior' : 'Challenging Behavior';
        optimisticEntry = {
          ...optimisticEntry,
          type: 'incident', // Map behavior to incident for timeline display
          incidentType: behaviorName,
          severity: buckets[0] === 'behavioral_positive' ? 'Positive' : 'Mild', // Default severity
          description: trimmedNote,
          collection: 'behaviors'
        };
      } else if (confidence >= 0.7 && type === 'mood_log') {
         const moodLevel = buckets[0].includes('positive') ? 'Happy' : 'Upset';
         optimisticEntry = {
          ...optimisticEntry,
          type: 'dailyLog', // Map mood to dailyLog for timeline display
          activityType: 'Mood Log',
          mood: moodLevel,
          notes: trimmedNote,
          collection: 'dailyCare'
        };
      } else {
        // Default Journal/Log
        const titleSource = tags?.length ? `Log: #${tags[0]}` : trimmedNote;
        optimisticEntry = {
          ...optimisticEntry,
          type: 'journal',
          collection: 'logs',
          title: titleSource && titleSource.length > 30 ? `${titleSource.substring(0, 27)}...` : (titleSource || 'Daily Log'),
          content: trimmedNote,
          meta: {
            noteType: isImportant ? 'important' : 'routine'
          }
        };
      }

      resetForm();
      onLogged?.(optimisticEntry);

      setTimeout(() => {
        onClose();
        setMessage(resetMessage);
        setClassificationResult(null);
      }, 2500); // Slightly longer to read the classification message

    } catch (error) {
      console.error('Error creating log:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to save note. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    setMessage(resetMessage);
    onClose();
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return {
    note,
    setNote,
    isImportant,
    setIsImportant,
    tags,
    setTags,
    loading,
    message,
    setMessage,
    classificationResult, // Export this
    handleSubmit,
    handleClose,
    handleKeyPress,
    stopPropagation
  };
};

export default useQuickNoteLog;
