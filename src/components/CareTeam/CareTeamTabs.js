import React, { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import CaregiverManager from './CaregiverManager';
import TherapistManager from './TherapistManager';

const CareTeamTabs = ({ initialTab }) => {
  const [selectedTab, setSelectedTab] = useState(initialTab);
  console.log("CareTeamTabs - initialTab prop:", initialTab);
  console.log("CareTeamTabs - selectedTab state:", selectedTab);

  const handleChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={selectedTab} onChange={handleChange} centered>
        <Tab label="Caregivers" />
        <Tab label="Therapists" />
      </Tabs>
      {selectedTab === 0 && <CaregiverManager />}
      {selectedTab === 1 && <TherapistManager />}
    </Box>
  );
};

export default CareTeamTabs;