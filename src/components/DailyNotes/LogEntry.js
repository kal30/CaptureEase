import React, { useState } from 'react';
import { Box, Typography, Paper, Avatar, IconButton, Menu, MenuItem, TextField, Button } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { auth } from '../../services/firebase';
import { CATEGORY_COLORS } from '../../constants/categoryColors';

dayjs.extend(relativeTime);
dayjs.extend(isSameOrAfter);

const LogEntry = ({ entry, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(entry.text || '');
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const currentUser = auth.currentUser;
  const canEdit = (entry.createdBy || entry.authorId) === currentUser?.uid;
  const categoryKey = CATEGORY_COLORS[entry.category] ? entry.category : 'log';
  const categoryColors = CATEGORY_COLORS[categoryKey];
  const categoryLabel = categoryKey === 'milestone'
    ? 'Win'
    : categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);

  const entryTimestamp = entry.timestamp ? 
    (typeof entry.timestamp.toDate === 'function' ? 
      entry.timestamp.toDate() : 
      entry.timestamp
    ) : new Date();
  
  const formattedTime = dayjs(entryTimestamp).fromNow();
  const formattedDate = dayjs(entryTimestamp).format('MMM D, YYYY');
  const formattedTimeOnly = dayjs(entryTimestamp).format('h:mm A');
  const isToday = dayjs(entryTimestamp).isSame(dayjs(), 'day');
  const isYesterday = dayjs(entryTimestamp).isSame(dayjs().subtract(1, 'day'), 'day');

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditText(entry.text || '');
    handleMenuClose();
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(entry.text || '');
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;
    setLoading(true);
    try {
      if (onEdit) {
        await onEdit(entry.id, editText);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating entry:', error);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      handleMenuClose();
      if (onDelete) {
        await onDelete(entry.id);
      }
    }
  };

  const renderTextWithTags = (text, tags = []) => {
    if (!text) return null;
    let displayableText = text;
    if (Array.isArray(tags)) {
      tags.forEach(tag => {
        const tagPattern = new RegExp(`#${tag}`, 'g');
        displayableText = displayableText.replace(tagPattern, `<span style="color: #1DA1F2;">#${tag}</span>`);
      });
    }
    return <div dangerouslySetInnerHTML={{ __html: displayableText }} />;
  };

  const getFirstAttachment = () => {
    if (entry.mediaURL) {
      return {
        url: entry.mediaURL,
        type: entry.mediaType || 'image',
        filename: entry.mediaFilename || 'Attachment',
      };
    }

    if (Array.isArray(entry.mediaUrls) && entry.mediaUrls.length > 0) {
      const first = entry.mediaUrls[0];
      if (typeof first === 'string') {
        const lower = first.toLowerCase();
        const inferredType = lower.match(/\.(mp4|webm|mov|m4v)(\?|$)/)
          ? 'video'
          : lower.match(/\.(mp3|wav|m4a|webm|ogg)(\?|$)/)
            ? 'audio'
            : 'image';
        return {
          url: first,
          type: inferredType,
          filename: entry.mediaFilename || 'Attachment',
        };
      }

      if (first && typeof first === 'object') {
        const url = first.url || first.downloadURL || '';
        const mimeType = first.mimeType || '';
        const type = first.type
          || (mimeType.startsWith('video/') ? 'video' : mimeType.startsWith('audio/') ? 'audio' : 'image');
        return {
          url,
          type,
          filename: first.filename || first.name || entry.mediaFilename || 'Attachment',
        };
      }
    }

    return null;
  };

  const firstAttachment = getFirstAttachment();
  const hasInlineImage = firstAttachment?.url && firstAttachment.type === 'image';
  const hasInlineVideo = firstAttachment?.url && firstAttachment.type === 'video';
  const hasInlineAudio = firstAttachment?.url && firstAttachment.type === 'audio';

  return (
    <Box 
      sx={{ 
        position: 'relative',
        pb: 1.5,
        pl: 1.25,
        borderLeft: '4px solid',
        borderLeftColor: categoryColors.border,
        borderBottom: '1px solid',
        borderBottomColor: 'grey.100',
        '&:last-child': {
          borderBottom: 'none',
          pb: 0
        },
        '&:hover': {
          bgcolor: 'grey.50',
          borderRadius: 1,
          mx: -1,
          px: 1
        }
      }}
    >
      {/* Header with time and menu */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              px: 1,
              py: 0.35,
              borderRadius: 999,
              bgcolor: categoryColors.bg,
              color: categoryColors.text,
              border: '1px solid',
              borderColor: categoryColors.border,
              fontSize: '0.72rem',
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            {categoryLabel}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
            {formattedTimeOnly}
          </Typography>
        </Box>
        {canEdit && (
          <IconButton 
            size="small" 
            onClick={handleMenuOpen}
            sx={{ opacity: 0, transition: 'opacity 0.2s', '.MuiBox-root:hover &': { opacity: 0.7 }, '&:hover': { opacity: 1 } }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Entry content */}
      <Box>

          {entry.text && (
            isEditing ? (
              <Box>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveEdit}
                    disabled={loading || !editText.trim()}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<CancelIcon />}
                    onClick={handleCancelEdit}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : (
              <Typography 
                variant="body2" 
                sx={{ 
                  lineHeight: 1.5,
                  fontSize: '0.9rem',
                  color: 'text.primary'
                }}
              >
                {renderTextWithTags(entry.text, entry.tags || [])}
              </Typography>
            )
          )}

          {hasInlineImage && (
            <Box sx={{ mt: 1 }}>
              <Box
                component="img"
                src={firstAttachment.url}
                alt={firstAttachment.filename || 'log attachment'}
                sx={{
                  width: '100%',
                  maxWidth: 320,
                  maxHeight: 240,
                  borderRadius: 2,
                  display: 'block',
                  objectFit: 'cover',
                  border: '1px solid',
                  borderColor: 'grey.200',
                  bgcolor: 'grey.50',
                }}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {firstAttachment.filename}
              </Typography>
            </Box>
          )}

          {hasInlineVideo && (
            <Box sx={{ mt: 1 }}>
              <Box
                component="video"
                controls
                src={firstAttachment.url}
                sx={{
                  width: '100%',
                  maxWidth: 360,
                  borderRadius: 2,
                  display: 'block',
                  bgcolor: '#111827',
                  border: '1px solid',
                  borderColor: 'grey.200',
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {firstAttachment.filename}
              </Typography>
            </Box>
          )}

          {hasInlineAudio && (
            <Box sx={{ mt: 1 }}>
              <audio controls src={firstAttachment.url} style={{ width: '100%' }} />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {firstAttachment.filename}
              </Typography>
            </Box>
          )}

          {entry.voiceMemoURL && !hasInlineAudio && (
            <Box sx={{ mt: 1 }}>
              <audio controls src={entry.voiceMemoURL} style={{ width: '100%' }} />
            </Box>
          )}
      </Box>
      
      {/* Dropdown Menu */}
      {canEdit && (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEdit}>
            <EditIcon sx={{ marginRight: 1 }} />
            Edit
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ marginRight: 1 }} />
            Delete
          </MenuItem>
        </Menu>
      )}
    </Box>
  );
};

export default LogEntry;
