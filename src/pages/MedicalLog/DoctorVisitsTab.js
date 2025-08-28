import React, { useState } from 'react';
import { Box, Typography, Button, List, ListItem, ListItemText, Modal, TextField, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles'; // Import useTheme
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
  const theme = useTheme(); // Get theme object
  const [visits, setVisits] = useState([
    {
      id: 'visit1',
      visitDate: '2024-06-10',
      doctorName: 'Dr. Emily White',
      specialty: 'Pediatrician',
      reasonForVisit: 'Annual check-up',
      diagnosis: 'Healthy child',
      treatmentRecommendations: 'Continue healthy diet and exercise.',
      summaryNotes: 'Child is growing well, all vaccinations up to date.',
      followUpDate: '2025-06-10',
    },
    {
      id: 'visit2',
      visitDate: '2024-05-20',
      doctorName: 'Dr. Alex Chen',
      specialty: 'Dermatologist',
      reasonForVisit: 'Rash on arm',
      diagnosis: 'Eczema flare-up',
      treatmentRecommendations: 'Prescribed topical cream, avoid harsh soaps.',
      summaryNotes: 'Rash improving with new cream. Discussed triggers.',
      followUpDate: '',
    },
  ]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [currentVisit, setCurrentVisit] = useState(null);
  const [visitForm, setVisitForm] = useState({
    visitDate: '',
    doctorName: '',
    specialty: '',
    reasonForVisit: '',
    diagnosis: '',
    treatmentRecommendations: '',
    summaryNotes: '',
    followUpDate: '',
  });

  // useEffect(() => {
  //   const loadVisits = async () => {
  //     const fetchedVisits = await fetchDoctorVisits(childId);
  //     setVisits(fetchedVisits);
  //   };
  //   loadVisits();
  // }, [childId]);

  const handleOpenAddModal = (visit = null) => {
    setCurrentVisit(visit);
    if (visit) {
      setVisitForm({
        visitDate: visit.visitDate,
        doctorName: visit.doctorName,
        specialty: visit.specialty,
        reasonForVisit: visit.reasonForVisit,
        diagnosis: visit.diagnosis || '',
        treatmentRecommendations: visit.treatmentRecommendations || '',
        summaryNotes: visit.summaryNotes,
        followUpDate: visit.followUpDate || '',
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
              primary={<Typography variant="subtitle1" component="span" sx={{ fontWeight: 'bold', mb: 1, color: theme.palette.primary.main }}>{`${visit.doctorName} on ${visit.visitDate}`}</Typography>}
              secondary={
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.primary"><strong>Reason:</strong> {visit.reasonForVisit}</Typography>
                  {visit.diagnosis && <Typography variant="body2" color="text.primary"><strong>Diagnosis:</strong> {visit.diagnosis}</Typography>}
                  {visit.treatmentRecommendations && <Typography variant="body2" color="text.primary"><strong>Treatment:</strong> {visit.treatmentRecommendations}</Typography>}
                  {visit.followUpDate && <Typography variant="body2" color="text.primary"><strong>Follow-up:</strong> {visit.followUpDate}</Typography>}
                  {visit.summaryNotes && <Typography variant="body2" color="text.primary"><strong>Notes:</strong> {visit.summaryNotes}</Typography>}
                </Box>
              }
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
            id="diagnosis"
            label="Diagnosis"
            name="diagnosis"
            multiline
            rows={2}
            value={visitForm.diagnosis}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            fullWidth
            id="treatmentRecommendations"
            label="Treatment/Recommendations"
            name="treatmentRecommendations"
            multiline
            rows={3}
            value={visitForm.treatmentRecommendations}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            fullWidth
            id="followUpDate"
            label="Follow-up Date"
            name="followUpDate"
            type="date"
            InputLabelProps={{
              shrink: true,
            }}
            value={visitForm.followUpDate}
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
