// Dashboard.js
import React, { useState, useEffect } from "react";
import { Container, Typography, Button } from "@mui/material";
import AddChildModal from "../components/Dashboard/AddChildModal";
import AssignCaregiverModal from "../components/Dashboard/AssignCaregiverModal";
import EditChildModal from "../components/Dashboard/EditChildModal";
import ChildCard from "../components/Dashboard/ChildCard";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import theme from "../assets/theme/light";

const Dashboard = () => {
  const [children, setChildren] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [addChildOpen, setAddChildOpen] = useState(false);
  const [assignCaregiverOpen, setAssignCaregiverOpen] = useState(false);
  const [editChildOpen, setEditChildOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);

  // New state for expanded child
  const [expandedChildId, setExpandedChildId] = useState(null);

  // Fetch all children from Firestore in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "children"), (snapshot) => {
      const childrenData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Fetched children:", childrenData);
      setChildren(childrenData);
    });

    return () => unsubscribe();
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

  const handleEditChildOpen = (child) => {
    setSelectedChild(child);
    setEditChildOpen(true);
  };
  const handleEditChildClose = () => setEditChildOpen(false);

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
      <Typography variant="h4" gutterBottom>
        Welcome to Your Dashboard
      </Typography>

      <Button
        variant="contained"
        onClick={handleAddChildOpen}
        sx={{
          mb: 3,
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
        Add Child
      </Button>

      {/* Display child cards */}
      {children.length > 0 ? (
        children.map((child) => (
          <ChildCard
            key={child.id}
            child={child}
            expanded={expandedChildId === child.id}
            onAccordionChange={handleAccordionChange(child.id)}
            onAssignCaregiver={handleAssignCaregiverOpen}
            onEditChild={handleEditChildOpen}
            onDeleteChild={handleDeleteChild}
            onUnlinkCaregiver={handleUnlinkCaregiver}
          />
        ))
      ) : (
        <Typography variant="body1">No children added yet.</Typography>
      )}

      {/* Modals */}
      <AddChildModal
        open={addChildOpen}
        onClose={handleAddChildClose}
        setChildren={setChildren}
      />
      <AssignCaregiverModal
        open={assignCaregiverOpen}
        onClose={handleAssignCaregiverClose}
        child={selectedChild}
        caregivers={caregivers}
        setCaregivers={setCaregivers}
      />
      <EditChildModal
        open={editChildOpen}
        onClose={handleEditChildClose}
        child={selectedChild}
        setChildren={setChildren}
      />
    </Container>
  );
};

export default Dashboard;
