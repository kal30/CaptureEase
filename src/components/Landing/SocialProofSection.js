import React from "react";
import { Box, Container, Paper, Typography } from "@mui/material";
import { landingColors } from "../../assets/theme/landingTheme";

const founderStoryParagraphs = [
  "It takes a village to raise a child, but usually, one parent is stuck holding all the notes. Whether it’s a grandparent helping out for the afternoon or a therapist at school, everyone can jot down a quick update in real-time.",
  "You’ll walk into your next appointment with the full story in your pocket—not buried in your memory.",
];

const SocialProofSection = () => {
  return (
    <Box data-cy="landing-social-proof" sx={{ px: { xs: 2, md: 3 }, py: { xs: 3, md: 4 } }}>
      <Container maxWidth="xl">
        <Paper
          elevation={0}
          sx={{
            borderRadius: { xs: "28px", md: "34px" },
            border: `1px solid rgba(217, 209, 238, 0.85)`,
            background: `linear-gradient(180deg, ${landingColors.panelSoft} 0%, ${landingColors.surface} 100%)`,
            boxShadow: `0 10px 30px ${landingColors.shadowPanel}`,
          }}
        >
          <Box sx={{ px: { xs: 3, sm: 4, md: 6 }, py: { xs: 4, sm: 5, md: 7 } }}>
            <Box sx={{ maxWidth: 1100, mx: "auto" }}>
              <Typography
                sx={{
                  fontSize: { xs: "1.95rem", sm: "2.35rem", md: "3rem" },
                  lineHeight: 1.1,
                  letterSpacing: "-0.04em",
                  fontWeight: 700,
                  color: landingColors.heroText,
                  maxWidth: { xs: "100%", md: 760 },
                  mb: { xs: 2.5, md: 3 },
                }}
              >
                One timeline for the whole village.
              </Typography>

              <Box
                sx={{
                  maxWidth: { xs: "100%", md: 920 },
                  color: landingColors.bodyText,
                  fontSize: { xs: "1rem", md: "1.08rem" },
                  lineHeight: { xs: 1.85, md: 1.9 },
                }}
              >
                {founderStoryParagraphs.map((paragraph) => (
                  <Typography
                    key={paragraph}
                    component="p"
                    sx={{
                  mb: 2.5,
                  fontSize: "inherit",
                  lineHeight: "inherit",
                  color: "inherit",
                  maxWidth: "100%",
                }}
              >
                {paragraph}
              </Typography>
              ))}
              </Box>

              <Typography
                sx={{
                  mt: { xs: 4, md: 5 },
                  fontSize: { xs: "0.84rem", md: "0.92rem" },
                  letterSpacing: "0.14em",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  color: "#7C6AAE",
                }}
              >
                — Kalyani, Founder & Fellow Caregiver
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default SocialProofSection;
