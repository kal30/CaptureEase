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

  const firstAttachedPhoto = Array.isArray(entry.mediaUrls) && entry.mediaUrls.length > 0
    ? (typeof entry.mediaUrls[0] === 'string' ? entry.mediaUrls[0] : entry.mediaUrls[0]?.url)
    : '';

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

          {entry.mediaURL && entry.mediaType === 'image' && (
            <Box sx={{ mt: 1 }}>
              <img 
                src={entry.mediaURL} 
                alt="log media" 
                style={{ 
                  maxWidth: '100%', 
                  borderRadius: '4px',
                  display: 'block'
                }} 
              />
            </Box>
          )}

          {!entry.mediaURL && firstAttachedPhoto && (
            <Box sx={{ mt: 1 }}>
              <img
                src={firstAttachedPhoto}
                alt="log attachment"
                style={{
                  width: '100%',
                  maxWidth: '140px',
                  borderRadius: '8px',
                  display: 'block',
                  objectFit: 'cover',
                }}
              />
            </Box>
          )}

          {entry.mediaURL && entry.mediaType === 'video' && (
            <Box sx={{ mt: 1 }}>
              <video 
                controls 
                src={entry.mediaURL} 
                style={{ 
                  maxWidth: '100%', 
                  borderRadius: '4px',
                  display: 'block'
                }} 
              />
            </Box>
          )}

          {entry.voiceMemoURL && (
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
