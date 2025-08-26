import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Chip,
  IconButton,
  Popover,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { isToday } from "date-fns";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useChildContext } from "../contexts/ChildContext";
import useChildName from "../hooks/useChildName";
import ResponsiveLayout from "../components/Layout/ResponsiveLayout";
import LogInput from "../components/DailyNotes/LogInput";
import DailyLogFeed from "../components/DailyNotes/DailyLogFeed";

const DailyLogPage = () => {
  const navigate = useNavigate();
  const { currentChildId } = useChildContext();
  const {
    childName,
    loading: childNameLoading,
    error,
  } = useChildName(currentChildId);

  const [calendarAnchor, setCalendarAnchor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Get the child name for page title
  const pageTitle = childName ? `Daily Log - ${childName}` : "Daily Log";


  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };


  if (childNameLoading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>Error: {error.message}</Typography>;

  if (!currentChildId) {
    return (
      <ResponsiveLayout pageTitle="Daily Log">
        <Paper elevation={2} sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            No child selected
          </Typography>
          <Typography color="text.secondary" paragraph>
            Please select a child from the dashboard to continue with daily
            logging.
          </Typography>
          <Button
            variant="contained"
            onClick={handleBackToDashboard}
            startIcon={<ArrowBackIcon />}
          >
            Back to Dashboard
          </Button>
        </Paper>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout pageTitle={pageTitle}>
      {/* Enhanced Header with Navigation */}
      <Box sx={{ mb: 3 }}>

        {/* Page Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <IconButton
            onClick={handleBackToDashboard}
            sx={{
              bgcolor: "primary.main",
              color: "white",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            <ArrowBackIcon />
          </IconButton>

          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: 700, mb: 0.5 }}
            >
              📝 Daily Log
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="h6" color="text.secondary">
                {childName}
              </Typography>
              <Chip
                label={selectedDate.toLocaleDateString()}
                size="small"
                color="primary"
                variant="outlined"
                clickable
                onClick={(e) => setCalendarAnchor(e.currentTarget)}
                icon={<CalendarTodayIcon />}
              />
            </Box>
          </Box>
        </Box>

      </Box>

      {/* Timeline View - Input and Feed Together */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, minHeight: "60vh" }}>
        {/* Add New Entry Section */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            ✍️ New Daily Entry
            <Chip 
              label={isToday(selectedDate) ? "Today" : selectedDate.toLocaleDateString()} 
              size="small" 
              color={isToday(selectedDate) ? "success" : "primary"} 
            />
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Record your child's daily activities, milestones, and observations.
          </Typography>
          <LogInput childId={currentChildId} selectedDate={selectedDate} />
        </Paper>


        {/* Timeline Feed Section */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            📚 Timeline for {isToday(selectedDate) ? "Today" : selectedDate.toLocaleDateString()}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Recent entries {!isToday(selectedDate) && `from ${selectedDate.toDateString()}`}
          </Typography>
          <DailyLogFeed
            childId={currentChildId}
            selectedDate={selectedDate}
          />
        </Paper>
      </Box>

      {/* Calendar Popover */}
      <Popover
        open={Boolean(calendarAnchor)}
        anchorEl={calendarAnchor}
        onClose={() => setCalendarAnchor(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateCalendar
            value={selectedDate}
            onChange={(newDate) => {
              setSelectedDate(newDate);
              setCalendarAnchor(null);
            }}
            maxDate={new Date()} // Prevent future dates
            sx={{
              "& .MuiPickersDay-today": {
                border: "2px solid",
                borderColor: "primary.main",
              },
            }}
          />
        </LocalizationProvider>
      </Popover>
    </ResponsiveLayout>
  );
};

export default DailyLogPage;
