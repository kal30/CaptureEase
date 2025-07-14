import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, List, ListItem, ListItemText, Modal, TextField, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { addDoctorVisit, fetchDoctorVisits, updateDoctorVisit, deleteDoctorVisit } from '../../services/doctorVisitService';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const DoctorVisitsTab = ({ childId }) => {
  const [visits, setVisits] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [currentVisit, setCurrentVisit] = useState(null);
  const [visitForm, setVisitForm] = useState({
    visitDate: '',
    doctorName: '',
    specialty: '',
    reasonForVisit: '',
    summaryNotes: '',
  });

  useEffect(() => {
    const loadVisits = async () => {
      const fetchedVisits = await fetchDoctorVisits(childId);
      setVisits(fetchedVisits);
    };
    loadVisits();
  }, [childId]);

  const handleOpenAddModal = (visit = null) => {
    setCurrentVisit(visit);
    if (visit) {
      setVisitForm({
        visitDate: visit.visitDate,
        doctorName: visit.doctorName,
        specialty: visit.specialty,
        reasonForVisit: visit.reasonForVisit,
        summaryNotes: visit.summaryNotes,
      });
    } else {
      setVisitForm({
        visitDate: '',
        doctorName: '',
        specialty: '',
        reasonForVisit: '',
        summaryNotes: '',
      });
    }
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
    setCurrentVisit(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVisitForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (currentVisit) {
      await updateDoctorVisit(currentVisit.id, visitForm);
    } else {
      await addDoctorVisit({ ...visitForm, childId });
    }
    const fetchedVisits = await fetchDoctorVisits(childId);
    setVisits(fetchedVisits);
    handleCloseAddModal();
  };

  const handleDelete = async (visitId) => {
    if (window.confirm('Are you sure you want to delete this doctor visit?')) {
      await deleteDoctorVisit(visitId);
      const fetchedVisits = await fetchDoctorVisits(childId);
      setVisits(fetchedVisits);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Doctor Visits</Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => handleOpenAddModal()}
        sx={{ mb: 2 }}
      >
        Add New Doctor Visit
      </Button>

      <List>
        {visits.map((visit) => (
          <ListItem
            key={visit.id}
            secondaryAction={
              <>
                <IconButton edge="end" aria-label="edit" onClick={() => handleOpenAddModal(visit)}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(visit.id)}>
                  <DeleteIcon />
                </IconButton>
              </>
            }
          >
            <ListItemText
              primary={`${visit.doctorName} (${visit.specialty}) on ${visit.visitDate}`}
              secondary={visit.reasonForVisit}
            />
          </ListItem>
        ))}
      </List>

      <Modal
        open={openAddModal}
        onClose={handleCloseAddModal}
        aria-labelledby="add-edit-visit-title"
        aria-describedby="add-edit-visit-description"
      >
        <Box sx={style}>
          <Typography id="add-edit-visit-title" variant="h6" component="h2">
            {currentVisit ? 'Edit Doctor Visit' : 'Add New Doctor Visit'}
          </Typography>
          <TextField
            margin="normal"
            required
            fullWidth
            id="visitDate"
            label="Visit Date"
            name="visitDate"
            type="date"
            InputLabelProps={{
              shrink: true,
            }}
            value={visitForm.visitDate}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="doctorName"
            label="Doctor's Name"
            name="doctorName"
            value={visitForm.doctorName}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            fullWidth
            id="specialty"
            label="Specialty"
            name="specialty"
            value={visitForm.specialty}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            fullWidth
            id="reasonForVisit"
            label="Reason for Visit"
            name="reasonForVisit"
            multiline
            rows={2}
            value={visitForm.reasonForVisit}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            fullWidth
            id="summaryNotes"
            label="Summary Notes"
            name="summaryNotes"
            multiline
            rows={4}
            value={visitForm.summaryNotes}
            onChange={handleChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleSubmit}
          >
            {currentVisit ? 'Update Visit' : 'Add Visit'}
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default DoctorVisitsTab;