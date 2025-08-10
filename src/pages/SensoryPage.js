import React, { useState, useEffect } from "react";
import { Typography, Button, Box, Container } from "@mui/material"; // Import Container
import SensoryInputList from "../components/SensoryLog/SensoryInputList";
import { useChildContext } from "../contexts/ChildContext";
import useChildName from "../hooks/useChildName"; // Import the custom hook
import { fetchSensoryLogs, deleteSensoryLog } from "../services/sensoryService";
import AddSensoryLogModal from "../components/SensoryLog/AddSensoryLogModal"; // Import your new modal
import SensoryCalendar from "../components/SensoryLog/SensoryCalendar";
import "../assets/css/Sensory.css"; // Main CSS file for the page

const SensoryPage = () => {
  const { currentChildId } = useChildContext(); // Get childId from context
  const { childName, loading, error } = useChildName(currentChildId); // Fetch childName with your custom hook
  const [entries, setEntries] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch sensory logs when currentChildId changes
  useEffect(() => {
    const loadEntries = async () => {
      if (currentChildId) {
        const logs = await fetchSensoryLogs(currentChildId);
        setEntries(logs);
      }
    };

    loadEntries();
  }, [currentChildId]);

  if (loading) return <p>Loading...</p>; // Show a loading state if needed
  if (error) return <p>Error: {error.message}</p>; // Handle any error state

  if (!currentChildId) {
    return (
      <Typography>
        No child selected. Please select a child from the dashboard.
      </Typography>
    );
  }

  // Define handleLogAdded function to refresh logs when a new log is added
  const handleLogAdded = async () => {
    const updatedLogs = await fetchSensoryLogs(currentChildId);
    setEntries(updatedLogs);
  };

  const handleEdit = (index) => {};

  const handleDelete = async (index) => {
    const logId = entries[index].id;
    await deleteSensoryLog(currentChildId, logId);

    // Refresh the logs after deletion
    const updatedLogs = await fetchSensoryLogs(currentChildId);
    setEntries(updatedLogs);
  };

  return (
    <Container maxWidth="md">
      {" "}
      {/* Limit the page width */}
      <Typography variant="h4" align="center" gutterBottom>
        Sensory Input Log for {childName}
      </Typography>
      {/* Add Sensory Log Button */}
      <Box textAlign="center" mb={3}>
        {" "}
        {/* Center the button */}
        <Button
          variant="contained"
          color="primary"
          className="sensory-button"
          onClick={() => setModalOpen(true)}
        >
          Add Sensory Log
        </Button>
      </Box>
      {/* Sensory Calendar */}
      <SensoryCalendar childId={currentChildId} />
      {/* Sensory Log List */}
      <Box mt={4}>
        {" "}
        {/* Add some space above the list */}
        <SensoryInputList
          entries={entries}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          childId={currentChildId}
        />
      </Box>
      {/* Add Sensory Log Modal */}
      <AddSensoryLogModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        childId={currentChildId}
        onLogAdded={handleLogAdded}
      />
    </Container>
  );
};

export default SensoryPage;
