import React, { useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, TextField } from '@mui/material';
import { sendInvitation } from '../../services/invitationService';

const AddTherapistModal = ({ open, onClose, onTherapistAdded, child }) => {
  const [email, setEmail] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [error, setError] = useState('');

  const handleAddTherapist = async () => {
    if (!child) {
      setError('No child selected');
      return;
    }
    setError('');
    try {
      await sendInvitation(child.id, email, 'therapist', specialization);
      onTherapistAdded();
      setEmail('');
      setSpecialization('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to send invitation. Please try again.');
    }
  };

  const handleClose = () => {
    setEmail('');
    setSpecialization('');
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
        <TextField
          margin="dense"
          label="Specialization"
          type="text"
          fullWidth
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleAddTherapist}>Send Invitation</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTherapistModal;