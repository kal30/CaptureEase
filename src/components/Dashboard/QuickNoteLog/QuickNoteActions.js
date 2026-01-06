import React from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import { NoteAdd } from '@mui/icons-material';

const QuickNoteActions = ({ onDetailedLog, onCancel, onSubmit, loading, canSubmit, stacked = false }) => (
  <>
    <Button
      size="small"
      variant="text"
      onClick={onDetailedLog}
      sx={{ textTransform: 'none', alignSelf: stacked ? 'flex-start' : 'center' }}
    >
      Detailed log →
    </Button>
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        flexDirection: stacked ? 'column-reverse' : 'row',
        width: stacked ? '100%' : 'auto'
      }}
    >
      <Button onClick={onCancel} disabled={loading} color="secondary" sx={{ width: stacked ? '100%' : 'auto' }}>
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
          },
          width: stacked ? '100%' : 'auto'
        }}
      >
        {loading ? 'Saving...' : 'Log Note'}
      </Button>
    </Box>
  </>
);

export default QuickNoteActions;
