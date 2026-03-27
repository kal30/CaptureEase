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
        {/* Left Side: Text */}
        <Box>
          <Box sx={expertLeftColumnStyles}>
            <Typography variant="h2" sx={expertTitleStyles}>
              The Moment I Knew I Needed Something Better
            </Typography>
            <Typography variant="body1" sx={expertBodyTextStyles}>
              There was a day things escalated so badly I knew something had to
              change.
            </Typography>
            <Typography sx={expertBodyTextStyles}>
              Afterwards, sitting with his therapist, I couldn't answer the
              most basic questions. When did this pattern start? What happened
              the three days before? Were there warning signs?
            </Typography>
            <Typography sx={expertBodyTextStyles}>
              I had nothing. No record. No timeline. Just guilt and exhaustion.
            </Typography>
            <Typography sx={expertBodyTextStyles}>
              That day I realized scattered notes on my phone weren't enough.
              My nephews needed me to be their memory — organized, clear, and
              ready to share with every doctor, therapist, and teacher trying
              to help them.
            </Typography>
            <Typography sx={expertBodyTextStyles}>
              That's why I built CaptureEz.
            </Typography>
            <Typography sx={expertSubTitleStyles}>
              — Kalyani, founder and autism mom
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ExpertProgram;
