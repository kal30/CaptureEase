import React from "react";
import {
  IconButton,
  Box,
  Typography,
  ButtonGroup,
  Button,
} from "@mui/material";
import { ArrowBack, ArrowForward, Today } from "@mui/icons-material";

const CalendarToolbar = (props) => {
  const { label, views, onView, view } = props;

  const goToBack = () => {
    props.onNavigate("PREV");
  };

  const goToNext = () => {
    props.onNavigate("NEXT");
  };

  const goToToday = () => {
    props.onNavigate("TODAY");
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      mb={2}
    >
      {/* Today Button */}
      {views.length > 1 && (
        <IconButton onClick={goToToday}>
          <Today />
        </IconButton>
      )}

      {/* Always show the month label */}
      <Typography variant="h6">{label}</Typography>

      {/* View Switcher */}
      {views.length > 1 && (
        <ButtonGroup variant="outlined">
          {views.includes("month") && (
            <Button
              onClick={() => onView("month")}
              variant={view === "month" ? "contained" : "outlined"}
            >
              Month
            </Button>
          )}
          {views.includes("week") && (
            <Button
              onClick={() => onView("week")}
              variant={view === "week" ? "contained" : "outlined"}
            >
              Week
            </Button>
          )}
          {views.includes("day") && (
            <Button
              onClick={() => onView("day")}
              variant={view === "day" ? "contained" : "outlined"}
            >
              Day
            </Button>
          )}
          {views.includes("agenda") && (
            <Button
              onClick={() => onView("agenda")}
              variant={view === "agenda" ? "contained" : "outlined"}
            >
              Agenda
            </Button>
          )}
        </ButtonGroup>
      )}

      {/* Navigation Buttons */}
      <Box>
        <IconButton onClick={goToBack}>
          <ArrowBack />
        </IconButton>
        <IconButton onClick={goToNext}>
          <ArrowForward />
        </IconButton>
      </Box>
    </Box>
  );
};

export default CalendarToolbar;
