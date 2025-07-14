import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, Tabs, Tab, Container } from "@mui/material";
import CustomCalendar from "../../components/UI/Calendar/CustomCalendar";
import { fetchProgressNotes } from "../../services/progressNotesService";
import { fetchSensoryLogs } from "../../services/sensoryService";
import { getBehaviors } from "../../services/behaviorService";
import useChildName from "../../hooks/useChildName";
import dayjs from 'dayjs';

// Import the new tab components
import ProgressNoteTab from "./ProgressNoteTab";
import SensoryLogTab from "./SensoryLogTab";
import BehaviorTab from "./BehaviorTab";
import MoodLogTab from "./MoodLogTab";

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

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const ChildLogPage = () => {
  const { childId } = useParams();
  const { childName, loading, error } = useChildName(childId);
  const [value, setValue] = useState(0); // 0 for Progress Notes, 1 for Sensory Logs, 2 for Behaviors
  const [events, setEvents] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    const loadEvents = async () => {
      const progressNotes = await fetchProgressNotes(childId);
      const sensoryLogs = await fetchSensoryLogs(childId);
      const behaviors = await getBehaviors(childId);

      const dailyActivityMap = new Map();

      // Aggregate Progress Notes
      progressNotes.forEach(note => {
        const dateKey = dayjs(note.date.toDate()).format('YYYY-MM-DD');
        if (!dailyActivityMap.has(dateKey)) {
          dailyActivityMap.set(dateKey, { hasPN: false, hasSL: false, hasBH: false });
        }
        dailyActivityMap.get(dateKey).hasPN = true;
      });

      // Aggregate Sensory Logs
      sensoryLogs.forEach(log => {
        const dateKey = dayjs(log.timestamp.toDate()).format('YYYY-MM-DD');
        if (!dailyActivityMap.has(dateKey)) {
          dailyActivityMap.set(dateKey, { hasPN: false, hasSL: false, hasBH: false });
        }
        dailyActivityMap.get(dateKey).hasSL = true;
      });

      // Aggregate Behaviors
      behaviors.forEach(behavior => {
        const dateKey = dayjs(behavior.createdAt.toDate()).format('YYYY-MM-DD');
        if (!dailyActivityMap.has(dateKey)) {
          dailyActivityMap.set(dateKey, { hasPN: false, hasSL: false, hasBH: false });
        }
        dailyActivityMap.get(dateKey).hasBH = true;
      });

      const aggregatedEvents = Array.from(dailyActivityMap.entries()).map(([dateKey, types]) => {
        let titleParts = [];
        if (types.hasPN) titleParts.push('📝'); // Progress Note icon
        if (types.hasSL) titleParts.push('🧠'); // Sensory Log icon
        if (types.hasBH) titleParts.push('🎯'); // Behavior icon

        return {
          title: titleParts.join(' '),
          start: dayjs(dateKey).toDate(),
          end: dayjs(dateKey).toDate(),
          allDay: true,
          type: "aggregated",
          color: '#607d8b', // A neutral color for aggregated events
        };
      });

      setEvents(aggregatedEvents);
    };

    loadEvents();
  }, [childId, refreshKey]);

  const handleSaveSuccess = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>Error: {error.message}</Typography>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        {childName}'s Behavioral Log
      </Typography>

      <Box sx={{ mb: 3 }}>
        <CustomCalendar
          childId={childId}
          events={events}
          fetchFromFirestore={false}
        />
      </Box>

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
          <Tab label="Mood" {...a11yProps(3)} />
        </Tabs>
      </Box>

      <TabPanel value={value} index={0}>
        <ProgressNoteTab childId={childId} onSaveSuccess={handleSaveSuccess} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <SensoryLogTab childId={childId} onSaveSuccess={handleSaveSuccess} />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <BehaviorTab childId={childId} onSaveSuccess={handleSaveSuccess} />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <MoodLogTab childId={childId} />
      </TabPanel>
    </Container>
  );
};

export default ChildLogPage;
