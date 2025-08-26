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

dayjs.extend(relativeTime);
dayjs.extend(isSameOrAfter);

const LogEntry = ({ entry, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(entry.text || '');
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <Box 
      sx={{ 
        position: 'relative',
        pb: 1.5,
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
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
          {formattedTimeOnly}
        </Typography>
        <IconButton 
          size="small" 
          onClick={handleMenuOpen}
          sx={{ opacity: 0, transition: 'opacity 0.2s', '.MuiBox-root:hover &': { opacity: 0.7 }, '&:hover': { opacity: 1 } }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
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
    </Box>
  );
};

export default LogEntry;
