import React from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

const ActionButtons = ({ 
  onCancel,
  onSave,
  canSave,
  loading,
  incidentConfig 
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
      <Button
        variant="outlined"
        onClick={onCancel}
        sx={{ flex: 1 }}
      >
        Cancel
      </Button>
      <Button
        variant="contained"
        onClick={onSave}
        disabled={!canSave || loading}
        startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
        sx={{
          flex: 2,
          bgcolor: incidentConfig?.color,
          '&:hover': {
            bgcolor: incidentConfig?.color,
            filter: 'brightness(0.9)',
          },
        }}
      >
        {loading ? 'Saving...' : 'Save Incident'}
      </Button>
    </Box>
  );
};

export default ActionButtons;