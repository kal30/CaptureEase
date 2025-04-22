import React, { useState, useEffect } from 'react';
import { Box, Modal, TextField, Button, Typography } from '@mui/material';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import MediaUploader from './MediaUploader';
import MediaPreview from './MediaPreview';  // Import MediaPreview
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/UploadFile';

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
  // Initialize state with default values or journal values if available
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [mediaURL, setMediaURL] = useState('');
  const [isMediaRemoved, setIsMediaRemoved] = useState(false);

  useEffect(() => {
    if (journal) {
      setTitle(journal.title || '');
      setContent(journal.content || '');
      setDate(new Date(journal.date.toDate()).toISOString().split('T')[0] || '');
      setMediaURL(journal.mediaURL || '');
    }
  }, [journal]);

  const handleUpdate = async () => {
    if (!title || !content) return;

    try {
      const journalRef = doc(db, 'children', childId, 'journals', journal.id);
      await updateDoc(journalRef, {
        title,
        content,
        date: new Date(date),
        mediaURL: isMediaRemoved ? '' : mediaURL,
      });
      onClose();  // Close modal after updating
    } catch (error) {
      console.error('Error updating journal entry:', error);
    }
  };

  const handleRemoveMedia = () => {
    setMediaURL('');  // Clear the media URL
    setIsMediaRemoved(true);  // Set state to true to track removal
  };

  if (!journal) {
    return null; // Do not render the modal if the journal object is undefined
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6">Edit Journal Entry</Typography>

        {/* Title Input */}
        <TextField
          label="Title"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ my: 2 }}
        />

        {/* Date Input */}
        <TextField
          label="Date"
          type="date"
          fullWidth
          value={date}
          onChange={(e) => setDate(e.target.value)}
          sx={{ my: 2 }}
        />

        {/* Content Input */}
        <TextField
          label="Content"
          multiline
          rows={4}
          fullWidth
          value={content}
          onChange={(e) => setContent(e.target.value)}
          sx={{ my: 2 }}
        />

        {/* Current Media Preview using MediaPreview Component */}
        {mediaURL && !isMediaRemoved && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>Current Media:</Typography>
            <MediaPreview mediaURL={mediaURL} />  {/* Use MediaPreview here */}
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<DeleteIcon />}
              onClick={handleRemoveMedia}
              sx={{ mt: 2, width: '100%' }}
            >
              Remove Media
            </Button>
          </Box>
        )}

        {/* Upload Media Button (Disabled if media exists) */}
        <Button
          variant="contained"
          component="label"
          startIcon={<UploadIcon />}
          sx={{ mt: 2, width: '100%' }}
          disabled={!!mediaURL && !isMediaRemoved}
        >
          Upload Media
          <MediaUploader childId={childId} onUploadComplete={setMediaURL} />
        </Button>

        {/* Update Button */}
        <Button variant="contained" onClick={handleUpdate} sx={{ mt: 3, width: '100%' }}>
          Update
        </Button>
      </Box>
    </Modal>
  );
};

export default EditJournalModal;