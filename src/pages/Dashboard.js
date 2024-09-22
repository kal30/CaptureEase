// src/pages/Dashboard.js
import React from 'react';
import { Typography, Container, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';  // Import useNavigate to handle navigation

const Dashboard = () => {
  const navigate = useNavigate();  // Initialize the navigation hook

  const handleRecordEntryClick = () => {
    navigate('/record-entry');  // Navigate to the Record Entry page
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to Your Dashboard!
      </Typography>
      <Typography variant="body1">
        You are successfully logged in.
      </Typography>

      {/* Add a button to navigate to the Record Entry page */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleRecordEntryClick}  // When clicked, navigate to the Record Entry page
        sx={{ mt: 3 }}
      >
        Record an Event
      </Button>
    </Container>
  );
};

export default Dashboard;