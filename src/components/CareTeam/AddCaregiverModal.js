import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, TextField } from '@mui/material';
import { sendInvitation } from '../../services/invitationService';

const AddCaregiverModal = ({ open, onClose, onCaregiverAdded, child }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleAddCaregiver = async () => {
    if (!child) {
      console.error('No child selected');
      return;
    }
    
    try {
      await sendInvitation(child.id, email, 'caregiver');
      onCaregiverAdded();
      setName('');
      setEmail('');
      onClose();
    } catch (error) {
      console.error('Error inviting caregiver:', error);
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
        <Button onClick={handleAddCaregiver}>Add</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCaregiverModal;