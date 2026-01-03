import React from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import { NoteAdd } from '@mui/icons-material';

const QuickNoteActions = ({ onDetailedLog, onCancel, onSubmit, loading, canSubmit }) => (
  <>
    <Button
      size="small"
      variant="text"
      onClick={onDetailedLog}
      sx={{ textTransform: 'none' }}
    >
      Detailed log →
    </Button>
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button onClick={onCancel} disabled={loading} color="secondary">
        Cancel
      </Button>
      <Button
        onClick={onSubmit}
        variant="contained"
        disabled={loading || !canSubmit}
        startIcon={loading ? <CircularProgress size={16} /> : <NoteAdd />}
        sx={{
          backgroundColor: '#6366F1',
          '&:hover': {
            backgroundColor: '#4F46E5'
          }
        }}
      >
        {loading ? 'Saving...' : 'Log Note'}
      </Button>
    </Box>
  </>
);

export default QuickNoteActions;
