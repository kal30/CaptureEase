import React, { useState, useEffect } from 'react';
import { Box, Button, Modal, TextField, Typography } from '@mui/material';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import ChildPhotoUploader from './ChildPhotoUploader';  // Assuming you already have this

const EditChildModal = ({ open, onClose, child, setChildren }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [photo, setPhoto] = useState(null);  // State for new photo file
  const [photoURL, setPhotoURL] = useState(null);  // Existing or updated photo URL
  const storage = getStorage();

  // Populate the modal with the existing child data when the modal opens
  useEffect(() => {
    if (child) {
      setName(child.name || '');
      setAge(child.age || '');
      setPhotoURL(child.photoURL || '');
    }
  }, [child]);

  // Handle form submission for editing
  const handleSubmit = async () => {
    if (!name || !age) return;  // Ensure both name and age are provided

    let updatedPhotoURL = photoURL;
    if (photo) {
      // Upload new photo to Firebase Storage
      const photoRef = ref(storage, `children/${photo.name}`);
      await uploadBytes(photoRef, photo);
      updatedPhotoURL = await getDownloadURL(photoRef);
    }

    // Update child data in Firestore
    try {
      const childRef = doc(db, 'children', child.id);
      await updateDoc(childRef, {
        name,
        age,
        photoURL: updatedPhotoURL,
      });

      // Update the local children list
      setChildren((prevChildren) => prevChildren.map((c) => 
        c.id === child.id ? { ...c, name, age, photoURL: updatedPhotoURL } : c
      ));

      onClose();  // Close the modal after saving
    } catch (error) {
      console.error('Error updating child:', error);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Edit Child Details
        </Typography>

        <TextField
          label="Child's Name"
          variant="outlined"
          fullWidth
          value={name}  // Pre-fill the input with the child's name
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 3 }}
        />

        <TextField
          label="Child's Age"
          variant="outlined"
          fullWidth
          value={age}  // Pre-fill the input with the child's age
          onChange={(e) => setAge(e.target.value)}
          sx={{ mb: 3 }}
        />

        {/* ChildPhotoUploader component for updating the child's photo */}
        <ChildPhotoUploader setPhoto={setPhoto} photoURL={photoURL} setPhotoURL={setPhotoURL} />

        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSubmit} 
          fullWidth
        >
          Save Changes
        </Button>
      </Box>
    </Modal>
  );
};

export default EditChildModal;