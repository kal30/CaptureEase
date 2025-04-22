import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, TextField, MenuItem, Typography } from '@mui/material';
import { assignCaregiver } from '../../services/childService';  // Import the Firestore function

const AssignCaregiverModal = ({ open, onClose, child, caregivers, setCaregivers }) => {
  const [selectedCaregiver, setSelectedCaregiver] = useState('');
  const [newCaregiverName, setNewCaregiverName] = useState('');
  const [newCaregiverEmail, setNewCaregiverEmail] = useState('');

  // Handle caregiver assignment
  const handleAssignCaregiver = async () => {
    let caregiver = selectedCaregiver;
  
    // Check if adding a new caregiver
    if (newCaregiverName && newCaregiverEmail) {
      caregiver = {
        name: newCaregiverName,
        email: newCaregiverEmail,
      };
      setCaregivers((prev) => [...prev, caregiver]);  // Add new caregiver to the list locally
  
      console.log("New caregiver added:", caregiver);  // Debug log for new caregiver
    }
  
    // If no caregiver is selected or added, prevent submission
    if (!caregiver) {
      console.log("No caregiver selected or added.");  // Debug log if no caregiver
      return;
    }
  
    // Firestore Update
    try {
      console.log("Assigning caregiver to child:", child.id, caregiver);  // Debug log before Firestore update
      await assignCaregiver(child.id, caregiver);  // Call the Firestore update function
  
      console.log("Caregiver successfully assigned.");  // Debug log after successful assignment
      onClose();  // Close the modal after successful assignment
  
      // Reset fields
      setSelectedCaregiver('');
      setNewCaregiverName('');
      setNewCaregiverEmail('');
    } catch (error) {
      console.error('Error assigning caregiver:', error);  // Log any error
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        {/* Dropdown for selecting an existing caregiver */}
        <TextField
          select
          label="Select Caregiver"
          value={selectedCaregiver}
          onChange={(e) => setSelectedCaregiver(e.target.value)}
          fullWidth
        >
          {caregivers.map((caregiver, index) => (
            <MenuItem key={index} value={caregiver}>
              {caregiver.name} ({caregiver.email})
            </MenuItem>
          ))}
        </TextField>

        <Typography variant="body2" sx={{ mt: 2 }}>Or add a new caregiver:</Typography>

        <TextField
          label="New Caregiver Name"
          value={newCaregiverName}
          onChange={(e) => setNewCaregiverName(e.target.value)}
          fullWidth
          sx={{ mt: 2 }}
        />

        <TextField
          label="New Caregiver Email"
          value={newCaregiverEmail}
          onChange={(e) => setNewCaregiverEmail(e.target.value)}
          fullWidth
          sx={{ mt: 2 }}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleAssignCaregiver} color="primary">Assign Caregiver</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignCaregiverModal;