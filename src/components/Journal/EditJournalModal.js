import React, { useState } from 'react';
import { Box, Modal, TextField, Button, Typography } from '@mui/material';
import { updateJournalEntry } from '../../services/journalService';  // Import the service

// Define modalStyle for positioning and styling the modal
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const EditJournalModal = ({ open, onClose, journal, childId }) => {
  const [title, setTitle] = useState(journal.title);
  const [content, setContent] = useState(journal.content);
  const [date, setDate] = useState(new Date(journal.date.toDate()).toISOString().split('T')[0]);

  // Handle update
  const handleUpdate = async () => {
    if (!title || !content) return;

    try {
      // Use the service to update the journal entry
      await updateJournalEntry(childId, journal.id, {
        title,
        content,
        date: new Date(date),
      });
      onClose();  // Close modal after updating
    } catch (error) {
      console.error('Error updating journal entry:', error);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6">Edit Journal Entry</Typography>

        <TextField
          label="Title"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ my: 2 }}
        />
        <TextField
          label="Date"
          type="date"
          fullWidth
          value={date}
          onChange={(e) => setDate(e.target.value)}
          sx={{ my: 2 }}
        />
        <TextField
          label="Content"
          multiline
          rows={4}
          fullWidth
          value={content}
          onChange={(e) => setContent(e.target.value)}
          sx={{ my: 2 }}
        />

        <Button variant="contained" onClick={handleUpdate}>
          Update
        </Button>
      </Box>
    </Modal>
  );
};

export default EditJournalModal;