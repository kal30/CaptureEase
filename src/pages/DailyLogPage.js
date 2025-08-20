import React from "react";
import { Container, Typography, Box } from "@mui/material";
import { useChildContext } from "../contexts/ChildContext";
import useChildName from "../hooks/useChildName";
import LogInput from "../components/DailyNotes/LogInput";
import DailyLogFeed from "../components/DailyNotes/DailyLogFeed";

const DailyLogPage = () => {
  const { currentChildId } = useChildContext();
  const {
    childName,
    loading: childNameLoading,
    error,
  } = useChildName(currentChildId);

  if (childNameLoading) {
    return <Typography>Loading child information...</Typography>;
  }

  if (error) {
    return (
      <Typography color="error">
        Error loading child's name: {error.message}
      </Typography>
    );
  }

  if (!currentChildId) {
    return (
      <Typography>
        No child selected. Please select a child from the dashboard.
      </Typography>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {childName ? `${childName}'s Daily Logs` : "Daily Logs"}
        </Typography>
      </Box>
      <LogInput childId={currentChildId} />
      <DailyLogFeed childId={currentChildId} />
    </Container>
  );
};

export default DailyLogPage;
