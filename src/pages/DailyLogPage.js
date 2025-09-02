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
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            textAlign: "center",
            backgroundColor: 'background.paper',
            borderRadius: 3,
            border: '1px solid rgba(8, 31, 92, 0.08)'
          }}
        >
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
              bgcolor: '#081f5c',
              color: "white",
              boxShadow: '0px 2px 8px rgba(8, 31, 92, 0.2)',
              "&:hover": { 
                bgcolor: '#0a2270',
                transform: 'translateY(-1px)',
                boxShadow: '0px 4px 12px rgba(8, 31, 92, 0.3)'
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>

          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 0.5 }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{ fontWeight: 700 }}
              >
                📝 Daily Log
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
                  backgroundColor: '#081f5c',
                  color: 'white',
                  fontWeight: 600,
                  boxShadow: '0px 2px 6px rgba(8, 31, 92, 0.2)',
                  '&:hover': {
                    backgroundColor: '#0a2270',
                    transform: 'translateY(-1px)',
                    boxShadow: '0px 3px 8px rgba(8, 31, 92, 0.3)'
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'white'
                  }
                }}
              />
            </Box>
            <Typography variant="h6" color="text.secondary">
              {childName}
            </Typography>
          </Box>
        </Box>

      </Box>

      {/* Timeline View - Input and Feed Together */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, minHeight: "60vh" }}>
        {/* Add New Entry */}
        <Box sx={{ mb: 3 }}>
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
                backgroundColor: 'rgba(8, 31, 92, 0.02)',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(8, 31, 92, 0.12)',
                    borderWidth: '1px',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(8, 31, 92, 0.25)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#081f5c',
                    borderWidth: '2px',
                  },
                  backgroundColor: 'background.paper',
                },
              }}
            />
          </Box>
        </Box>

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
              backgroundColor: 'background.paper',
              borderRadius: 2,
              boxShadow: '0px 8px 24px rgba(8, 31, 92, 0.15)',
              "& .MuiPickersDay-today": {
                border: "2px solid #081f5c",
                backgroundColor: "transparent",
                color: "#081f5c",
                fontWeight: "700",
                "&:hover": {
                  backgroundColor: "rgba(8, 31, 92, 0.08)",
                },
              },
              "& .MuiPickersDay-root": {
                border: "none",
                color: 'text.primary',
                "&:focus": {
                  outline: "none",
                  boxShadow: "0 0 0 2px rgba(8, 31, 92, 0.3)",
                },
                "&:hover": {
                  backgroundColor: "rgba(8, 31, 92, 0.06)",
                },
                "&.Mui-selected": {
                  backgroundColor: "#081f5c",
                  color: "white",
                  fontWeight: 600,
                  "&:hover": {
                    backgroundColor: "#0a2270",
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