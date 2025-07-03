import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Typography, Button, Box } from "@mui/material";
import ProgressNoteList from "../components/Journal/ProgressNoteList";
import AddProgressNoteModal from "../components/Journal/AddProgressNoteModal";
import ProgressNoteCalendar from "../components/Journal/ProgressNoteCalendar";
import useChildName from "../hooks/useChildName"; // Import the custom hook
import "../assets/css/ProgressNotes.css";

const ProgressNotesPage = () => {
  const { childId } = useParams();
  const { childName, loading, error } = useChildName(childId); // Use the custom hook
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);
  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  if (loading) return <p>Loading...</p>; // Show a loading state if needed
  if (error) return <p>Error: {error.message}</p>; // Handle any error state

  return (
    <Container sx={{ padding: 3 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: "text.primary", fontWeight: "bold" }}
      >
        Progress Notes for {childName}
      </Typography>
      <Box sx={{ padding: 2 }}>
        <Button
          variant="contained"
          className="journal-button" // Use the CSS class here
          onClick={handleOpenModal}
        >
          Add Progress Note
        </Button>
      </Box>
      <ProgressNoteCalendar childId={childId} onDateSelect={handleDateSelect} />
      <Box sx={{ flexGrow: 1, overflowY: "auto", paddingTop: 2 }}>
        {selectedDate && (
          <Typography variant="h6" sx={{ marginBottom: 2 }}>
            Entries for {selectedDate.toDateString()}
          </Typography>
        )}
        <ProgressNoteList childId={childId} selectedDate={selectedDate} />
      </Box>
      <AddProgressNoteModal
        open={modalOpen}
        onClose={handleCloseModal}
        childId={childId}
      />
    </Container>
  );
};

export default ProgressNotesPage;