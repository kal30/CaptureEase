import React from "react";
import { Box, Container, Paper, Typography } from "@mui/material";
import {
  landingColors,
  landingTypography,
} from "../../assets/theme/landingTheme";

const SocialProofSection = () => {
  return (
    <Box sx={{ px: { xs: 2, md: 3 }, pb: { xs: 4, md: 5 } }}>
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            position: "relative",
            p: { xs: "32px 24px", md: "32px 40px" },
            borderRadius: "28px",
            border: `1px solid ${landingColors.borderSoft}`,
            backgroundColor: landingColors.surfaceSoft,
            boxShadow: `0 8px 24px ${landingColors.shadowSoft}`,
            textAlign: "center",
          }}
        >
          <Typography
            aria-hidden="true"
            sx={{
              position: "absolute",
              top: 8,
              left: 20,
              fontSize: "80px",
              color: landingColors.quoteBadge,
              opacity: 0.15,
              lineHeight: 1,
              pointerEvents: "none",
            }}
          >
            "
          </Typography>
          <Typography
            sx={{
              ...landingTypography.heroBody,
              mt: 0,
              maxWidth: "none",
              mx: "auto",
              fontSize: { xs: "1rem", md: "1.08rem" },
              color: landingColors.brandAccent,
              fontWeight: 500,
            }}
          >
            “We finally have one place to keep track of what happened, and it
            helps us walk into therapy prepared.”
          </Typography>
          <Typography
            sx={{
              mt: 1.25,
              fontSize: { xs: "0.88rem", md: "0.95rem" },
              color: landingColors.textMuted,
              fontWeight: 700,
            }}
          >
            Parent of child with autism, beta user
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default SocialProofSection;
