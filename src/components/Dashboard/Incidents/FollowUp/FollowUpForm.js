import React from 'react';
import { DialogActions, TextField, Button, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { EFFECTIVENESS_LEVELS } from '../../../../services/incidentService';

const FollowUpForm = ({ 
  followUpNotes, 
  setFollowUpNotes,
  effectiveness,
  loading,
  onSubmit,
  onClose
}) => {
  const theme = useTheme();

  return (
    <>
      <TextField
        label="Additional notes (optional)"
        multiline
        rows={3}
        fullWidth
        value={followUpNotes}
        onChange={(e) => setFollowUpNotes(e.target.value)}
        placeholder="Any additional observations or changes needed..."
        sx={{ mb: 2 }}
      />
      
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} disabled={loading}>
          Skip for Now
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={!effectiveness || loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
          sx={{
            bgcolor: effectiveness ? EFFECTIVENESS_LEVELS[Object.keys(EFFECTIVENESS_LEVELS).find(
              k => EFFECTIVENESS_LEVELS[k].value === effectiveness
            )]?.color : theme.palette.primary.main,
            '&:hover': {
              bgcolor: effectiveness ? EFFECTIVENESS_LEVELS[Object.keys(EFFECTIVENESS_LEVELS).find(
                k => EFFECTIVENESS_LEVELS[k].value === effectiveness
              )]?.color : theme.palette.primary.dark,
              filter: 'brightness(0.9)',
            },
          }}
        >
          {loading ? 'Saving...' : 'Submit Follow-up'}
        </Button>
      </DialogActions>
    </>
  );
};

export default FollowUpForm;