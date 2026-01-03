import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../../../services/firebase';

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

    try {
      const result = await createLogCallable({
        childId,
        type: 'note',
        note: note.trim(),
        source: 'app',
        tags,
        meta: {
          noteType: isImportant ? 'important' : 'routine'
        }
      });

      console.log('Log created successfully:', result.data);

      setMessage({
        type: 'success',
        text: 'Note logged successfully!'
      });

      resetForm();
      onLogged?.();

      setTimeout(() => {
        onClose();
        setMessage(resetMessage);
      }, 2000);
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
    handleSubmit,
    handleClose,
    handleKeyPress,
    stopPropagation
  };
};

export default useQuickNoteLog;
