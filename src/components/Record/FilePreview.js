import React from 'react';
import { Box } from '@mui/material';

const FilePreview = ({ mediaFile, mediaPreview }) => {
  if (!mediaPreview) return null;  // Don't render anything if there's no preview

  return (
    <Box sx={{ mb: 2 }}>
      {mediaFile?.type.startsWith('video') ? (
        <video controls width="100%">
          <source src={mediaPreview} />
          Your browser does not support the video tag.
        </video>
      ) : (
        <img src={mediaPreview} alt="Selected Media" style={{ width: '100%' }} />
      )}
    </Box>
  );
};

export default FilePreview;