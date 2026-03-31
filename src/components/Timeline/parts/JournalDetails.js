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
  const canEdit = (entry.userId || entry.authorId || entry.createdBy) === auth.currentUser?.uid;
  const firstAttachedPhoto = Array.isArray(entry.mediaUrls) && entry.mediaUrls.length > 0
    ? (typeof entry.mediaUrls[0] === 'string' ? entry.mediaUrls[0] : entry.mediaUrls[0]?.url)
    : null;

  // Don't render if entry has no meaningful content
  const hasContent =
    entry.text ||
    (entry.tags && entry.tags.length > 0) ||
    entry.mediaURL ||
    firstAttachedPhoto ||
    entry.voiceMemoURL;
  
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, position: 'relative', pt: canEdit && !isEditing ? 2.5 : 0 }}>
      {!isEditing && canEdit && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            display: 'flex',
            gap: 0.1,
            opacity: { xs: 0.72, md: 0.4 },
            transition: 'opacity 0.18s ease',
            '.timeline-entry-card:hover &': {
              opacity: 1,
            },
          }}
        >
          <Tooltip title="Edit entry">
            <IconButton
              size="small"
              onClick={() => setIsEditing(true)}
              sx={{
                p: { xs: 0.2, md: 0.3 },
                color: 'text.secondary',
                '&:hover': { color: 'primary.main', bgcolor: 'transparent' },
              }}
            >
              <EditIcon sx={{ fontSize: { xs: 16, md: 17 } }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete entry">
            <IconButton
              size="small"
              onClick={handleDelete}
              sx={{
                p: { xs: 0.2, md: 0.3 },
                color: 'text.secondary',
                '&:hover': { color: 'error.main', bgcolor: 'transparent' },
              }}
            >
              <DeleteIcon sx={{ fontSize: { xs: 16, md: 17 } }} />
            </IconButton>
          </Tooltip>
        </Box>
      )}

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
          <Typography variant="body2" sx={{ color: 'text.primary', mb: 0, mt: -0.1, lineHeight: { xs: 1.28, md: 1.35 }, fontSize: { xs: '0.92rem', md: '0.875rem' } }}>
            {entry.text.length > 150 ? `${entry.text.substring(0, 150)}...` : entry.text}
          </Typography>
        )
      )}

      {!entry.mediaURL && firstAttachedPhoto && (
        <Box
          sx={{
            mt: 0.4,
            borderRadius: 1,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'grey.200',
            maxWidth: { xs: 180, md: 220 },
          }}
        >
          <Box
            component="img"
            src={firstAttachedPhoto}
            alt="Attached note"
            sx={{
              display: 'block',
              width: '100%',
              height: 'auto',
              maxHeight: { xs: 140, md: 180 },
              objectFit: 'cover',
            }}
          />
        </Box>
      )}

      {/* Show media if present */}
      {(entry.mediaURL || firstAttachedPhoto || entry.voiceMemoURL) && (
        <Box sx={{ mt: 0.3, p: { xs: 0.6, md: 0.75 }, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.200' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: { xs: '0.66rem', md: '0.7rem' }, fontWeight: 500 }}>
            📎 Media attached
            {(entry.mediaURL || firstAttachedPhoto) && ' • Photo/Video'}
            {entry.voiceMemoURL && ' • Voice Memo'}
          </Typography>
        </Box>
      )}

    </Box>
  );
};

export default React.memo(JournalDetails);
