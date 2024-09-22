// src/pages/RecordEntry.js
import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';  // Firebase Storage
import { addDoc, collection } from 'firebase/firestore';  // Firestore
import { db, auth } from '../firebase';  // Firestore and Auth instances
import { useNavigate } from 'react-router-dom';

const RecordEntry = () => {
    console.log('RecordEntry component is rendering');
  const [text, setText] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const storage = getStorage();
  const navigate = useNavigate();

  // Handle file input (photo or video)
  const handleFileChange = (e) => {
    setMediaFile(e.target.files[0]);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    // Upload media file (if provided)
    let mediaURL = null;
    if (mediaFile) {
      const mediaRef = ref(storage, `media/${mediaFile.name}`);
      await uploadBytes(mediaRef, mediaFile);
      mediaURL = await getDownloadURL(mediaRef);
    }

    // Save the text and media URL to Firestore
    try {
      await addDoc(collection(db, 'entries'), {
        userId: auth.currentUser.uid,  // The logged-in user's ID
        text: text,
        mediaURL: mediaURL || '',  // URL of uploaded photo/video or empty string
        timestamp: new Date()
      });
      console.log('Entry saved successfully!');
      navigate('/dashboard');  // Redirect to dashboard after submission
    } catch (e) {
      console.error('Error saving entry: ', e);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Record What's Happening
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          label="Describe what is happening"
          multiline
          rows={4}
          fullWidth
          value={text}
          onChange={(e) => setText(e.target.value)}
          margin="normal"
        />

        <Typography variant="h6">Upload a Photo or Video (Optional)</Typography>
        <input type="file" accept="image/*, video/*" onChange={handleFileChange} />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Submit Entry'}
        </Button>
      </form>
    </Container>
  );
};

export default RecordEntry;