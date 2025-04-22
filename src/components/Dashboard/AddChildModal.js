import React, { useState } from 'react';
import { Box, Button, Modal, TextField, Typography } from '@mui/material';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection } from 'firebase/firestore';  // Import Firestore functions
import { db } from '../../services/firebase';  // Adjust the path based on your structure
import ChildPhotoUploader from './ChildPhotoUploader';  // Import the ChildPhotoUploader component

const AddChildModal = ({ open, onClose, setChildren }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [photo, setPhoto] = useState(null);  // State for photo file
  const [photoURL, setPhotoURL] = useState(null);  // State for photo URL
  const [loading, setLoading] = useState(false);  // State to manage loading
  const storage = getStorage();

  // Handle the form submission
  const handleSubmit = async () => {
    if (!name || !age) return;  // Ensure both name and age are provided
  
    setLoading(true);  // Start loading state
    let photoDownloadURL = '';
  
    // Upload photo if it exists
    if (photo) {
      try {
        const photoRef = ref(storage, `children/${photo.name}`);
        await uploadBytes(photoRef, photo);
        photoDownloadURL = await getDownloadURL(photoRef);  // Get the download URL of the photo
      } catch (error) {
        console.error('Error uploading photo:', error);
        setLoading(false);
        return;
      }
    }
  
    // Create the new child object
    const newChild = { 
      name, 
      age, 
      photoURL: photoDownloadURL  // Store the photo URL with the child's info
    };
  
    try {
      // Save child to Firestore
      const docRef = await addDoc(collection(db, 'children'), newChild);
      console.log('Child added to Firestore with ID:', docRef.id);
      
      // No need to update setChildren locally here, as the Firestore snapshot listener will handle this
      onClose();  // Close the modal after saving
      resetForm();  // Reset form fields after submission
    } catch (error) {
      console.error('Error saving child:', error);
    } finally {
      setLoading(false);  // Stop loading state
    }
  };

  // Reset form fields
  const resetForm = () => {
    setName('');
    setAge('');
    setPhoto(null);
    setPhotoURL(null);
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
          Add New Child
        </Typography>

        <TextField
          label="Child's Name"
          variant="outlined"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 3 }}
        />

        <TextField
          label="Child's Age"
          variant="outlined"
          fullWidth
          value={age}
          onChange={(e) => setAge(e.target.value)}
          sx={{ mb: 3 }}
        />

        {/* ChildPhotoUploader component */}
        <ChildPhotoUploader setPhoto={setPhoto} photoURL={photoURL} setPhotoURL={setPhotoURL} />

        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSubmit} 
          fullWidth
          disabled={loading}  // Disable button during loading
        >
          {loading ? 'Saving...' : 'Add Child'}  {/* Show loading text */}
        </Button>
      </Box>
    </Modal>
  );
};

export default AddChildModal;