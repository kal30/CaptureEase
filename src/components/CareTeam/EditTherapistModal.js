import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, TextField } from '@mui/material';
import { updateUser } from '../../services/careTeamService';

const EditTherapistModal = ({ open, onClose, therapist, onTherapistUpdated }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [specialization, setSpecialization] = useState('');

  useEffect(() => {
    if (therapist) {
      setName(therapist.name);
      setEmail(therapist.email);
      setSpecialization(therapist.specialization);
    }
  }, [therapist]);

  const handleUpdateTherapist = async () => {
    try {
      await updateUser(therapist.id, { name, email, specialization });
      onTherapistUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating therapist:', error);
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
        <Button onClick={handleUpdateTherapist}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditTherapistModal;