import React, { useState, useEffect } from 'react';
import { Button, Box, Typography, List, ListItem, ListItemText, IconButton } from '@mui/material';
import { getUsersByRole } from '../../services/userService';
import { deleteUser } from '../../services/careTeamService';
import AddTherapistModal from './AddTherapistModal';
import EditTherapistModal from './EditTherapistModal';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const TherapistManager = () => {
  const [therapists, setTherapists] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState(null);

  const fetchTherapists = async () => {
    const fetchedTherapists = await getUsersByRole('therapist');
    setTherapists(fetchedTherapists);
  };

  useEffect(() => {
    fetchTherapists();
  }, []);

  const handleAddModalOpen = () => setAddModalOpen(true);
  const handleAddModalClose = () => setAddModalOpen(false);

  const handleEditModalOpen = (therapist) => {
    setSelectedTherapist(therapist);
    setEditModalOpen(true);
  };
  const handleEditModalClose = () => {
    setSelectedTherapist(null);
    setEditModalOpen(false);
  };

  const handleDelete = async (therapistId) => {
    try {
      await deleteUser(therapistId);
      fetchTherapists();
    } catch (error) {
      console.error('Error deleting therapist:', error);
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Manage Therapists
      </Typography>
      <Button variant="contained" sx={{ mb: 2 }} onClick={handleAddModalOpen}>
        Add Therapist
      </Button>
      <List>
        {therapists.map((therapist) => (
          <ListItem key={therapist.id}>
            <ListItemText primary={therapist.name} secondary={`${therapist.email} - ${therapist.specialization}`} />
            <IconButton onClick={() => handleEditModalOpen(therapist)}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => handleDelete(therapist.id)}>
              <DeleteIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
      <AddTherapistModal
        open={addModalOpen}
        onClose={handleAddModalClose}
        onTherapistAdded={fetchTherapists}
      />
      <EditTherapistModal
        open={editModalOpen}
        onClose={handleEditModalClose}
        therapist={selectedTherapist}
        onTherapistUpdated={fetchTherapists}
      />
    </Box>
  );
};

export default TherapistManager;