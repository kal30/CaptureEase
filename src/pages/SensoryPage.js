import React, { useState, useEffect } from "react";
import { Typography, Button, Box, Container } from "@mui/material"; // Import Container
import SensoryInputList from "../components/SensoryLog/SensoryInputList";
import { useParams } from "react-router-dom";
import useChildName from "../hooks/useChildName"; // Import the custom hook
import { fetchSensoryLogs, deleteSensoryLog } from "../services/sensoryService";
import AddSensoryLogModal from "../components/SensoryLog/AddSensoryLogModal"; // Import your new modal
import CustomCalendar from "../components/UI/Calendar/CustomCalendar"; // Import CustomCalendar
import SensoryCalendar from "../components/SensoryLog/SensoryCalendar";
import "../assets/css/Sensory.css"; // Main CSS file for the page

const SensoryPage = () => {
  const { childId } = useParams(); // Get childId from the route
  const { childName, loading, error } = useChildName(childId); // Fetch childName with your custom hook
  const [entries, setEntries] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // Fetch sensory logs when childId changes
  useEffect(() => {
    const loadEntries = async () => {
      const logs = await fetchSensoryLogs(childId);
      setEntries(logs);
    };

    loadEntries();
  }, [childId]);

  if (loading) return <p>Loading...</p>; // Show a loading state if needed
  if (error) return <p>Error: {error.message}</p>; // Handle any error state

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  // Define handleLogAdded function to refresh logs when a new log is added
  const handleLogAdded = async () => {
    const updatedLogs = await fetchSensoryLogs(childId);
    setEntries(updatedLogs);
  };

  const handleEdit = (index) => {
    const entryToEdit = entries[index];
    // You can implement the logic to pass this entry to the form to edit it
  };

  const handleDelete = async (index) => {
    const logId = entries[index].id;
    await deleteSensoryLog(childId, logId);

    // Refresh the logs after deletion
    const updatedLogs = await fetchSensoryLogs(childId);
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
      <SensoryCalendar childId={childId} onDateSelect={handleDateSelect} />
      {/* Sensory Log List */}
      <Box mt={4}>
        {" "}
        {/* Add some space above the list */}
        <SensoryInputList
          entries={entries}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          childId={childId}
        />
      </Box>
      {/* Add Sensory Log Modal */}
      <AddSensoryLogModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        childId={childId}
        onLogAdded={handleLogAdded}
      />
    </Container>
  );
};

export default SensoryPage;
