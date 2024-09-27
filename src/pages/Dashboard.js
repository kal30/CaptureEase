import React, { useState, useEffect } from 'react';
import { Container, Typography, Button } from '@mui/material';
import AddChildModal from '../components/Dashboard/AddChildModal';
import AssignCaregiverModal from '../components/Dashboard/AssignCaregiverModal';
import EditChildModal from '../components/Dashboard/EditChildModal';  // Import the EditChildModal
import ChildCard from '../components/Dashboard/ChildCard';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';  // Make sure to use the correct path for firebase.js
import theme from '../theme'

const Dashboard = () => {
  const [children, setChildren] = useState([]);
  const [caregivers, setCaregivers] = useState([]);  // Initialize caregivers as an empty array
  const [addChildOpen, setAddChildOpen] = useState(false);
  const [assignCaregiverOpen, setAssignCaregiverOpen] = useState(false);
  const [editChildOpen, setEditChildOpen] = useState(false);  // State for opening EditChildModal
  const [selectedChild, setSelectedChild] = useState(null);

  // Fetch all children from Firestore in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'children'), (snapshot) => {
      const childrenData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log('Fetched children:', childrenData);  // Debugging log
      setChildren(childrenData);  // Set the children state
    });

    return () => unsubscribe();  // Clean up the listener
  }, []);

  const handleAddChildOpen = () => setAddChildOpen(true);
  const handleAddChildClose = () => setAddChildOpen(false);

  const handleAssignCaregiverOpen = (child) => {
    setSelectedChild(child);
    setAssignCaregiverOpen(true);
  };
  const handleAssignCaregiverClose = () => setAssignCaregiverOpen(false);

  const handleEditChildOpen = (child) => {
    setSelectedChild(child);  // Set the selected child for editing
    setEditChildOpen(true);  // Open the EditChildModal
  };
  const handleEditChildClose = () => setEditChildOpen(false);

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Welcome to Your Dashboard
      </Typography>
      
      <Button 
  variant="contained" 
  onClick={handleAddChildOpen}
  sx={{
    mb: 3,
    backgroundColor: theme.palette.primary.main,  // Use eggplant as primary color from theme
    color: 'white',  // Text color
    padding: '12px 24px',  // Make the button larger
    fontSize: '1rem',  // Increase font size for better readability
    fontWeight: 'bold',  // Bold text
    borderRadius: '8px',  // Slightly round the button
    '&:hover': {
      backgroundColor: theme.palette.secondary.main,  // Change color on hover
    }
  }}
>
  Add Child
</Button>

      {/* Display child cards */}
      {children.length > 0 ? (
        children.map((child, index) => (
          <ChildCard 
            key={index} 
            child={child} 
            onAssignCaregiver={handleAssignCaregiverOpen}
            onEditChild={handleEditChildOpen}  // Add onEditChild for editing
          />
        ))
      ) : (
        <Typography variant="body1">No children added yet.</Typography>
      )}

      {/* Modals */}
      <AddChildModal open={addChildOpen} onClose={handleAddChildClose} setChildren={setChildren} />
      <AssignCaregiverModal 
        open={assignCaregiverOpen} 
        onClose={handleAssignCaregiverClose} 
        child={selectedChild}
        caregivers={caregivers}  // Pass caregivers list
        setCaregivers={setCaregivers}  // Pass function to update caregivers
      />
      <EditChildModal 
        open={editChildOpen} 
        onClose={handleEditChildClose} 
        child={selectedChild}  // Pass the selected child to the edit modal
        setChildren={setChildren}  // Pass function to update the children after editing
      />
    </Container>
  );
};

export default Dashboard;