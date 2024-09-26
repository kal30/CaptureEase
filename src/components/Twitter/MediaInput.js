import React from 'react';
import { IconButton } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

const MediaInput = ({ handleFileChange }) => {
  return (
    <>
      {/* Camera icon for taking photos */}
      <IconButton component="label" sx={{ color: 'secondary.main', marginRight: 1 }}>
        <CameraAltIcon />
        <input
          type="file"
          hidden
          accept="image/*"
          capture="environment"  // This enables live camera capture
          onChange={handleFileChange}
        />
      </IconButton>

      {/* Attach file icon */}
      <IconButton component="label" sx={{ color: 'secondary.main', marginRight: 1 }}>
        <AttachFileIcon />
        <input type="file" hidden onChange={handleFileChange} />
      </IconButton>
    </>
  );
};

export default MediaInput;