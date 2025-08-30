import React, { useState } from 'react';
import { Paper, Typography } from '@mui/material';
import RichTextInput from '../../../UI/RichTextInput';

const IncidentMediaUpload = ({ 
  value, 
  onChange,
  onMediaChange 
}) => {
  const [clearTrigger, setClearTrigger] = useState(false);

  const handleDataChange = (richData) => {
    // richData = { text, mediaFile, audioBlob }
    if (onChange) {
      onChange(richData.text || '');
    }
    if (onMediaChange) {
      onMediaChange({
        mediaFile: richData.mediaFile,
        audioBlob: richData.audioBlob
      });
    }
  };

  const clearData = () => {
    setClearTrigger(true);
    setTimeout(() => setClearTrigger(false), 100);
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        backgroundColor: '#ffffff'
      }}
    >
      <Typography 
        variant="subtitle1" 
        gutterBottom 
        sx={{ 
          fontWeight: 600,
          color: '#1f2937'
        }}
      >
        📝 Incident Details & Media
      </Typography>
      <RichTextInput
        onDataChange={handleDataChange}
        clearData={clearTrigger}
        templateText="Describe what happened. You can attach photos, videos, or record voice notes..."
      />
    </Paper>
  );
};

export default IncidentMediaUpload;