import React, { useState } from 'react';
import { Box, Modal, TextField, Button, Typography } from '@mui/material';
import { addDoc, collection } from 'firebase/firestore';
import { addJournalEntry } from '../../services/journalService';  // Import the service

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  outline: 'none',  // Remove default outline
  border: '2px solid #f0f0f0',  // Add subtle border
};


const AddJournalModal = ({ open, onClose, childId }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
    const handleSave = async () => {
      if (!title || !content) return;
  
      try {
        await addJournalEntry(childId, {
          title,
          content,
          date: new Date(date),
          timestamp: new Date(),
        });
        onClose();  // Close the modal on save
      } catch (error) {
        console.error('Error saving journal entry:', error);
      }
    };
  
    return (
      <Modal open={open} onClose={onClose}>
        <Box sx={{ ...modalStyle }}>
          <Typography variant="h6">Add Journal Entry</Typography>
  
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
  
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </Box>
      </Modal>
    );
  };
  

export default AddJournalModal;