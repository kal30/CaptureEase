import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Alert,
  Box,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { Close, NoteAdd } from '@mui/icons-material';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../../services/firebase';

const functions = getFunctions(app, 'us-central1');
const createLogCallable = httpsCallable(functions, 'createLog');

const QuickNoteLog = ({ childId, childName, open, onClose }) => {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async () => {
    if (!note.trim()) {
      setMessage({ type: 'error', text: 'Please enter a note before submitting.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await createLogCallable({
        childId,
        type: 'note',
        note: note.trim(),
        source: 'app'
      });

      console.log('Log created successfully:', result.data);

      setMessage({
        type: 'success',
        text: `Note logged successfully! The system will automatically classify it as a Daily Log or Important Moment.`
      });
      
      setNote('');
      
      // Auto-close after 2 seconds on success
      setTimeout(() => {
        onClose();
        setMessage({ type: '', text: '' });
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
    setNote('');
    setMessage({ type: '', text: '' });
    onClose();
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '300px'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NoteAdd color="primary" />
          Quick Note for {childName}
        </Box>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {message.text && (
          <Alert 
            severity={message.type} 
            sx={{ mb: 2 }}
            onClose={() => setMessage({ type: '', text: '' })}
          >
            {message.text}
          </Alert>
        )}

        <TextField
          autoFocus
          placeholder="What happened? (e.g., 'Had lunch with applesauce', 'Took a 2-hour nap', 'Fell at playground but okay')"
          multiline
          rows={4}
          fullWidth
          variant="outlined"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#E0E7FF',
              },
              '&:hover fieldset': {
                borderColor: '#C7D2FE',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#6366F1',
              },
            },
          }}
        />
        
        <Box sx={{ mt: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
          💡 <strong>Auto-Classification:</strong> Your note will be automatically sorted as:
          <br />
          • <strong>Daily Log</strong> - Routine activities (meals, naps, play)
          <br />
          • <strong>Important Moment</strong> - Significant events (milestones, incidents, health concerns)
          <br />
          Press Ctrl+Enter to submit quickly
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          color="secondary"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !note.trim()}
          startIcon={loading ? <CircularProgress size={16} /> : <NoteAdd />}
          sx={{
            backgroundColor: '#6366F1',
            '&:hover': {
              backgroundColor: '#4F46E5',
            },
          }}
        >
          {loading ? 'Saving...' : 'Log Note'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Icon component for use in child card
export const QuickNoteIcon = ({ childId, childName, onClick }) => {
  return (
    <Tooltip title="Quick Note: Log what happened" arrow>
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        sx={{
          width: 40,
          height: 40,
          backgroundColor: '#10B981', // Emerald green for notes
          color: 'white',
          fontSize: '1.1rem',
          border: '2px solid #D1FAE5',
          '&:hover': {
            backgroundColor: '#059669',
            transform: 'scale(1.05)',
          },
          transition: 'all 0.2s ease-in-out',
        }}
      >
        📝
      </IconButton>
    </Tooltip>
  );
};

export default QuickNoteLog;