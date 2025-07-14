
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
} from '@mui/material';
import useChildName from '../hooks/useChildName';

import BehaviorTemplateManager from '../components/TemplateManagement/BehaviorTemplateManager';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`template-tabpanel-${index}`}
      aria-labelledby={`template-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `template-tab-${index}`,
    "aria-controls": `template-tabpanel-${index}`,
  };
}

const TemplateLibraryPage = () => {
  const { childId } = useParams();
  const { childName, loading, error } = useChildName(childId);
  const [value, setValue] = useState(0); // 0 for Behavior Templates, 1 for Sensory Templates

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>Error: {error.message}</Typography>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        {childName}'s Template Library
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="template library tabs"
          centered
        >
          <Tab label="Behavior Templates" {...a11yProps(0)} />
          <Tab label="Sensory Templates" {...a11yProps(1)} />
        </Tabs>
      </Box>

      <TabPanel value={value} index={0}>
        <BehaviorTemplateManager childId={childId} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        {/* Sensory Template Management Component will go here */}
        <Typography>Manage Sensory Templates</Typography>
      </TabPanel>
    </Container>
  );
};

export default TemplateLibraryPage;
