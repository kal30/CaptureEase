import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, Typography, List, ListItem, ListItemText } from '@mui/material';
import { assignCaregiver } from '../../services/childService';
import { useNavigate } from 'react-router-dom';

const AssignCaregiverModal = ({ open, onClose, child, caregivers }) => {
  const [selectedCaregiver, setSelectedCaregiver] = useState(null);
  const navigate = useNavigate();

  const handleAssignCaregiver = async () => {
    if (!selectedCaregiver) {
      console.log("No caregiver selected.");
      return;
    }

    try {
      await assignCaregiver(child.id, selectedCaregiver.id);
      console.log("Caregiver successfully assigned.");
      onClose();
      setSelectedCaregiver(null);
    } catch (error) {
      console.error('Error assigning caregiver:', error);
    }
  };

  const handleCaregiverClick = (caregiver) => {
    setSelectedCaregiver(caregiver);
  };

  const handleGoToCareTeam = () => {
    onClose();
    navigate('/care-team');
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <Typography variant="h6" gutterBottom>
          Assign Caregiver to {child.name}
        </Typography>
        {caregivers.length > 0 ? (
          <List>
            {caregivers.map((caregiver) => (
              <ListItem
                button
                key={caregiver.id}
                onClick={() => handleCaregiverClick(caregiver)}
                selected={selectedCaregiver && selectedCaregiver.id === caregiver.id}
              >
                <ListItemText primary={caregiver.name} secondary={caregiver.email} />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>No caregivers available. Please add one from the Care Team page.</Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleGoToCareTeam} color="info">Go to Care Team</Button>
        <Button onClick={handleAssignCaregiver} color="primary" disabled={!selectedCaregiver}>
          Assign Caregiver
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignCaregiverModal;