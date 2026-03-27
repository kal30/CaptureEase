import React, { useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, TextField } from '@mui/material';
import { sendInvitation } from '../../services/invitationService';

const AddCaregiverModal = ({ open, onClose, onCaregiverAdded, child }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleAddCaregiver = async () => {
    if (!child) {
      setError('No child selected');
      return;
    }
    setError('');
    try {
      await sendInvitation(child.id, email, 'caregiver');
      onCaregiverAdded();
      setEmail('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to send invitation. Please try again.');
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
        <TextField
          autoFocus
          margin="dense"
          label="Email Address"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleAddCaregiver}>Send Invitation</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCaregiverModal;