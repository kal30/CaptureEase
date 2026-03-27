import React, { useState } from "react";
import { Alert, Box, Container, Divider, TextField, Typography } from "@mui/material";
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

  const tryCaptureEzPath = auth.currentUser ? "/dashboard" : "/register";

  return (
    <Box
      sx={{
        backgroundColor: "transparent",
        position: "relative",
        mt: { xs: 3, md: 4, lg: 5 },
        ...landingLayout.heroSection.padding,
        minHeight: { xs: "auto", md: "auto", lg: "auto" },
        display: "flex",
        alignItems: "center",
        overflow: "visible",
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            justifyContent: { xs: "center", md: "space-between" },
            ...landingLayout.heroSection.container,
          }}
        >
          {/* Left Side - Text */}
          <Box
            sx={{
              ...landingLayout.heroSection.leftColumn,
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
                I have two nephews with autism. I built the app I always needed.
              </Typography>
            </Box>

            <Typography sx={landingTypography.heroBody}>
              For years I scrambled to remember what happened before every
              therapy appointment. Behaviors, triggers, good days, hard days —
              all buried in my phone notes. I built CaptureEz so no parent has
              to do that anymore.
            </Typography>

            <Typography sx={landingTypography.heroBody}>
              Everyone caring for your child sees the same timeline in real
              time. Caregiver logs a meltdown at 1pm. You see it before the
              2pm appointment. Therapist walks in already knowing. No more
              "I didn't know that happened."
            </Typography>

            <Typography sx={landingTypography.heroBody}>
              Free while in beta. Join as a founding family.
            </Typography>

            <Box
              sx={{
                mt: { xs: 2.5, md: 3 },
                display: "flex",
                justifyContent: { xs: "center", md: "flex-start" },
                width: "100%",
                maxWidth: { xs: "100%", md: 420 },
              }}
            >
              <GradientButton
                component={RouterLink}
                to={tryCaptureEzPath}
                variant="gradient"
                color="primary"
                size="large"
                elevated
                sx={{
                  width: { xs: "100%", sm: "auto", md: "100%" },
                  minWidth: { xs: 0, sm: 220, md: 0 },
                  maxWidth: { sm: 260, md: "100%" },
                  px: { xs: 3.5, md: 4 },
                  py: { xs: 1.2, md: 1.4 },
                  textTransform: "none",
                  borderRadius: "16px",
                  fontSize: { xs: "1rem", md: "1.05rem" },
                  boxShadow: "0 10px 22px rgba(8, 31, 92, 0.22)",
                }}
              >
                Try CaptureEz Free
              </GradientButton>
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
                    color: "rgba(8, 31, 92, 0.6)",
                    "&::before, &::after": {
                      borderColor: "rgba(8, 31, 92, 0.16)",
                    },
                  }}
                >
                  <Typography
                    component="span"
                    sx={{
                      fontSize: "0.82rem",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: "rgba(8, 31, 92, 0.72)",
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
                        backgroundColor: "rgba(255,255,255,0.72)",
                        borderRadius: 0,
                        height: 48,
                        "& fieldset": {
                          borderRadius: 0,
                          borderColor: "rgba(8, 31, 92, 0.18)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(8, 31, 92, 0.28)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "rgba(8, 31, 92, 0.38)",
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
                      px: 2.5,
                      borderRadius: 0,
                      fontWeight: 600,
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
                backgroundColor: "secondary.main",
                borderRadius: "50%",
                zIndex: 0,
                opacity: landingLayout.floatingCircle.opacity,
                top: landingLayout.floatingCircle.position.top,
                right: landingLayout.floatingCircle.position.right,
                boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
                pointerEvents: "none",
              }}
            />

            {/* Landing Image */}
            <Box
              sx={{
                width: "100%",
                maxWidth: { xs: 280, md: 390, lg: 470, xl: 520 },
                zIndex: 1,
              }}
            >
              <Box
                component="img"
                src={landingImage}
                alt="CaptureEase app interface showing care tracking features"
                sx={{
                  width: "100%",
                  height: "auto",
                  boxShadow: "0px 10px 28px rgba(0, 0, 0, 0.14)",
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
