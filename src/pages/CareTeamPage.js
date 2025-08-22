import React from 'react';
import { Container, Typography } from '@mui/material';
import CareTeamTabs from '../components/CareTeam/CareTeamTabs';
import { useLocation } from 'react-router-dom';
import ResponsiveLayout from '../components/Layout/ResponsiveLayout';

const CareTeamPage = () => {
  const location = useLocation();
  const initialTab = location.state?.activeTab || 0;
  console.log("CareTeamPage - initialTab:", initialTab);

  return (
    <ResponsiveLayout pageTitle="Care Team">
      <Typography variant="h4" gutterBottom>
        Care Team
      </Typography>
      <CareTeamTabs initialTab={initialTab} />
    </ResponsiveLayout>
  );
};

export default CareTeamPage;