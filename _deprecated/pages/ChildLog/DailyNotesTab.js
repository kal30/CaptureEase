import React, { useState } from "react";
import { Box, Button } from "@mui/material";
import LogInput from "../../components/DailyNotes/LogInput";
import DailyLogFeed from "../../components/DailyNotes/DailyLogFeed";

const DailyNotesTab = ({ childId }) => {
  const [showAddForm, setShowAddForm] = useState(true);

  return (
    <Box>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "center", gap: 2 }}>
        <Button
          variant="contained"
          onClick={() => setShowAddForm(true)}
          disabled={showAddForm}
        >
          Add New Entry
        </Button>
        <Button
          variant="contained"
          onClick={() => setShowAddForm(false)}
          disabled={!showAddForm}
        >
          View Previous Entries
        </Button>
      </Box>

      {showAddForm ? (
        <LogInput childId={childId} />
      ) : (
        <DailyLogFeed childId={childId} />
      )}
    </Box>
  );
};

export default DailyNotesTab;
