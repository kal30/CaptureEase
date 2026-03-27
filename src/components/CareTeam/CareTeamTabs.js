import React, { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import CaregiverManager from './CaregiverManager';
import TherapistManager from './TherapistManager';

const CareTeamTabs = ({ initialTab, child }) => {
  const [selectedTab, setSelectedTab] = useState(initialTab);

  const handleChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={selectedTab} onChange={handleChange} centered>
        <Tab label="Caregivers" />
        <Tab label="Therapists" />
      </Tabs>
      {selectedTab === 0 && <CaregiverManager child={child} />}
      {selectedTab === 1 && <TherapistManager child={child} />}
    </Box>
  );
};

export default CareTeamTabs;