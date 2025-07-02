import React from 'react';
import { Container, Typography } from '@mui/material';
import CareTeamTabs from '../components/CareTeam/CareTeamTabs';
import { useLocation } from 'react-router-dom';

const CareTeamPage = () => {
  const location = useLocation();
  const initialTab = location.state?.activeTab || 0;
  console.log("CareTeamPage - initialTab:", initialTab);

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Care Team
      </Typography>
      <CareTeamTabs initialTab={initialTab} />
    </Container>
  );
};

export default CareTeamPage;