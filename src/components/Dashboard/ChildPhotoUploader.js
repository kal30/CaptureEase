import React, { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';

const ChildPhotoUploader = ({ setPhoto, photoURL, setPhotoURL }) => {
  // Handle file change for the photo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);  // Set the selected photo file
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoURL(reader.result);  // Set the photo preview
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
      <IconButton component="label">
        <PhotoCamera />
        <input type="file" hidden accept="image/*" onChange={handleFileChange} />
      </IconButton>
      {photoURL && (
        <img
          src={photoURL}
          alt="Child Preview"
          style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginLeft: 10 }}
        />
      )}
    </Box>
  );
};

export default ChildPhotoUploader;