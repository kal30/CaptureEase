import React, { useState } from "react";
import { Container, Typography, Box, Tabs, Tab } from "@mui/material";
import { useChildContext } from "../../contexts/ChildContext";
import useChildName from "../../hooks/useChildName";
import ProgressNoteTab from "./ProgressNoteTab";
import SensoryLogTab from "./SensoryLogTab";
import BehaviorTab from "./BehaviorTab";
import MoodLogTab from "./MoodLogTab";

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

const ChildLogPage = () => {
  const { currentChildId } = useChildContext();
  const { childName, loading, error } = useChildName(currentChildId);
  const [value, setValue] = useState(0); // 0 for Progress Notes, 1 for Sensory Logs, 2 for Behaviors

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
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        {childName ? `${childName}'s Log` : "Child Log"}
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="child log tabs"
          centered
        >
          <Tab label="Progress Notes" {...a11yProps(0)} />
          <Tab label="Sensory Logs" {...a11yProps(1)} />
          <Tab label="Behaviors" {...a11yProps(2)} />
          <Tab label="Mood Logs" {...a11yProps(3)} />
        </Tabs>
      </Box>

      <TabPanel value={value} index={0}>
        <ProgressNoteTab childId={currentChildId} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <SensoryLogTab childId={currentChildId} />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <BehaviorTab childId={currentChildId} />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <MoodLogTab childId={currentChildId} />
      </TabPanel>
    </Container>
  );
};

export default ChildLogPage;
