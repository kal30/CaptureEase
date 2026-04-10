import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, TextField } from '@mui/material';
import { updateUser } from '../../services/careTeamService';

const EditCaregiverModal = ({ open, onClose, caregiver, onCaregiverUpdated }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (caregiver) {
      setName(caregiver.name);
      setEmail(caregiver.email);
    }
  }, [caregiver]);

  const handleUpdateCaregiver = async () => {
    try {
      await updateUser(caregiver.id, { name, email });
      onCaregiverUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating caregiver:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Name"
          type="text"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Email Address"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleUpdateCaregiver}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditCaregiverModal;