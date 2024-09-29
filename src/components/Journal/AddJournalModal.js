import React, { useState } from 'react';
import { Box, Modal, TextField, Button, Typography } from '@mui/material';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../services/firebase';
import MediaUploader from './MediaUploader';  // Assuming you have a MediaUploader component

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

const AddJournalModal = ({ open, onClose, childId }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today's date
  const [mediaURL, setMediaURL] = useState('');  // Store the uploaded media URL
  const [mediaPreview, setMediaPreview] = useState('');  // For displaying preview

  // Handle Save Journal
  const handleSave = async () => {
    if (!title || !content) return;

    // Add journal entry to Firestore
    try {
      await addDoc(collection(db, 'children', childId, 'journals'), {
        title,
        content,
        date: new Date(date),
        mediaURL,  // Save the media URL with the journal entry
        timestamp: new Date(), // Timestamp for sorting by creation
      });
      onClose();  // Close the modal on save
      resetForm();  // Reset the form
    } catch (error) {
      console.error('Error saving journal entry:', error);
    }
  };

  // Reset form fields after submission
  const resetForm = () => {
    setTitle('');
    setContent('');
    setDate(new Date().toISOString().split('T')[0]);
    setMediaURL('');  // Reset the media URL
    setMediaPreview('');  // Reset the media preview
  };

  // Handle media upload completion and preview
  const handleMediaUpload = (url, file) => {
    setMediaURL(url);  // Set the uploaded media URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result);  // Set the preview image
    };
    if (file) reader.readAsDataURL(file);  // Read the file to display preview
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
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

        {/* Media Uploader Component */}
        <MediaUploader childId={childId} onUploadComplete={handleMediaUpload} />

        {/* Media Preview */}
        {mediaPreview && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>Media Preview:</Typography>
            <img src={mediaPreview} alt="media-preview" style={{ width: '100%', borderRadius: '8px' }} />
          </Box>
        )}

        <Button variant="contained" onClick={handleSave} sx={{ mt: 3 }}>
          Save
        </Button>
      </Box>
    </Modal>
  );
};

export default AddJournalModal;