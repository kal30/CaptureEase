import React, { useState } from "react";
import {
  Alert,
  Box,
  Container,
  Divider,
  TextField,
  Typography,
  Button,
  Paper,
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
      setSubmitSuccess("Thanks. You’re on the founding family list.");
      setEmail("");
    } catch (e) {
      setSubmitSuccess("");
      setSubmitError("Could not save your email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tryLifelogPath = auth.currentUser ? "/dashboard" : "/register";

  const previewSlots = [
    {
      title: "Screenshot 1",
      subtitle: "Timeline / daily log view",
      border: "rgba(143, 201, 192, 0.72)",
      tint: "rgba(234, 244, 242, 0.58)",
    },
    {
      title: "Screenshot 2",
      subtitle: "Pattern / report / sharing view",
      border: "rgba(217, 209, 238, 0.78)",
      tint: "rgba(244, 241, 248, 0.76)",
    },
  ];

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
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            justifyContent: { xs: "center", md: "space-between" },
            ...landingLayout.heroSection.container,
            maxWidth: "100%",
            overflow: "hidden",
          }}
        >
          {/* Left Side - Text */}
          <Box
            sx={{
              ...landingLayout.heroSection.leftColumn,
              maxWidth: "100%",
              overflow: "hidden",
            }}
          >
            {/* Hero Heading */}
            <Box sx={landingLayout.heroHeading}>
              <Typography
                sx={{
                  ...landingTypography.heroMain,
                  color: landingColors.heroText,
                }}
              >
                Track behaviors. Spot patterns. Walk into every session prepared.
              </Typography>
            </Box>

            <Typography sx={landingTypography.heroBody}>
              Built by someone who lived the chaos of trying to remember what
              happened before every appointment.
            </Typography>

            <Typography sx={landingTypography.heroBody}>
              Everyone caring for your child sees the same timeline in real
              time. A caregiver logs a meltdown at 1 PM. You see it before the
              2 PM appointment. The therapist walks in already knowing.
            </Typography>

            <Typography sx={landingTypography.heroBody}>
              No more “I didn’t know that happened.”
            </Typography>

            <Box
              sx={{
                mt: { xs: 2.5, md: 3 },
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: { xs: "center", md: "flex-start" },
                gap: 1.5,
                width: "100%",
                maxWidth: { xs: "100%", md: 520 },
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
                mx: { xs: "auto", md: 0 },
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

          {/* Right Side - Preview Card */}
          <Box
            sx={{
              ...landingLayout.heroSection.rightColumn,
              position: "relative",
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              mt: { xs: 4, md: 0 },
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: { xs: 380, md: 430, lg: 520, xl: 600 },
                zIndex: 1,
              }}
            >
              <Paper
                sx={{
                  p: { xs: 2.5, md: 3 },
                  borderRadius: "28px",
                  backgroundColor: landingColors.surfaceTint,
                  border: `1px solid ${landingColors.borderSoft}`,
                  boxShadow: `0 18px 38px ${landingColors.shadowMedium}`,
                }}
                elevation={0}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1.75,
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontSize: { xs: "0.78rem", md: "0.82rem" },
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: landingColors.textMuted,
                        fontWeight: 700,
                        mb: 0.35,
                      }}
                    >
                      App Preview
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: { xs: "1.35rem", md: "1.65rem" },
                        fontWeight: 700,
                        color: landingColors.heroText,
                        letterSpacing: "-0.03em",
                      }}
                    >
                      lifelog in action
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      px: 1.75,
                      py: 0.75,
                      borderRadius: "9999px",
                      backgroundColor: "rgba(217, 209, 238, 0.55)",
                      color: landingColors.midNavy,
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Replace with screenshots
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 1.5,
                  }}
                >
                  {previewSlots.map((slot) => (
                    <Box
                      key={slot.title}
                      sx={{
                        border: `2px dashed ${slot.border}`,
                        borderRadius: "24px",
                        backgroundColor: slot.tint,
                        p: 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          minHeight: 260,
                          borderRadius: "20px",
                          backgroundColor: landingColors.surfaceTint,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                          px: 2,
                        }}
                      >
                        <Box>
                          <Typography
                            sx={{
                              fontSize: { xs: "1rem", md: "1.05rem" },
                              fontWeight: 700,
                              color: landingColors.midNavy,
                              mb: 0.75,
                            }}
                          >
                            {slot.title}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: { xs: "0.92rem", md: "0.98rem" },
                              color: landingColors.textMuted,
                              lineHeight: 1.6,
                            }}
                          >
                            {slot.subtitle}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>

                <Box
                  sx={{
                    mt: 1.5,
                    borderRadius: "22px",
                    border: `1px solid rgba(199, 217, 196, 0.8)`,
                    backgroundColor: "rgba(247, 251, 249, 0.95)",
                    px: 2,
                    py: 1.75,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: "0.95rem", md: "1rem" },
                      lineHeight: 1.7,
                      color: landingColors.bodyText,
                    }}
                  >
                    Add actual product screenshots here. Best choices: one screen
                    that shows quick event logging, and one that shows timeline,
                    trends, or therapist-sharing context.
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HeaderSection;
