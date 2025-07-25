import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, Tabs, Tab, Container } from "@mui/material";
import useChildName from "../../hooks/useChildName";

import MedicationsLogTab from "./MedicationsLogTab";
import DoctorVisitsTab from "./DoctorVisitsTab";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`medical-tabpanel-${index}`}
      aria-labelledby={`medical-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `medical-tab-${index}`,
    "aria-controls": `medical-tabpanel-${index}`,
  };
}

const MedicalLogPage = () => {
  const { childId } = useParams();
  const { childName, loading, error } = useChildName(childId);
  const [value, setValue] = useState(0); // 0 for Medications, 1 for Doctor Visits

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>Error: {error.message}</Typography>;

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        {childName}'s Medical Log
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
        <MedicationsLogTab childId={childId} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <DoctorVisitsTab childId={childId} />
      </TabPanel>
    </Container>
  );
};

export default MedicalLogPage;
