import React from "react";
import { Box, Typography, Avatar, Button } from "@mui/material";
import { GradientButton, ThemeSpacing } from "../UI";
import { PRODUCT_NAME } from "../../constants/config";
import {
  expertSectionStyles,
  expertCardStyles,
  expertLeftColumnStyles,
  expertTitleStyles,
  expertBodyTextStyles,
  expertCtaButtonStyles,
  expertSubTitleStyles,
} from "../../assets/theme/expertTheme";

const ExpertProgram = () => {
  return (
    <Box sx={expertSectionStyles}>
      <Box sx={expertCardStyles}>
        {/* Left Side: Text */}
        <Box
          sx={{
            backgroundColor: "#D6E8EE",
            borderRadius: "16px",
            padding: "24px",
          }}
        >
          <Box sx={expertLeftColumnStyles}>
            <Typography variant="h2" sx={expertTitleStyles}>
              Real-World Results with Personalized Digital Care
            </Typography>
            <Typography sx={expertSubTitleStyles}>
              Built with love for families, caregivers, and anyone who deserve
              better care tools.
            </Typography>
            <Typography variant="body1" sx={expertBodyTextStyles}>
              🩺 Healthcare professionals and families report that digital care
              tools improve coordination; a 2022 AMA survey found{" "}
              <strong>78%</strong> of clinicians saw better care outcomes.
            </Typography>
            <Typography sx={expertBodyTextStyles}>
              🎥 Multimedia logging (voice, photo, video) improves communication
              between caregivers, families, and clinicians. Research in JMIR
              reports up to a <strong>65%</strong> improvement in care
              effectiveness.
            </Typography>
            <Typography sx={expertBodyTextStyles}>
              💡 Reducing administrative burden by <strong>20%+</strong>{" "}
              improves both care quality and caregiver well-being, according to
              a 2023 WHO report.
            </Typography>
            <Typography sx={expertBodyTextStyles}>
              Tools like <strong>{PRODUCT_NAME}</strong> can help achieve these
              benefits by making it easy to log, share, and review important
              updates in one place—streamlining communication and improving care
              coordination.
            </Typography>
            <Button variant="text" sx={expertSubTitleStyles}>
              See How CaptureEase Works &rarr;
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ExpertProgram;
