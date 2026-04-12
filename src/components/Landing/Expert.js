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
              One timeline for the whole village.
            </Typography>
            <Typography variant="body1" sx={expertBodyTextStyles}>
              It takes a village to raise a child, but usually, one parent is
              stuck holding all the notes. Whether it’s a grandparent helping
              out for the afternoon or a therapist at school, everyone can jot
              down a quick update in real-time.
            </Typography>
            <Typography sx={expertBodyTextStyles}>
              You’ll walk into your next appointment with the full story in your
              pocket—not buried in your memory.
            </Typography>
            <Typography sx={expertSubTitleStyles}>
              — Kalyani, Founder & Fellow Caregiver
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ExpertProgram;
