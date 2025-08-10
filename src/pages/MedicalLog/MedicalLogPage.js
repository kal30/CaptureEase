import React, { useState } from "react";
import { Container, Typography, Box, Tabs, Tab } from "@mui/material";
import { useChildContext } from "../../contexts/ChildContext";
import useChildName from "../../hooks/useChildName";
import MedicationsLogTab from "./MedicationsLogTab";
import DoctorVisitsTab from "./DoctorVisitsTab";

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

const MedicalLogPage = () => {
  const { currentChildId } = useChildContext();
  const { childName, loading, error } = useChildName(currentChildId);
  const [value, setValue] = useState(0); // 0 for Medications, 1 for Doctor Visits

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
        {childName ? `${childName}'s Medical Log` : "Medical Log"}
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="medical log tabs"
          centered
        >
          <Tab label="Medications" {...a11yProps(0)} />
          <Tab label="Doctor Visits" {...a11yProps(1)} />
        </Tabs>
      </Box>

      <TabPanel value={value} index={0}>
        <MedicationsLogTab childId={currentChildId} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <DoctorVisitsTab childId={currentChildId} />
      </TabPanel>
    </Container>
  );
};

export default MedicalLogPage;
