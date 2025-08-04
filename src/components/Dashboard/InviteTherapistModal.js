import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, Typography, TextField } from '@mui/material';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

const InviteTherapistModal = ({ open, onClose, child }) => {
  const [therapistEmail, setTherapistEmail] = useState('');

  const handleInviteTherapist = async () => {
    if (!therapistEmail) {
      console.log('No therapist email provided.');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'invitations'), {
        childId: child.id,
        therapistEmail,
        status: 'pending',
      });
      console.log(`Invitation created. To accept, please visit: /invitation/${docRef.id}`);
      onClose();
      setTherapistEmail('');
    } catch (error) {
      console.error('Error sending invitation:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <Typography variant="h6" gutterBottom>
          Invite Therapist for {child.name}
        </Typography>
        <TextField
          autoFocus
          margin="dense"
          id="email"
          label="Therapist's Email Address"
          type="email"
          fullWidth
          variant="standard"
          value={therapistEmail}
          onChange={(e) => setTherapistEmail(e.target.value)}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleInviteTherapist} color="primary">
          Send Invitation
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InviteTherapistModal;