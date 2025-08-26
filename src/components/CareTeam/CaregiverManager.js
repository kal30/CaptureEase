import React, { useState, useEffect } from 'react';
import { Button, Box, Typography, List, ListItem, ListItemText, IconButton } from '@mui/material';
import { getUsersByRole } from '../../services/userService';
import { deleteUser } from '../../services/careTeamService';
import AddCaregiverModal from './AddCaregiverModal';
import EditCaregiverModal from './EditCaregiverModal';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const CaregiverManager = ({ child }) => {
  const [caregivers, setCaregivers] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState(null);

  const fetchCaregivers = async () => {
    const fetchedCaregivers = await getUsersByRole('caregiver');
    setCaregivers(fetchedCaregivers);
  };

  useEffect(() => {
    fetchCaregivers();
  }, []);

  const handleAddModalOpen = () => setAddModalOpen(true);
  const handleAddModalClose = () => setAddModalOpen(false);

  const handleEditModalOpen = (caregiver) => {
    setSelectedCaregiver(caregiver);
    setEditModalOpen(true);
  };
  const handleEditModalClose = () => {
    setSelectedCaregiver(null);
    setEditModalOpen(false);
  };

  const handleDelete = async (caregiverId) => {
    try {
      await deleteUser(caregiverId);
      fetchCaregivers();
    } catch (error) {
      console.error('Error deleting caregiver:', error);
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Manage Caregivers
      </Typography>
      <Button variant="contained" sx={{ mb: 2 }} onClick={handleAddModalOpen}>
        Add Caregiver
      </Button>
      <List>
        {caregivers.map((caregiver) => (
          <ListItem key={caregiver.id}>
            <ListItemText primary={caregiver.name} secondary={caregiver.email} />
            <IconButton onClick={() => handleEditModalOpen(caregiver)}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => handleDelete(caregiver.id)}>
              <DeleteIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
      <AddCaregiverModal
        open={addModalOpen}
        onClose={handleAddModalClose}
        onCaregiverAdded={fetchCaregivers}
        child={child}
      />
      <EditCaregiverModal
        open={editModalOpen}
        onClose={handleEditModalClose}
        caregiver={selectedCaregiver}
        onCaregiverUpdated={fetchCaregivers}
      />
    </Box>
  );
};

export default CaregiverManager;