// Existing JournalPage code
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Typography, Button, Box } from "@mui/material";
import JournalList from "../components/Journal/JournalList";
import AddJournalModal from "../components/Journal/AddJournalModal";
import JournalCalendar from "../components/Journal/JournalCalendar";
import useChildName from "../hooks/useChildName"; // Import the custom hook
import "../assets/css/Journal.css";

const JournalPage = () => {
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
        sx={{ color: "#333", fontWeight: "bold" }}
      >
        Journal Entries for {childName}
      </Typography>
      <Box sx={{ padding: 2 }}>
        <Button
          variant="contained"
          className="journal-button" // Use the CSS class here
          onClick={handleOpenModal}
        >
          Add Journal Entry
        </Button>
      </Box>
      <JournalCalendar childId={childId} onDateSelect={handleDateSelect} />
      <Box sx={{ flexGrow: 1, overflowY: "auto", paddingTop: 2 }}>
        {selectedDate && (
          <Typography variant="h6" sx={{ marginBottom: 2 }}>
            Entries for {selectedDate.toDateString()}
          </Typography>
        )}
        <JournalList childId={childId} selectedDate={selectedDate} />
      </Box>
      <AddJournalModal
        open={modalOpen}
        onClose={handleCloseModal}
        childId={childId}
      />
    </Container>
  );
};

export default JournalPage;
