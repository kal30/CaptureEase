import React from "react";
import { Box, Container, Paper, Typography } from "@mui/material";
import {
  Assignment as AssignmentIcon,
  EditNote as EditNoteIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";
import {
  landingColors,
} from "../../assets/theme/landingTheme";

const STEPS = [
  {
    icon: EditNoteIcon,
    title: "Log in seconds",
    body: "Type a note, pick a category, done. No forms to fill.",
  },
  {
    icon: TimelineIcon,
    title: "See patterns emerge",
    body: "A timeline shows what happened, when, and how often.",
  },
  {
    icon: AssignmentIcon,
    title: "Walk in prepared",
    body: "Share a date-range report with your therapist before every session.",
  },
];

const HowItWorksSection = () => {
  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 4, md: 5 } }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: { xs: 2.5, md: 3.5 } }}>
          <Typography
            sx={{
              fontSize: "1.1rem",
              fontWeight: 500,
              color: landingColors.textMuted,
              textAlign: "center",
              mx: "auto",
              mb: 4,
            }}
          >
            Built for the real moments of caregiving.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            flexWrap: "wrap",
            gap: { xs: 1.5, md: 2 },
            alignItems: "stretch",
          }}
        >
          {STEPS.map((step) => (
            <Paper
              key={step.title}
              elevation={0}
              sx={{
                flex: 1,
                minWidth: 240,
                p: 3,
                borderRadius: 1.5,
                border: `1px solid ${landingColors.borderLight}`,
                backgroundColor: landingColors.surface,
                color: landingColors.bodyText,
              }}
            >
              <Box sx={{ mb: 1.5 }}>
                <step.icon sx={{ fontSize: 40, color: landingColors.quoteBadge }} />
              </Box>
              <Typography
                sx={{
                  fontSize: { xs: "1.02rem", md: "1.08rem" },
                  fontWeight: 800,
                  color: landingColors.brandAccent,
                  mb: 0.75,
                }}
              >
                {step.title}
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: "0.95rem", md: "1rem" },
                  lineHeight: 1.65,
                  color: landingColors.bodyText,
                }}
              >
                {step.body}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default HowItWorksSection;
