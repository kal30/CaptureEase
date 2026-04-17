import React from "react";
import { Container, Typography, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useChildContext } from "../../contexts/ChildContext";
import useChildName from "../../hooks/useChildName";
import MedicationsLogTab from "./MedicationsLogTab";

const MedicalLogPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentChildId } = useChildContext();
  const { childName, loading, error } = useChildName(currentChildId);
  const initialShowArchived = Boolean(location.state?.showArchived);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>Error: {error.message}</Typography>;

  if (!currentChildId) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No profile selected
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Please go back to the dashboard and tap Medication from a child's profile.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        {childName ? `${childName}'s Medications` : "Medications"}
      </Typography>

      <Box sx={{ pt: 3 }}>
        <MedicationsLogTab
          childId={currentChildId}
          childName={childName}
          initialShowArchived={initialShowArchived}
        />
      </Box>
    </Container>
  );
};

export default MedicalLogPage;
