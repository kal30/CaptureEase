import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { saveFoundingFamilyEmail } from "../../services/foundingFamilyService";
import {
  landingLayout,
  landingTypography,
  landingColors,
} from "../../assets/theme/landingTheme";

const landingPrimaryButtonStyles = {
  width: { xs: "100%", sm: "auto" },
  minWidth: { xs: 0, sm: 230 },
  px: { xs: 3.5, md: 4.5 },
  py: { xs: 1.35, md: 1.45 },
  textTransform: "none",
  borderRadius: "9999px",
  fontSize: { xs: "1rem", md: "1.05rem" },
  fontWeight: 700,
  color: landingColors.deepNavy,
  backgroundColor: landingColors.cyanPop,
  boxShadow: `0 10px 22px ${landingColors.shadowHero}`,
  border: `1px solid ${landingColors.cyanPop}`,
  "&:hover": {
    backgroundColor: "#9DD4CD",
    boxShadow: `0 12px 26px ${landingColors.shadowHeroStrong}`,
  },
};

const landingSecondaryButtonStyles = {
  width: { xs: "100%", sm: "auto" },
  minWidth: { xs: 0, sm: 210 },
  px: { xs: 3.5, md: 4.5 },
  py: { xs: 1.35, md: 1.45 },
  textTransform: "none",
  borderRadius: "9999px",
  fontSize: { xs: "1rem", md: "1.05rem" },
  fontWeight: 700,
  color: landingColors.deepNavy,
  borderColor: landingColors.borderMedium,
  backgroundColor: landingColors.surface,
  boxShadow: `0 6px 16px ${landingColors.shadowSoft}`,
  "&:hover": {
    borderColor: landingColors.borderFocus,
    backgroundColor: landingColors.surfaceSoft,
    boxShadow: `0 8px 20px ${landingColors.shadowMedium}`,
  },
};

const landingFormButtonStyles = {
  width: { xs: "100%", sm: "auto" },
  whiteSpace: "nowrap",
  minWidth: { sm: 180 },
  height: 48,
  minHeight: 48,
  px: 3,
  borderRadius: "9999px",
  fontWeight: 700,
  fontSize: "1rem",
  color: landingColors.deepNavy,
  backgroundColor: landingColors.cyanPop,
  border: `1px solid ${landingColors.cyanPop}`,
  boxShadow: `0 8px 18px ${landingColors.shadowHero}`,
  "&:hover": {
    backgroundColor: "#9DD4CD",
    boxShadow: `0 10px 22px ${landingColors.shadowHeroStrong}`,
  },
};

const timelineItems = [
  {
    title: "Med: Given at breakfast",
    tone: "rgba(234, 244, 242, 0.98)",
    accent: landingColors.brandTeal,
    meta: "Caregiver • 9:00",
  },
  {
    title: "Sleep: 2h",
    tone: "rgba(244, 241, 248, 0.98)",
    accent: landingColors.brandLavender,
    meta: "Parent • 12:30",
  },
  {
    title: "Lunch: Ate well",
    tone: "rgba(247, 251, 249, 0.98)",
    accent: landingColors.brandSage,
    meta: "Caregiver • 3:00",
  },
];

