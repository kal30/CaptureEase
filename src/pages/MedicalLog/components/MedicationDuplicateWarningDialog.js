import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
} from '@mui/material';

const MedicationDuplicateWarningDialog = ({
  open,
  medicationName = '',
  existingTimeLabel = '',
  reason = '',
  onKeepExisting,
  onLogAgainAnyway,
}) => (
  <Dialog open={open} onClose={onKeepExisting} maxWidth="xs" fullWidth>
    <DialogTitle sx={{ pb: 1 }}>Possible duplicate</DialogTitle>
    <DialogContent sx={{ pt: 0.5 }}>
      <Typography sx={{ fontWeight: 700, mb: 0.75 }}>
        {reason || `Already logged at ${existingTimeLabel || 'this time'}`}
      </Typography>
      {medicationName ? (
        <Typography variant="body2" color="text.secondary">
          {medicationName}
        </Typography>
      ) : null}
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2 }}>
      <Button onClick={onKeepExisting} variant="text" sx={{ textTransform: 'none' }}>
        Keep existing
      </Button>
      <Button onClick={onLogAgainAnyway} variant="contained" sx={{ textTransform: 'none' }}>
        Log again anyway
      </Button>
    </DialogActions>
  </Dialog>
);

export default MedicationDuplicateWarningDialog;
