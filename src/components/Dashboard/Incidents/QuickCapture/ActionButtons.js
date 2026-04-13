import React from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { incidentTheme } from '../incidentTheme';

const ActionButtons = ({ 
  onCancel,
  onSave,
  canSave,
  loading,
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
          bgcolor: incidentTheme.save,
          color: '#FFFFFF',
          '&:hover': {
            bgcolor: incidentTheme.saveHover,
          },
        }}
      >
        {loading ? 'Saving...' : 'Save Incident'}
      </Button>
    </Box>
  );
};

export default ActionButtons;
