import React from "react";
import { IconButton, Box, Typography } from "@mui/material";
import { ArrowBack, ArrowForward, Today } from "@mui/icons-material";

const CalendarToolbar = (props) => {
  const { label } = props;

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
      <IconButton onClick={goToToday}>
        <Today />
      </IconButton>

      {/* Month Label */}
      <Typography variant="h6">{label}</Typography>

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
