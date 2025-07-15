// Dashboard.js
import React, { useState, useEffect } from "react";
import { Container, Typography, Button, Box, Grid } from "@mui/material";
import AddChildModal from "../components/Dashboard/AddChildModal";
import AssignCaregiverModal from "../components/Dashboard/AssignCaregiverModal";
import AssignTherapistModal from "../components/Dashboard/AssignTherapistModal";
import EditChildModal from "../components/Dashboard/EditChildModal";
import ChildCard from "../components/Dashboard/ChildCard";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../services/firebase";
import theme from "../assets/theme/light";
import LogMoodModal from "../components/Dashboard/LogMoodModal";
import { getUsersByRole } from "../services/userService";

const Dashboard = () => {
  const [children, setChildren] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [addChildOpen, setAddChildOpen] = useState(false);
  const [assignCaregiverOpen, setAssignCaregiverOpen] = useState(false);
  const [assignTherapistOpen, setAssignTherapistOpen] = useState(false);
  const [editChildOpen, setEditChildOpen] = useState(false);
  const [logMoodOpen, setLogMoodOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);

  // New state for expanded child
  const [expandedChildId, setExpandedChildId] = useState(null);

  // Fetch all children from Firestore in real-time
  const [userDisplayName, setUserDisplayName] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (currentUser) {
        // Force a refresh of the user token to ensure displayName is up-to-date
        await currentUser.reload();
        const updatedUser = auth.currentUser; // Get the reloaded user object
        setUserDisplayName(updatedUser.displayName || updatedUser.email || 'User');
        const unsubscribe = onSnapshot(
          query(collection(db, "children"), where("parentId", "==", currentUser.uid)),
          (snapshot) => {
            const childrenData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            console.log("Fetched children for current user:", childrenData);
            setChildren(childrenData);
          }
        );
        return () => unsubscribe();
      } else {
        setChildren([]); // Clear children if no user is logged in
        setUserDisplayName('');
      }
    };
    loadUserData();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const fetchedCaregivers = await getUsersByRole('caregiver');
      setCaregivers(fetchedCaregivers);
      const fetchedTherapists = await getUsersByRole('therapist');
      setTherapists(fetchedTherapists);
    };
    fetchUsers();
  }, []);

  // Retrieve persisted expandedChildId when component mounts
  useEffect(() => {
    const storedExpandedChildId = localStorage.getItem("expandedChildId");
    if (storedExpandedChildId) {
      setExpandedChildId(storedExpandedChildId);
    }
  }, []);

  // Handle accordion expansion
  const handleAccordionChange = (childId) => (event, isExpanded) => {
    const newExpandedChildId = isExpanded ? childId : null;
    setExpandedChildId(newExpandedChildId);

    // Persist the expandedChildId to localStorage
    if (isExpanded) {
      localStorage.setItem("expandedChildId", childId);
    } else {
      localStorage.removeItem("expandedChildId");
    }
  };

  const handleAddChildOpen = () => setAddChildOpen(true);
  const handleAddChildClose = () => setAddChildOpen(false);

  const handleAssignCaregiverOpen = (child) => {
    setSelectedChild(child);
    setAssignCaregiverOpen(true);
  };
  const handleAssignCaregiverClose = () => setAssignCaregiverOpen(false);

  const handleAssignTherapistOpen = (child) => {
    setSelectedChild(child);
    setAssignTherapistOpen(true);
  };
  const handleAssignTherapistClose = () => setAssignTherapistOpen(false);

  const handleEditChildOpen = (child) => {
    setSelectedChild(child);
    setEditChildOpen(true);
  };
  const handleEditChildClose = () => setEditChildOpen(false);

  const handleLogMoodOpen = (child) => {
    setSelectedChild(child);
    setLogMoodOpen(true);
  };
  const handleLogMoodClose = () => setLogMoodOpen(false);

  // Implement the delete child handler
  const handleDeleteChild = (child) => {
    // Implement deletion logic here
    console.log("Delete child:", child);
    // For example, delete the child document from Firestore
  };

  // Implement the unlink caregiver handler
  const handleUnlinkCaregiver = (child) => {
    // Implement unlinking logic here
    console.log("Unlink caregiver from child:", child);
    // For example, update the child's document in Firestore to remove the caregiver
  };

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Welcome, {userDisplayName}!
      </Typography>
      <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'text.secondary' }}>
        Manage your children's profiles and track their progress.
      </Typography>

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-start' }}>
        <Button
          variant="contained"
          onClick={handleAddChildOpen}
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: "white",
            padding: "12px 24px",
            fontSize: "1rem",
            fontWeight: "bold",
            borderRadius: "8px",
            "&:hover": {
              backgroundColor: theme.palette.secondary.main,
            },
          }}
        >
          Add New Child
        </Button>
      </Box>

      {/* Display child cards in a responsive grid */}
      {children.length > 0 ? (
        <Grid container spacing={3}> {/* Added Grid container */}
          {children.map((child) => (
            <Grid item xs={12} sm={6} md={4} key={child.id}> {/* Responsive Grid item */}
              <ChildCard
                child={child}
                expanded={expandedChildId === child.id}
                onAccordionChange={handleAccordionChange(child.id)}
                onAssignCaregiver={handleAssignCaregiverOpen}
                onAssignTherapist={handleAssignTherapistOpen}
                onEditChild={handleEditChildOpen}
                onDeleteChild={handleDeleteChild}
                onUnlinkCaregiver={handleUnlinkCaregiver}
                onLogMood={handleLogMoodOpen}
                allCaregivers={caregivers}
                allTherapists={therapists}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1" sx={{ mt: 4, color: 'text.secondary' }}>
          No children added yet. Click "Add New Child" to get started.
        </Typography>
      )}

      {/* Modals */}
      <AddChildModal
        open={addChildOpen}
        onClose={handleAddChildClose}
        setChildren={setChildren}
      />
      {selectedChild && (
        <AssignCaregiverModal
          open={assignCaregiverOpen}
          onClose={handleAssignCaregiverClose}
          child={selectedChild}
          caregivers={caregivers}
        />
      )}
      {selectedChild && (
        <AssignTherapistModal
          open={assignTherapistOpen}
          onClose={handleAssignTherapistClose}
          child={selectedChild}
          therapists={therapists}
        />
      )}
      <EditChildModal
        open={editChildOpen}
        onClose={handleEditChildClose}
        child={selectedChild}
        setChildren={setChildren}
      />
      {selectedChild && (
      <LogMoodModal
        open={logMoodOpen}
        onClose={handleLogMoodClose}
        child={selectedChild}
      />
      )}
    </Container>
  );
};

export default Dashboard;
