import React, { useState } from 'react';
import { Box, Typography, Paper, Avatar, IconButton, Menu, MenuItem, TextField, Button } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const LogEntry = ({ entry, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(entry.text || '');
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);

  const formattedTime = entry.timestamp ? 
    (typeof entry.timestamp.toDate === 'function' ? 
      dayjs(entry.timestamp.toDate()).fromNow() : 
      dayjs(entry.timestamp).fromNow()
    ) : '';

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
    <Paper elevation={1} sx={{ padding: 2, marginBottom: 2, display: 'flex' }}>
      <Avatar sx={{ marginRight: 2 }}>
        {/* You can replace this with child's actual avatar if available */}
        C
      </Avatar>
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ marginRight: 1 }}>
              {/* Replace with actual child name if passed as prop */}
              Child Name
            </Typography>
            <Typography variant="caption" color="textSecondary">
              &bull; {formattedTime}
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
        </Box>

        {entry.text && (
          isEditing ? (
            <Box sx={{ marginBottom: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                variant="outlined"
                sx={{ marginBottom: 1 }}
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
            <Typography variant="body1" sx={{ marginBottom: 1 }}>
              {renderTextWithTags(entry.text, entry.tags || [])}
            </Typography>
          )
        )}

        {entry.mediaURL && entry.mediaType === 'image' && (
          <Box sx={{ marginBottom: 1 }}>
            <img src={entry.mediaURL} alt="log media" style={{ maxWidth: '100%', borderRadius: '8px' }} />
          </Box>
        )}

        {entry.mediaURL && entry.mediaType === 'video' && (
          <Box sx={{ marginBottom: 1 }}>
            <video controls src={entry.mediaURL} style={{ maxWidth: '100%', borderRadius: '8px' }} />
          </Box>
        )}

        {entry.voiceMemoURL && (
          <Box sx={{ marginBottom: 1 }}>
            <audio controls src={entry.voiceMemoURL} />
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
    </Paper>
  );
};

export default LogEntry;
