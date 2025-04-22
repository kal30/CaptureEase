// CaregiverInfo.js
import React from 'react';
import { Box, Typography, Chip, Button } from '@mui/material';

const CaregiverInfo = ({ caregiver, onAssignCaregiver }) => {
  return (
    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
      {caregiver ? (
        <Chip
        label={`Caregiver: ${caregiver.name} (${caregiver.email})`}
        color="secondary"
        sx={{ fontSize: '0.9rem', fontWeight: '500' }}  // Adjust font weight for emphasis
      />
    
      ) : (
        <Button
          variant="contained"
          color="secondary"
          onClick={onAssignCaregiver}
          sx={{ textTransform: 'none', fontWeight: 'bold' }}
        >
          Assign Caregiver
        </Button>
      )}
    </Box>
  );
};

export default CaregiverInfo;