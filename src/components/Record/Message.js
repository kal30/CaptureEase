import React, { useState } from 'react';
import { Box, Typography, TextField } from '@mui/material';
import MessageBubble from './MessageBubble';
import MessageMenu from './MessageMenu';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

const Message = ({ message, showDate }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(message.text);

  // Open menu on right-click
  const handleContextMenu = (event) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  // Close the context menu
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'entries', message.id));
      handleCloseMenu();
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleEdit = async () => {
    if (isEditing) {
      try {
        await updateDoc(doc(db, 'entries', message.id), { text: editedText });
        setIsEditing(false);
      } catch (error) {
        console.error('Error updating message:', error);
      }
    } else {
      setIsEditing(true);
    }
    handleCloseMenu();
  };

  return (
    <Box onContextMenu={handleContextMenu} sx={{ mb: 1.5, position: 'relative' }}>
      {/* Show date if applicable */}
      {showDate && (
        <Typography
          variant="caption"
          sx={{
            textAlign: 'center',
            color: '#666',
            backgroundColor: '#f0f0f0',
            padding: '5px 10px',
            borderRadius: '12px',
            fontWeight: 'bold',
            marginBottom: '8px',
          }}
        >
          {message.timestamp.toDate().toDateString()}
        </Typography>
      )}

      {/* Message bubble with text, image, and time */}
      {isEditing ? (
        <TextField
          fullWidth
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          onBlur={handleEdit} // Save on blur
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleEdit();
            }
          }}
        />
      ) : (
        <MessageBubble message={message} />
      )}

      {/* Context menu for edit/delete */}
      <MessageMenu
        anchorEl={anchorEl}
        handleCloseMenu={handleCloseMenu}
        handleDelete={handleDelete}
        handleEdit={handleEdit}
        isEditing={isEditing}
        message={message}
      />
    </Box>
  );
};

export default Message;