import React from "react";
import { Box, Typography } from "@mui/material";
import {
  expertSectionStyles,
  expertCardStyles,
  expertLeftColumnStyles,
  expertTitleStyles,
  expertBodyTextStyles,
  expertSubTitleStyles,
} from "../../assets/theme/expertTheme";

const ExpertProgram = () => {
  return (
    <Box sx={expertSectionStyles}>
      <Box sx={expertCardStyles}>
        <Box>
          <Box sx={expertLeftColumnStyles}>
            <Typography variant="h2" sx={expertTitleStyles}>
              I have two nephews with autism. I built the app I always needed.
            </Typography>
            <Typography variant="body1" sx={expertBodyTextStyles}>
              For years I scrambled to remember what happened before every
              therapy appointment. Behaviors, triggers, good days, hard days —
              all buried in phone notes.
            </Typography>
            <Typography sx={expertBodyTextStyles}>
              Everyone caring for your child sees the same timeline in real
              time. A caregiver logs a meltdown at 1 PM. You see it before the
              2 PM appointment. The therapist walks in already knowing.
            </Typography>
            <Typography sx={expertBodyTextStyles}>
              No more “I didn’t know that happened.”
            </Typography>
            <Typography sx={expertSubTitleStyles}>
              Kalyani, founder and autism mom
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ExpertProgram;
