import React, { useState } from "react";
import {
  Typography,
  Box,
  Button,
  Paper,
  Chip,
  IconButton,
  Popover,
  TextField,
  InputAdornment,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { useChildContext } from "../contexts/ChildContext";
import { useRole } from "../contexts/RoleContext";
import useChildName from "../hooks/useChildName";
import { therapyTheme, createTherapyStyles } from "../assets/theme/therapyTheme";
import ResponsiveLayout from "../components/Layout/ResponsiveLayout";
import TherapyNoteInput from "../components/TherapyNotes/TherapyNoteInput";
import UnifiedTimeline from "../components/Timeline/UnifiedTimeline";

const TherapyNotesPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { currentChildId } = useChildContext();
  const { getUserRoleForChild, USER_ROLES } = useRole();
  const {
    childName,
    loading: childNameLoading,
    error,
  } = useChildName(currentChildId);

  const [calendarAnchor, setCalendarAnchor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [datesWithEntries, setDatesWithEntries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const therapyStyles = createTherapyStyles(theme);

  // Check if user is therapist for this child
  const userRole = getUserRoleForChild(currentChildId);
  const isTherapist = userRole === USER_ROLES.THERAPIST;

  const pageTitle = childName ? `Therapy Notes - ${childName}` : "Therapy Notes";


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
              backgroundColor: therapyTheme.primary,
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

  // Loading state
  if (childNameLoading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>Error: {error.message}</Typography>;

  // No child selected
  if (!currentChildId) {
    return (
      <ResponsiveLayout pageTitle="Therapy Notes">
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
          <Typography color="text.secondary">
            Please select a child from the dashboard to access therapy notes.
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

  // Role check - only therapists can access
  if (!isTherapist) {
    return (
      <ResponsiveLayout pageTitle="Therapy Notes">
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
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Access Restricted
            </Typography>
            <Typography color="text.secondary">
              Therapy notes are only accessible to users with therapist role.
            </Typography>
          </Alert>
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

  // Timeline filters to show only therapy notes
  const timelineFilters = {
    entryTypes: ['therapyNote'],
    searchText: searchQuery
  };

  return (
    <ResponsiveLayout pageTitle={pageTitle}>
      {/* Enhanced Header with Navigation */}
      <Box sx={{ mb: 3 }}>
        {/* Page Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <IconButton
            onClick={handleBackToDashboard}
            sx={{
              bgcolor: therapyTheme.primary,
              color: "text.primary",
              boxShadow: `0px 2px 8px ${therapyTheme.primary}40`,
              "&:hover": { 
                bgcolor: therapyTheme.dark,
                transform: 'translateY(-1px)',
                boxShadow: `0px 4px 12px ${therapyTheme.primary}60`
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
                🩺 Therapy Notes
              </Typography>
              <Chip
                label={selectedDate.toLocaleDateString()}
                size="small"
                clickable
                onClick={(e) => setCalendarAnchor(e.currentTarget)}
                icon={<CalendarTodayIcon />}
                sx={{
                  backgroundColor: therapyTheme.primary,
                  color: 'text.primary',
                  fontWeight: 600,
                  boxShadow: `0px 2px 6px ${therapyTheme.primary}40`,
                  '&:hover': {
                    backgroundColor: therapyTheme.dark,
                    transform: 'translateY(-1px)',
                    boxShadow: `0px 3px 8px ${therapyTheme.primary}60`
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'text.primary'
                  }
                }}
              />
            </Box>
            <Typography variant="h6" color="text.secondary">
              Professional Notes • {childName}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Content Area */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, minHeight: "60vh" }}>
        {/* Add New Therapy Note */}
        <Box sx={{ mb: 3 }}>
          <TherapyNoteInput childId={currentChildId} selectedDate={selectedDate} />
          
          {/* Search Bar */}
          <Box sx={{ mt: 2, ...therapyStyles.input }}>
            <TextField
              fullWidth
              placeholder="Search therapy notes by content, title, or tags..."
              value={searchQuery}
              onChange={handleSearchChange}
              variant="outlined"
              size="medium"
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
            />
          </Box>
        </Box>

        {/* Timeline - Show only therapy notes */}
        <UnifiedTimeline
          child={{ id: currentChildId, name: childName }}
          selectedDate={selectedDate}
          filters={timelineFilters}
          showFilters={false}
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
              boxShadow: `0px 8px 24px ${therapyTheme.primary}30`,
              "& .MuiPickersDay-today": {
                border: `2px solid ${therapyTheme.primary}`,
                backgroundColor: "transparent",
                color: therapyTheme.dark,
                fontWeight: "700",
                "&:hover": {
                  backgroundColor: therapyTheme.light,
                },
              },
              "& .MuiPickersDay-root": {
                border: "none",
                color: 'text.primary',
                "&:focus": {
                  outline: "none",
                  boxShadow: `0 0 0 2px ${therapyTheme.primary}60`,
                },
                "&:hover": {
                  backgroundColor: therapyTheme.light,
                },
                "&.Mui-selected": {
                  backgroundColor: therapyTheme.primary,
                  color: "text.primary",
                  fontWeight: 600,
                  "&:hover": {
                    backgroundColor: therapyTheme.dark,
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

export default TherapyNotesPage;