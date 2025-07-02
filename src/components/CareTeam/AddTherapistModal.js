import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, TextField } from '@mui/material';
import { addUser } from '../../services/careTeamService';

const AddTherapistModal = ({ open, onClose, onTherapistAdded }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [specialization, setSpecialization] = useState('');

  const handleAddTherapist = async () => {
    try {
      await addUser({ name, email, role: 'therapist', specialization });
      onTherapistAdded();
      onClose();
    } catch (error) {
      console.error('Error adding therapist:', error);
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
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleAddTherapist}>Add</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTherapistModal;