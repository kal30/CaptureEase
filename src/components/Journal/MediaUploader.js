// MediaUploader.js
import React, { useState } from 'react';
import { Button, Typography } from '@mui/material';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const MAX_FILE_SIZE_MB = 50; // Set the file size limit (e.g., 50 MB)

const MediaUploader = ({ childId, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    
    // Check file size before uploading
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      setErrorMessage(`File size exceeds the ${MAX_FILE_SIZE_MB} MB limit.`);
      return;
    }

    setErrorMessage(null);  // Reset error message if valid size
    uploadFile(file);  // Proceed to upload
  };

  const uploadFile = (file) => {
    const storage = getStorage();
    const storageRef = ref(storage, `journals/${childId}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    setUploading(true);

    uploadTask.on('state_changed', 
      (snapshot) => {
        // Calculate progress percentage
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      }, 
      (error) => {
        console.error('Upload failed:', error);
        setUploading(false);
      }, 
      () => {
        // Upload completed
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setUploading(false);
          setUploadProgress(0);
          onUploadComplete(downloadURL);  // Pass the media URL to the parent component
        });
      }
    );
  };

  return (
    <div>
      <Button 
        variant="outlined"
        component="label"
        disabled={uploading}
      >
        {uploading ? `Uploading... ${Math.round(uploadProgress)}%` : "Upload Media"}
        <input 
          type="file" 
          accept="image/*, video/*, audio/*" 
          hidden 
          onChange={handleFileUpload} 
        />
      </Button>

      {/* Error Message */}
      {errorMessage && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {errorMessage}
        </Typography>
      )}
    </div>
  );
};

export default MediaUploader;