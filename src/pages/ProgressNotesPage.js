import React, { useState } from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import ProgressNoteList from "../components/Journal/ProgressNoteList";
import AddProgressNoteModal from "../components/Journal/AddProgressNoteModal";
import ProgressNoteCalendar from "../components/Journal/ProgressNoteCalendar";
import useChildName from "../hooks/useChildName"; // Import the custom hook
import { useChildContext } from "../contexts/ChildContext";
import "../assets/css/ProgressNotes.css";

const ProgressNotesPage = () => {
  const { currentChildId } = useChildContext();
  const { childName, loading, error } = useChildName(currentChildId); // Use the custom hook
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);
  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  if (loading) return <p>Loading...</p>; // Show a loading state if needed
  if (error) return <p>Error: {error.message}</p>;

  if (!currentChildId) {
    return (
      <Typography>
        No child selected. Please select a child from the dashboard.
      </Typography>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        {childName ? `${childName}'s Progress Notes` : "Progress Notes"}
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenModal}
          sx={{ mr: 2 }}
        >
          Add Progress Note
        </Button>
      </Box>

      <ProgressNoteCalendar
        onDateSelect={handleDateSelect}
        childId={currentChildId}
      />

      <ProgressNoteList childId={currentChildId} />

      <AddProgressNoteModal
        open={modalOpen}
        onClose={handleCloseModal}
        childId={currentChildId}
        selectedDate={selectedDate}
      />
    </Container>
  );
};

export default ProgressNotesPage;
