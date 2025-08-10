import React, { useState } from "react";
import { Container, Typography, Box, Tabs, Tab } from "@mui/material";
import { useChildContext } from "../contexts/ChildContext";
import useChildName from "../hooks/useChildName";
import BehaviorTemplateManager from "../components/TemplateManagement/BehaviorTemplateManager";

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const TemplateLibraryPage = () => {
  const { currentChildId } = useChildContext();
  const { childName, loading, error } = useChildName(currentChildId);
  const [value, setValue] = useState(0); // 0 for Behavior Templates, 1 for Sensory Templates

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>Error: {error.message}</Typography>;

  if (!currentChildId) {
    return (
      <Typography>
        No child selected. Please select a child from the dashboard.
      </Typography>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        {childName ? `${childName}'s Template Library` : "Template Library"}
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
        <BehaviorTemplateManager childId={currentChildId} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        {/* Sensory Template Management Component will go here */}
        <Typography>Manage Sensory Templates</Typography>
      </TabPanel>
    </Container>
  );
};

export default TemplateLibraryPage;
