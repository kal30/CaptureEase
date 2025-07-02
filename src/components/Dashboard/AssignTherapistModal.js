import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, Typography, List, ListItem, ListItemText } from '@mui/material';
import { assignTherapist } from '../../services/childService';
import { getUsersByRole } from '../../services/userService';
import { useNavigate } from 'react-router-dom';

const AssignTherapistModal = ({ open, onClose, child }) => {
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [therapists, setTherapists] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTherapists = async () => {
      const fetchedTherapists = await getUsersByRole('therapist');
      setTherapists(fetchedTherapists);
    };
    fetchTherapists();
  }, []);

  const handleAssignTherapist = async () => {
    if (!selectedTherapist) {
      console.log("No therapist selected.");
      return;
    }

    try {
      await assignTherapist(child.id, selectedTherapist.id);
      console.log("Therapist successfully assigned.");
      onClose();
      setSelectedTherapist(null);
    } catch (error) {
      console.error('Error assigning therapist:', error);
    }
  };

  const handleTherapistClick = (therapist) => {
    setSelectedTherapist(therapist);
  };

  const handleGoToCareTeam = () => {
    onClose();
    navigate('/care-team');
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <Typography variant="h6" gutterBottom>
          Assign Therapist to {child.name}
        </Typography>
        {therapists.length > 0 ? (
          <List>
            {therapists.map((therapist) => (
              <ListItem
                button
                key={therapist.id}
                onClick={() => handleTherapistClick(therapist)}
                selected={selectedTherapist && selectedTherapist.id === therapist.id}
              >
                <ListItemText primary={`${therapist.name} (${therapist.specialization})`} secondary={therapist.email} />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>No therapists available. Please add one from the Care Team page.</Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleGoToCareTeam} color="info">Go to Care Team</Button>
        <Button onClick={handleAssignTherapist} color="primary" disabled={!selectedTherapist}>
          Assign Therapist
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignTherapistModal;