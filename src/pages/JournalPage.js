import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';
import JournalList from '../components/Journal/JournalList';  
import AddJournalModal from '../components/Journal/AddJournalModal';

const JournalPage = () => {
  const { childId } = useParams();
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  return (
    <Container sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Title */}
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ color: '#333333', fontWeight: 'bold', fontSize: '1.8rem', mb: 2, mt:5}}
      >
        Journal Entries
      </Typography>

      {/* Add Button - Fixed at the top */}
      <Box sx={{ textAlign: 'right', padding: '8px' }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleOpenModal} 
          sx={{ position: 'relative', zIndex: 1 }}
        >
          Add Journal Entry
        </Button>
      </Box>

      {/* Scrollable Journal Entries */}
      <Box 
        sx={{ 
          flexGrow: 1,  // Makes the list take up available space
          overflowY: 'auto',  // Allows scrolling when content exceeds the height
          paddingRight: 2,  // Add some padding for nicer scroll experience
          paddingTop: 2,  // Extra padding to separate from Add Button
        }}
      >
        <JournalList childId={childId} />
      </Box>

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