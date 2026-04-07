import React from 'react';
import { DialogActions, TextField, Button, CircularProgress } from '@mui/material';
import { EFFECTIVENESS_LEVELS } from '../../../../services/incidentService';
import colors from '../../../../assets/theme/colors';

const FollowUpForm = ({ 
  followUpNotes, 
  setFollowUpNotes,
  effectiveness,
  loading,
  onSubmit,
  onClose,
  onResolveIncident
}) => {
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
        disabled={loading}
        sx={{ mb: 2 }}
      />
      
      <DialogActions sx={{ p: 3, pt: 0, gap: 1, flexWrap: 'wrap' }}>
        <Button onClick={onClose} disabled={loading}>
          Skip for Now
        </Button>
        
        <Button
          variant="outlined"
          onClick={onResolveIncident}
          disabled={loading}
          sx={{
            borderColor: colors.semantic.success,
            color: colors.semantic.success,
            '&:hover': {
              borderColor: colors.semantic.success,
              bgcolor: colors.landing.sageLight,
            },
          }}
        >
          ✅ Issue Resolved - Skip All Follow-ups
        </Button>
        
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={!effectiveness || loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
          sx={{
            bgcolor: effectiveness ? EFFECTIVENESS_LEVELS[Object.keys(EFFECTIVENESS_LEVELS).find(
              k => EFFECTIVENESS_LEVELS[k].value === effectiveness
            )]?.color : colors.brand.ink,
            '&:hover': {
              bgcolor: effectiveness ? EFFECTIVENESS_LEVELS[Object.keys(EFFECTIVENESS_LEVELS).find(
              k => EFFECTIVENESS_LEVELS[k].value === effectiveness
              )]?.color : colors.brand.navy,
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
