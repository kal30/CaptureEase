import React, { useState } from "react";
import { Alert, Box, Container, Divider, TextField, Typography, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { getAuth } from "firebase/auth";
import landingImage from "../../assets/image/landing/landingimageRealisitic4.jpg";
import { GradientButton, ThemeSpacing } from "../UI";
import { saveFoundingFamilyEmail } from "../../services/foundingFamilyService";
import {
  landingLayout,
  landingTypography,
  landingColors,
} from "../../assets/theme/landingTheme";

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
            <Typography
              sx={{
                fontSize: { xs: "0.76rem", md: "0.8rem" },
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: landingColors.cyanPop,
                textAlign: { xs: "center", md: "left" },
                mb: 1.25,
              }}
            >
              caregiver-first timeline tracking
            </Typography>

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
              <GradientButton
                component={RouterLink}
                to={tryLifelogPath}
                variant="gradient"
                color="primary"
                size="large"
                elevated
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  minWidth: { xs: 0, sm: 220 },
                  px: { xs: 3.5, md: 4 },
                  py: { xs: 1.2, md: 1.4 },
                  textTransform: "none",
                  borderRadius: "16px",
                  fontSize: { xs: "1rem", md: "1.05rem" },
                  boxShadow: `0 10px 22px ${landingColors.shadowHero}`,
                  backgroundColor: landingColors.cyanPop,
                }}
              >
                Start Tracking Free
              </GradientButton>
              <Button
                component={RouterLink}
                to="/#how-it-works"
                variant="outlined"
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  minWidth: { xs: 0, sm: 190 },
                  px: { xs: 3.5, md: 4 },
                  py: { xs: 1.2, md: 1.35 },
                  textTransform: "none",
                  borderRadius: "16px",
                  fontSize: { xs: "1rem", md: "1.05rem" },
                  fontWeight: 600,
                  color: landingColors.heroText,
                  borderColor: landingColors.borderMedium,
                  backgroundColor: landingColors.surface,
                  boxShadow: `0 4px 12px ${landingColors.shadowSoft}`,
                  "&:hover": {
                    borderColor: landingColors.borderFocus,
                    backgroundColor: landingColors.surfaceSoft,
                  },
                }}
              >
                See How It Works
              </Button>
            </Box>

            <ThemeSpacing variant="section-large">
              <Box
                component="form"
                onSubmit={handleFoundingFamilySubmit}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "stretch",
                  gap: 1,
                  width: "100%",
                  maxWidth: { xs: "100%", md: 420 },
                  mx: { xs: "auto", md: 0 },
                  mt: { xs: 0.5, md: 1 },
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
                  <GradientButton
                    variant="gradient"
                    color="primary"
                    size="small"
                    type="submit"
                    elevated
                    disabled={isSubmitting}
                    sx={{
                      width: { xs: "100%", sm: "auto" },
                      whiteSpace: "nowrap",
                      minWidth: { sm: 180 },
                      height: 48,
                      minHeight: 48,
                      px: 2.5,
                      borderRadius: 0,
                      fontWeight: 600,
                      fontSize: "1rem",
                    }}
                  >
                    {isSubmitting ? "Joining..." : "Add Email"}
                  </GradientButton>
                </Box>
              </Box>
            </ThemeSpacing>
          </Box>

          {/* Right Side - Image and Floating Circle */}
          <Box
            sx={{
              ...landingLayout.heroSection.rightColumn,
              position: "relative",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* Floating Circle Shape */}
            <Box
              sx={{
                position: "absolute",
                width: landingLayout.floatingCircle.width,
                height: landingLayout.floatingCircle.height,
                backgroundColor: landingColors.pastelAqua,
                borderRadius: "50%",
                zIndex: 0,
                opacity: landingLayout.floatingCircle.opacity,
                top: landingLayout.floatingCircle.position.top,
                right: landingLayout.floatingCircle.position.right,
                boxShadow: `0px 10px 20px ${landingColors.shadowPanel}`,
                pointerEvents: "none",
              }}
            />

            {/* Landing Image */}
            <Box
              sx={{
                width: "100%",
                maxWidth: { xs: 280, md: 390, lg: 470, xl: 520 },
                zIndex: 1,
                borderRadius: "28px",
                overflow: "hidden",
                boxShadow: `0px 16px 32px ${landingColors.shadowHeroStrong}`,
              }}
            >
              <Box
                component="img"
                src={landingImage}
                alt="Lifelog app interface showing care tracking features"
                sx={{
                  width: "100%",
                  height: "auto",
                  objectFit: "cover",
                }}
              />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HeaderSection;
