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
  TextField,
  InputAdornment,
} from "@mui/material";
import { useTheme } from "@mui/material/styles"; // Import useTheme
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { isToday } from "date-fns";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { useChildContext } from "../contexts/ChildContext";
import useChildName from "../hooks/useChildName";
import ResponsiveLayout from "../components/Layout/ResponsiveLayout";
import LogInput from "../components/DailyNotes/LogInput";
import DailyLogFeed from "../components/DailyNotes/DailyLogFeed";

const DailyLogPage = () => {
  const navigate = useNavigate();
  const theme = useTheme(); // Get theme object
  const { currentChildId } = useChildContext();
  const {
    childName,
    loading: childNameLoading,
    error,
  } = useChildName(currentChildId);

  const [calendarAnchor, setCalendarAnchor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [datesWithEntries, setDatesWithEntries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Get the child name for page title
  const pageTitle = childName ? `Daily Log - ${childName}` : "Daily Log";

  // Custom Day component with entry indicator
  const CustomDay = (props) => {
    const { day, outsideCurrentMonth, ...other } = props;
    const dayString = day.toDateString();
    const hasEntries = datesWithEntries.includes(dayString);

    return (
      <Box sx={{ position: 'relative' }}>
        <PickersDay 
          {...other} 
          day={day} 
          outsideCurrentMonth={outsideCurrentMonth}
        />
        {hasEntries && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 4,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: theme.palette.primary.main,
              zIndex: 1
            }}
          />
        )}
      </Box>
    );
  };


  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
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
              bgcolor: theme.palette.primary.main,
              color: "white",
              "&:hover": { bgcolor: theme.palette.primary.dark },
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
                variant="filled"
                clickable
                onClick={(e) => setCalendarAnchor(e.currentTarget)}
                icon={<CalendarTodayIcon />}
                sx={{
                  border: "none",
                  "& .MuiChip-root": {
                    border: "none"
                  }
                }}
              />
            </Box>
          </Box>
        </Box>

      </Box>

      {/* Timeline View - Input and Feed Together */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, minHeight: "60vh" }}>
        {/* Add New Entry */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <LogInput childId={currentChildId} selectedDate={selectedDate} />
          
          {/* Search Bar - inside the same card */}
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              placeholder="Search entries by text or #tags..."
              value={searchQuery}
              onChange={handleSearchChange}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={handleClearSearch}
                      edge="end"
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'transparent',
                  },
                  '&:hover fieldset': {
                    borderColor: 'grey.300',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: '1px',
                  },
                },
              }}
            />
          </Box>
        </Paper>

        {/* Timeline */}
        <DailyLogFeed
          childId={currentChildId}
          selectedDate={selectedDate}
          searchQuery={searchQuery}
          onEntriesLoad={(entryDates) => setDatesWithEntries(entryDates)}
        />
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
            slots={{
              day: CustomDay,
            }}
            sx={{
              "& .MuiPickersDay-today": {
                border: "none",
                backgroundColor: "transparent",
                color: "text.primary",
                fontWeight: "600",
                "&:hover": {
                  backgroundColor: "grey.100",
                },
              },
              "& .MuiPickersDay-root": {
                border: "none",
                "&:focus": {
                  outline: "none",
                  boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.2)",
                },
                "&.Mui-selected": {
                  backgroundColor: "grey.800",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "grey.900",
                  },
                },
              },
            }}
          />
        </LocalizationProvider>
      </Popover>
    </ResponsiveLayout>
  );
};

export default DailyLogPage;