const HeaderSection = () => {
  const auth = getAuth();
  const [email, setEmail] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFoundingFamilySubmit = async (event) => {
    if (event) {
      event.preventDefault();
    }

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setSubmitError("Enter an email address first.");
      setSubmitSuccess("");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");
      await saveFoundingFamilyEmail(trimmedEmail);
      setSubmitSuccess("Thanks. You're on the founding family list.");
      setEmail("");
    } catch (e) {
      setSubmitSuccess("");
      setSubmitError("Could not save your email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tryLifelogPath = auth.currentUser ? "/dashboard" : "/register";

  return (
    <Box
      sx={{
        backgroundColor: "transparent",
        position: "relative",
        mt: 0,
        ...landingLayout.heroSection.padding,
        minHeight: { xs: "auto", md: "auto", lg: "auto" },
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        maxWidth: "100%",
      }}
    >
      <Container maxWidth="xl" sx={{ maxWidth: "100%", overflow: "hidden" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.02fr 0.98fr" },
            alignItems: "start",
            gap: { xs: 4, md: 6 },
            width: "100%",
            maxWidth: 1280,
            mx: "auto",
            ...landingLayout.heroSection.container,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              ...landingLayout.heroSection.leftColumn,
              maxWidth: "100%",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                mb: 1.5,
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                px: 1.5,
                py: 0.75,
                borderRadius: "9999px",
                backgroundColor: landingColors.surfaceSoft,
                border: `1px solid ${landingColors.borderSoft}`,
                color: landingColors.supportMuted,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontSize: "0.74rem",
              }}
            >
              lifelog
            </Box>

            <Box sx={{ ...landingLayout.heroHeading, justifyContent: "flex-start" }}>
              <Typography
                sx={{
                  ...landingTypography.heroMain,
                  color: landingColors.heroText,
                  maxWidth: 760,
                  mx: 0,
                  textAlign: "left",
                }}
              >
                I have two nephews with autism. I built the app I always needed.
              </Typography>
            </Box>

            <Typography
              sx={{
                ...landingTypography.heroBody,
                maxWidth: 760,
                mt: 2,
                fontSize: { xs: "1rem", md: "1.08rem" },
                lineHeight: { xs: 1.75, md: 1.85 },
              }}
            >
              For years I scrambled to remember what happened before every therapy appointment.
              Behaviors, triggers, good days, hard days - all buried in phone notes. I built
              Lifelog so no parent has to do that anymore.
            </Typography>

            <Typography
              sx={{
                ...landingTypography.heroBody,
                maxWidth: 760,
                mt: 1.5,
                fontSize: { xs: "1rem", md: "1.08rem" },
                lineHeight: { xs: 1.75, md: 1.85 },
              }}
            >
              Everyone caring for your child sees the same timeline in real time. A caregiver logs
              a meltdown at 1 PM. You see it before the 2 PM appointment. The therapist walks in
              already knowing.
            </Typography>

            <Typography
              sx={{
                ...landingTypography.heroBody,
                maxWidth: 760,
                mt: 1.5,
                fontWeight: 700,
                fontSize: { xs: "1rem", md: "1.08rem" },
              }}
            >
              No more "I didn't know that happened."
            </Typography>

            <Box
              sx={{
                mt: { xs: 3, md: 3.5 },
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: { xs: "center", md: "flex-start" },
                gap: 1.5,
                width: "100%",
                maxWidth: { xs: "100%", md: 540 },
              }}
            >
              <Button
                component={RouterLink}
                to={tryLifelogPath}
                variant="contained"
                sx={landingPrimaryButtonStyles}
              >
                Start Tracking Free
              </Button>
              <Button
                component={RouterLink}
                to="/#how-it-works"
                variant="outlined"
                sx={landingSecondaryButtonStyles}
              >
                See How It Works
              </Button>
            </Box>

            <Box
              component="form"
              onSubmit={handleFoundingFamilySubmit}
              sx={{
                mt: { xs: 4, md: 5 },
                display: "flex",
                flexDirection: "column",
                gap: 1,
                width: "100%",
                maxWidth: { xs: "100%", md: 420 },
              }}
            >
              {submitSuccess && <Alert severity="success">{submitSuccess}</Alert>}
              {submitError && <Alert severity="error">{submitError}</Alert>}
              <Divider
                sx={{
                  width: "100%",
                  color: landingColors.textSoft,
                  "&::before, &::after": {
                    borderColor: landingColors.borderMedium,
                  },
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    fontSize: "0.82rem",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: landingColors.textMuted,
                  }}
                >
                  Or join the founding family list
                </Typography>
              </Divider>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: "stretch",
                  gap: 1,
                }}
              >
                <TextField
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  fullWidth
                  size="small"
                  variant="outlined"
                  InputProps={{
                    sx: {
                      backgroundColor: landingColors.surfaceTint,
                      borderRadius: 0,
                      height: 48,
                      minHeight: 48,
                      fontSize: "1rem",
                      "& fieldset": {
                        borderRadius: 0,
                        borderColor: landingColors.borderStrong,
                      },
                      "&:hover fieldset": {
                        borderColor: landingColors.borderFocus,
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: landingColors.borderActive,
                        borderWidth: "1px",
                      },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  type="submit"
                  disabled={isSubmitting}
                  sx={landingFormButtonStyles}
                >
                  {isSubmitting ? "Joining..." : "Add Email"}
                </Button>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              ...landingLayout.heroSection.rightColumn,
              position: "relative",
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              mt: { xs: 0.5, md: 0.8 },
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: { xs: 580, md: 700, lg: 760 },
                zIndex: 1,
              }}
            >
              <Paper
                sx={{
                  p: { xs: 2.5, md: 3.25 },
                  borderRadius: { xs: "28px", md: "34px" },
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(243,247,245,0.9) 100%)",
                  border: `1px solid ${landingColors.borderSoft}`,
                  boxShadow: `0 18px 42px ${landingColors.shadowMedium}`,
                  overflow: "hidden",
                }}
                elevation={0}
              >
                <Stack
                  spacing={{ xs: 2.25, md: 2.75 }}
                  sx={{
                    alignItems: "center",
                    textAlign: "center",
                    py: { xs: 0.5, md: 1 },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: "0.8rem", md: "0.85rem" },
                      letterSpacing: "0.24em",
                      textTransform: "uppercase",
                      color: landingColors.textMuted,
                      fontWeight: 700,
                    }}
                  >
                    From notes to insights
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: { xs: "1.02rem", md: "1.12rem" },
                      color: landingColors.bodyText,
                      maxWidth: 920,
                    }}
                  >
                    The whole care team logs notes, all neatly organized in one shared timeline.
                  </Typography>

                  <Box
                    sx={{
                      width: "100%",
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr auto 1fr" },
                      alignItems: "center",
                      gap: { xs: 2.5, md: 3.5 },
                      mt: { xs: 0.5, md: 1 },
                    }}
                  >
                    <Paper
                      sx={{
                        position: "relative",
                        minHeight: { xs: 320, md: 440 },
                        borderRadius: "30px",
                        border: `1px solid rgba(199, 217, 196, 0.82)`,
                        background:
                          "linear-gradient(180deg, rgba(239, 245, 241, 0.98) 0%, rgba(248, 250, 248, 0.98) 100%)",
                        overflow: "hidden",
                        p: { xs: 2.5, md: 3.5 },
                        boxShadow: `0 14px 28px ${landingColors.shadowSoft}`,
                        transform: { xs: "none", md: "rotate(-1deg)" },
                      }}
                      elevation={0}
                    >
                      <Typography
                        sx={{
                          fontSize: { xs: "0.82rem", md: "0.86rem" },
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                          color: landingColors.textMuted,
                          fontWeight: 700,
                          mb: 2,
                        }}
                      >
                        Care Team Note
                      </Typography>

                      <Box
                        sx={{
                          borderRadius: "24px",
                          backgroundColor: "rgba(255,255,255,0.86)",
                          border: `1px solid rgba(226, 232, 240, 0.9)`,
                          p: { xs: 2.25, md: 2.75 },
                          boxShadow: `0 10px 22px ${landingColors.shadowSoft}`,
                          transform: { xs: "none", md: "rotate(-1.8deg)" },
                          maxWidth: 470,
                          mx: "auto",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: { xs: "0.95rem", md: "1rem" },
                            fontWeight: 700,
                            color: landingColors.deepNavy,
                            mb: 1.5,
                            textAlign: "left",
                          }}
                        >
                          From notes to clarity
                        </Typography>
                        <Box
                          sx={{
                            textAlign: "left",
                            color: landingColors.bodyText,
                            fontSize: { xs: "0.98rem", md: "1.03rem" },
                            lineHeight: 1.9,
                            fontFamily:
                              "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                            pr: 1,
                          }}
                        >
                          <Typography sx={{ fontSize: "inherit", lineHeight: "inherit", mb: 0.75 }}>
                            • 9 am: Gave meds
                          </Typography>
                          <Typography sx={{ fontSize: "inherit", lineHeight: "inherit", mb: 0.75 }}>
                            • Breakfast: Ate well
                          </Typography>
                          <Typography sx={{ fontSize: "inherit", lineHeight: "inherit", mb: 0.75 }}>
                            • Slept 2 hrs
                          </Typography>
                          <Typography sx={{ fontSize: "inherit", lineHeight: "inherit" }}>
                            • Mood: Happy
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>

                    <Box
                      sx={{
                        display: { xs: "none", md: "flex" },
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: 72,
                      }}
                    >
                      <Box
                        sx={{
                          width: 92,
                          height: 92,
                          borderRadius: "50%",
                          border: `1px solid rgba(143, 201, 192, 0.28)`,
                          background:
                            "radial-gradient(circle at 35% 35%, rgba(143, 201, 192, 0.28), transparent 52%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: landingColors.supportMuted,
                          fontSize: "2.25rem",
                          transform: "rotate(-10deg)",
                        }}
                      >
                        →
                      </Box>
                    </Box>

                    <Paper
                      sx={{
                        position: "relative",
                        minHeight: { xs: 360, md: 440 },
                        borderRadius: "34px",
                        border: `1px solid rgba(226, 232, 240, 0.95)`,
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(243,247,245,0.98) 100%)",
                        overflow: "hidden",
                        p: { xs: 1.5, md: 2 },
                        boxShadow: `0 16px 34px ${landingColors.shadowMedium}`,
                      }}
                      elevation={0}
                    >
                      <Box
                        sx={{
                          borderRadius: "30px",
                          overflow: "hidden",
                          minHeight: { xs: 330, md: 400 },
                          background:
                            "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(243,247,245,0.98) 100%)",
                          border: `1px solid rgba(199, 217, 196, 0.68)`,
                        }}
                      >
                        <Box
                          sx={{
                            height: 44,
                            background:
                              "linear-gradient(180deg, rgba(143, 201, 192, 0.72) 0%, rgba(199, 217, 196, 0.92) 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: landingColors.deepNavy,
                            fontSize: "1rem",
                            fontWeight: 700,
                          }}
                        >
                          lifelog
                        </Box>
                        <Box sx={{ px: 2, py: 2 }}>
                          <Typography
                            sx={{
                              fontSize: "0.82rem",
                              letterSpacing: "0.12em",
                              textTransform: "uppercase",
                              color: landingColors.textMuted,
                              fontWeight: 700,
                              mb: 0.75,
                            }}
                          >
                            Timeline
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 1.35,
                            }}
                          >
                            {timelineItems.map((item) => (
                              <Box
                                key={item.title}
                                sx={{
                                  borderRadius: "18px",
                                  backgroundColor: item.tone,
                                  border: `1px solid rgba(226, 232, 240, 0.92)`,
                                  overflow: "hidden",
                                }}
                              >
                                <Box
                                  sx={{
                                    height: 6,
                                    backgroundColor: item.accent,
                                  }}
                                />
                                <Box sx={{ px: 1.75, py: 1.55 }}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      gap: 2,
                                      mb: 0.65,
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        fontSize: "0.82rem",
                                        fontWeight: 700,
                                        color: landingColors.textMuted,
                                      }}
                                    >
                                      {item.meta}
                                    </Typography>
                                    <Typography
                                      sx={{
                                        fontSize: "0.9rem",
                                        color: landingColors.textMuted,
                                      }}
                                    >
                                      ◔
                                    </Typography>
                                  </Box>
                                  <Typography
                                    sx={{
                                      fontSize: "1rem",
                                      fontWeight: 700,
                                      color: landingColors.deepNavy,
                                      lineHeight: 1.3,
                                    }}
                                  >
                                    {item.title}
                                  </Typography>
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  </Box>
                </Stack>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HeaderSection;
