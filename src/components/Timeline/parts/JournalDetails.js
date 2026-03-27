import React, { useState } from 'react';
import { Box, Typography, IconButton, Tooltip, TextField, Button } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../../services/firebase';

const JournalDetails = ({ entry }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(entry.text || '');
  const [isSaving, setIsSaving] = useState(false);

  // Don't render if entry has no meaningful content
  const hasContent = entry.text || (entry.tags && entry.tags.length > 0) || entry.mediaURL || entry.voiceMemoURL;
  
  if (!hasContent) {
    return null;
  }

  const extractTags = (inputText) => {
    const tagRegex = /#(\w+)/g;
    const matches = [...(inputText || '').matchAll(tagRegex)];
    return matches.map((match) => match[1]);
  };

  const handleSave = async () => {
    if (!editText.trim()) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'dailyLogs', entry.id), {
        text: editText,
        tags: extractTags(editText),
        updatedAt: new Date(),
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating journal entry:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const shouldDelete = window.confirm('Are you sure you want to delete this entry?');
    if (!shouldDelete) return;

    try {
      await updateDoc(doc(db, 'dailyLogs', entry.id), {
        status: 'deleted',
        deletedAt: new Date(),
        deletedBy: auth.currentUser?.uid
      });
    } catch (error) {
      console.error('Error deleting journal entry:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
      {entry.text && (
        isEditing ? (
          <Box sx={{ mb: 0.75 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              size="small"
              sx={{ mb: 1 }}
            />
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                size="small"
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={isSaving || !editText.trim()}
              >
                Save
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<CloseIcon />}
                onClick={() => {
                  setIsEditing(false);
                  setEditText(entry.text || '');
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.primary', mb: 0, mt: -0.1, lineHeight: 1.35 }}>
            {entry.text.length > 150 ? `${entry.text.substring(0, 150)}...` : entry.text}
          </Typography>
        )
      )}

      {/* Show media if present */}
      {(entry.mediaURL || entry.voiceMemoURL) && (
        <Box sx={{ mt: 0.35, p: 0.75, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.200' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', fontWeight: 500 }}>
            📎 Media attached
            {entry.mediaURL && ' • Photo/Video'}
            {entry.voiceMemoURL && ' • Voice Memo'}
          </Typography>
        </Box>
      )}

      {!isEditing && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.25, mt: 0 }}>
          <Tooltip title="Edit entry">
            <IconButton size="small" onClick={() => setIsEditing(true)} sx={{ p: 0.5 }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete entry">
            <IconButton size="small" color="error" onClick={handleDelete} sx={{ p: 0.5 }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
};

export default React.memo(JournalDetails);
