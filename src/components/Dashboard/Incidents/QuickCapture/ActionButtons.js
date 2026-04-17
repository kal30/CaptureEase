import React from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { incidentTheme } from '../incidentTheme';

const ActionButtons = ({ 
  onSave,
  canSave,
  loading,
}) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
      <Button
        variant="contained"
        onClick={onSave}
        disabled={!canSave || loading}
        startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
        sx={{
          width: { xs: '100%', sm: 'auto' },
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
