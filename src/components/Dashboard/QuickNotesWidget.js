import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  Collapse,
} from '@mui/material';
import {
  NoteAdd,
  ExpandMore,
  ExpandLess,
  Send,
  AutoAwesome,
  Psychology,
  Mood as MoodIcon,
} from '@mui/icons-material';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../../services/firebase';
import { classifyEvent } from '../../services/classificationService';
import { addBehavior } from '../../services/behaviorService';
import { logMood } from '../../services/moodService';

const functions = getFunctions(app, 'us-central1');
const createLogCallable = httpsCallable(functions, 'createLog');

/**
 * Prominent Quick Notes Widget for Dashboard
 * Provides easy access to log notes with auto-classification
 */
const QuickNotesWidget = ({ children = [] }) => {
  const [selectedChildId, setSelectedChildId] = useState(children[0]?.id || null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [expanded, setExpanded] = useState(true);

  const selectedChild = children.find(c => c.id === selectedChildId);

  const handleSubmit = async () => {
    if (!note.trim() || !selectedChildId) {
      setMessage({ type: 'error', text: 'Please enter a note and select a child.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // 1. Run Smart Classification
      const classification = classifyEvent({ type: 'note', note: note.trim() });
      const { type, confidence, buckets } = classification.classification;

      console.log('Smart Classification:', classification.classification);

      // 2. Route to appropriate service based on high confidence
      if (confidence >= 0.7) {
        if (type === 'behavior') {
          await addBehavior(selectedChildId, {
            name: buckets[0] === 'behavioral_positive' ? 'Good Behavior' : 'Challenging Behavior',
            description: note.trim(),
            goal: null, // Optional
            iconName: buckets[0] === 'behavioral_positive' ? 'Star' : 'Alert',
            createdAt: new Date(),
            isTemplate: false
          });
          setMessage({
            type: 'success',
            text: `✅ Logged as BEHAVIOR (${buckets[0].replace('_', ' ')})`
          });
        } else if (type === 'mood_log') {
          const moodLevel = buckets[0].includes('positive') ? 'Happy' : 'Upset';
          await logMood(selectedChildId, moodLevel);
          // Also save the note if needed, but logMood service might not take a note directly based on signature
          // For now, we just log the mood. To save the text, we might want to also create a generic log or update mood service.
          // Let's fallback to createLog if we want to save the text, OR just accept mood tracking is simple.
          // Better UX: Log the mood rating, AND saving the text as a log with tag.
          await createLogCallable({
            childId: selectedChildId,
            type: 'note',
            note: note.trim(),
            source: 'app',
            tags: ['mood', moodLevel] 
          });
          
          setMessage({
             type: 'success',
             text: `✅ Logged Mood: ${moodLevel}`
          });
        } else {
           // Default fallback for other types not yet fully wired
           await createLogCallable({
            childId: selectedChildId,
            type: 'note',
            note: note.trim(),
            source: 'app'
           });
           setMessage({
            type: 'success',
            text: `✅ Note logged. Tagged as: ${type}`
           });
        }
      } else {
        // Low confidence - Generic Log
        await createLogCallable({
          childId: selectedChildId,
          type: 'note',
          note: note.trim(),
          source: 'app'
        });

        setMessage({
          type: 'success',
          text: `✅ Note logged for ${selectedChild?.name}!`
        });
      }

      setNote('');

      // Clear success message after 4 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 4000);

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

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  if (children.length === 0) {
    return null; // Don't show if no children
  }

  return (
    <Paper
      elevation={3}
      sx={{
        mb: 3,
        overflow: 'hidden',
        border: '2px solid',
        borderColor: '#10B981',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 4px 20px rgba(16, 185, 129, 0.2)',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          bgcolor: '#F0FDF4',
          borderBottom: expanded ? '1px solid #D1FAE5' : 'none',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              color: 'white',
              boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
            }}
          >
            <AutoAwesome sx={{ fontSize: '1.2rem' }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#065F46' }}>
              Smart Quick Note
            </Typography>
            <Typography variant="caption" sx={{ color: '#047857', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              AI-powered auto-classification enabled
            </Typography>
          </Box>
        </Box>
        <IconButton size="small">
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      {/* Content */}
      <Collapse in={expanded}>
        <Box sx={{ p: 3 }}>
          {/* Child Selection */}
          {children.length > 1 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                Select Child:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {children.map((child) => (
                  <Chip
                    key={child.id}
                    label={child.name}
                    onClick={() => setSelectedChildId(child.id)}
                    color={selectedChildId === child.id ? 'primary' : 'default'}
                    variant={selectedChildId === child.id ? 'filled' : 'outlined'}
                    sx={{
                      fontWeight: selectedChildId === child.id ? 600 : 400,
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Success/Error Message */}
          {message.text && (
            <Alert
              severity={message.type}
              sx={{ mb: 2 }}
              onClose={() => setMessage({ type: '', text: '' })}
            >
              {message.text}
            </Alert>
          )}

          {/* Note Input */}
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder={`What happened? Try: "He threw a tantrum because he was tired" or "She ate all her peas!"`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            variant="outlined"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.paper',
                '& fieldset': {
                  borderColor: '#D1FAE5',
                  borderWidth: 2,
                },
                '&:hover fieldset': {
                  borderColor: '#10B981',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#059669',
                },
              },
            }}
          />

          {/* Help Text */}
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              bgcolor: '#EEF2FF',
              borderRadius: 1,
              border: '1px solid #C7D2FE',
              display: 'flex',
              gap: 1
            }}
          >
            <Psychology sx={{ color: '#4338CA', fontSize: '1.2rem', mt: 0.2 }} />
            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#4338CA' }}>
              <strong>Try these examples to test smart filing:</strong>
              <br />
              • "He had a massive meltdown" → <em>Files as Behavior</em>
              <br />
              • "She is so happy and smiling today" → <em>Files as Mood</em>
              <br />
              • "Give 5ml of Tylenol for fever" → <em>Files as Medical (coming soon)</em>
            </Typography>
          </Box>

          {/* Submit Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={loading || !note.trim() || !selectedChildId}
              startIcon={loading ? <CircularProgress size={20} /> : <Send />}
              sx={{
                bgcolor: '#10B981',
                '&:hover': {
                  bgcolor: '#059669',
                },
                '&:disabled': {
                  bgcolor: '#D1FAE5',
                  color: 'rgba(0,0,0,0.26)'
                },
                px: 4,
                fontWeight: 600,
              }}
            >
              {loading ? 'Analyzing...' : 'Log It'}
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default QuickNotesWidget;
