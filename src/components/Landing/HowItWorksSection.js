import React from "react";
import { Box, Container, Paper, Typography } from "@mui/material";
import {
  Assignment as AssignmentIcon,
  EditNote as EditNoteIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";
import { landingColors } from "../../assets/theme/landingTheme";

const FEATURE_CARDS = [
  {
    icon: EditNoteIcon,
    title: "Log in seconds",
    description: "Capture what happened without breaking your flow.",
    bg: "rgba(199, 217, 196, 0.38)",
  },
  {
    icon: TimelineIcon,
    title: "See patterns emerge",
    description: "Understand triggers and trends over time.",
    bg: "rgba(143, 201, 192, 0.24)",
  },
  {
    icon: AssignmentIcon,
    title: "Walk in prepared",
    description: "Share clear timelines with your care team.",
    bg: "rgba(217, 209, 238, 0.38)",
  },
];

const HowItWorksSection = () => {
  return (
    <Box
      id="how-it-works"
      data-cy="landing-how-it-works"
      sx={{ px: { xs: 2, md: 3 }, py: { xs: 4, md: 5 }, scrollMarginTop: 96 }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: { xs: 2.5, md: 3.5 } }}>
          <Typography
            sx={{
              fontSize: { xs: "0.76rem", md: "0.8rem" },
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: landingColors.cyanPop,
              textAlign: "center",
              mx: "auto",
              mb: 1.5,
            }}
          >
            Built for the real moments of caregiving.
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: "1.65rem", md: "2.05rem" },
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: landingColors.heroText,
              maxWidth: 720,
              mx: "auto",
            }}
          >
            A calmer workflow for people who need the full picture fast.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(3, minmax(0, 1fr))",
            },
            gap: { xs: 1.5, md: 2.25 },
            alignItems: "stretch",
          }}
        >
          {FEATURE_CARDS.map((card, index) => (
            <Paper
              key={card.title}
              elevation={0}
              sx={{
                minHeight: 182,
                p: 3,
                borderRadius: "24px",
                border: `1px solid ${
                  index === 1 ? "rgba(143, 201, 192, 0.28)" : landingColors.borderLight
                }`,
                backgroundColor: card.bg,
                color: landingColors.bodyText,
                boxShadow: `0 8px 24px ${landingColors.shadowSoft}`,
              }}
            >
              <Box
                sx={{
                  mb: 1.5,
                  width: 52,
                  height: 52,
                  borderRadius: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: landingColors.surfaceTint,
                  boxShadow: `0 4px 12px ${landingColors.shadowSoft}`,
                }}
              >
                <card.icon sx={{ fontSize: 30, color: landingColors.heroText }} />
              </Box>
              <Typography
                sx={{
                  fontSize: { xs: "1.02rem", md: "1.08rem" },
                  fontWeight: 700,
                  color: landingColors.heroText,
                  mb: 0.75,
                }}
              >
                {card.title}
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: "0.95rem", md: "1rem" },
                  lineHeight: 1.7,
                  color: landingColors.bodyText,
                }}
              >
                {card.description}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default HowItWorksSection;
