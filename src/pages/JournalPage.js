import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Button } from '@mui/material';
import JournalList from '../components/Journal/JournalList';  // Updated
import AddJournalModal from '../components/Journal/AddJournalModal';

const JournalPage = () => {
  const { childId } = useParams();
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Journal Entries</Typography>

      {/* Modular JournalList */}
      <JournalList childId={childId} />

      <Button variant="contained" color="primary" onClick={handleOpenModal}>
        Add Journal Entry
      </Button>

      {/* Add Journal Modal */}
      <AddJournalModal
        open={modalOpen}
        onClose={handleCloseModal}
        childId={childId}
      />
    </Container>
  );
};

export default JournalPage;