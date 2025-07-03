import React, { useState, useEffect } from 'react';
import { Box, Modal, TextField, Button, Typography } from '@mui/material';
import { updateProgressNote } from '../../services/progressNotesService';
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

const EditProgressNoteModal = ({ open, onClose, progressNote, childId }) => {
  // Initialize state with default values or journal values if available
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [mediaURL, setMediaURL] = useState('');
  const [isMediaRemoved, setIsMediaRemoved] = useState(false);

  useEffect(() => {
    if (progressNote) {
      setTitle(progressNote.title || '');
      setContent(progressNote.content || '');
      setDate(new Date(progressNote.date.toDate()).toISOString().split('T')[0] || '');
      setMediaURL(progressNote.mediaURL || '');
    }
  }, [progressNote]);

  const handleUpdate = async () => {
    if (!title || !content) return;

    try {
      await updateProgressNote(childId, progressNote.id, {
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

  if (!progressNote) {
    return null; // Do not render the modal if the journal object is undefined
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6">Edit Progress Note</Typography>

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
          label="Progress Note"
          multiline
          rows={4}
          fullWidth
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Describe observations, interventions, and outcomes."
          helperText="Provide a detailed progress note for this entry."
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

export default EditProgressNoteModal;