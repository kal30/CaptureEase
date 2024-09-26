import React, { useState } from 'react';
import { Box, Avatar } from '@mui/material';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import MessageContent from './MessageContent';
import MessageActions from './MessageActions';

const MessageBubble = ({ message }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(message.text);

  // Delete the message
  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'entries', message.id));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  // Toggle editing mode
  const handleEdit = async () => {
    if (isEditing) {
      try {
        await updateDoc(doc(db, 'entries', message.id), { text: editedText });
      } catch (error) {
        console.error('Error updating message:', error);
      }
    }
    setIsEditing(!isEditing);  // Toggle editing state
  };

  // Auto-save when editing is done
  const handleBlur = () => {
    if (isEditing) {
      handleEdit();
    }
  };

  // Handle Enter key to save changes
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleEdit();
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        mb: 3,
        padding: 2,
        backgroundColor: '#f1f1f1',
        borderRadius: 2,
        boxShadow: 1,
        position: 'relative',
      }}
    >
      {/* Profile Picture */}
      <Avatar
        src={message.profilePic || 'https://via.placeholder.com/50'}
        alt="Profile"
        sx={{ width: 50, height: 50, marginRight: 2 }}
      />

      {/* Message Content */}
      <MessageContent
        isEditing={isEditing}
        editedText={editedText}
        setEditedText={setEditedText}
        handleBlur={handleBlur}
        handleKeyDown={handleKeyDown}
        message={message}
      />

      {/* Edit/Delete Menu */}
      <MessageActions onEdit={handleEdit} onDelete={handleDelete} />
    </Box>
  );
};

export default MessageBubble;