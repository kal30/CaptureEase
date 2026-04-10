import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { getAuth } from "firebase/auth";
import heroImage from "../../assets/image/landing/heroImage-Lifelog.png";
import { saveFoundingFamilyEmail } from "../../services/foundingFamilyService";
import { landingTypography, landingColors } from "../../assets/theme/landingTheme";
import BrandWordmark from "../UI/BrandWordmark";

const landingPrimaryButtonStyles = {
  width: { xs: "100%", sm: "auto" },
  minWidth: { xs: 0, sm: 230 },
  px: { xs: 3.5, md: 4.5 },
  py: { xs: 1.25, md: 1.35 },
  textTransform: "none",
  borderRadius: "12px",
  fontSize: { xs: "1rem", md: "1.05rem" },
  fontWeight: 700,
  letterSpacing: "-0.01em",
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
  py: { xs: 1.25, md: 1.35 },
  textTransform: "none",
  borderRadius: "12px",
  fontSize: { xs: "1rem", md: "1.05rem" },
  fontWeight: 700,
  letterSpacing: "-0.01em",
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
  borderRadius: "12px",
  fontWeight: 700,
  fontSize: "1rem",
  letterSpacing: "-0.01em",
  color: landingColors.heroText,
  backgroundColor: landingColors.surfaceSoft,
  border: `1px solid ${landingColors.borderMedium}`,
  boxShadow: `0 6px 16px ${landingColors.shadowSoft}`,
  "&:hover": {
    backgroundColor: landingColors.surface,
    borderColor: landingColors.borderFocus,
    boxShadow: `0 8px 20px ${landingColors.shadowMedium}`,
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
      data-cy="landing-hero"
      sx={{
        backgroundColor: "transparent",
        position: "relative",
        pt: { xs: 3, md: 5 },
        pb: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2.5, md: 4, lg: 0 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.05fr) minmax(380px, 0.95fr)" },
            alignItems: "center",
            gap: { xs: 4, md: 6, lg: 7 },
            maxWidth: 1120,
            mx: "auto",
          }}
        >
          <Box>
           

            <Typography
              component="h1"
              sx={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: { xs: "2.35rem", sm: "2.8rem", md: "3.15rem", lg: "3.5rem" },
                lineHeight: { xs: 1.08, md: 1.04, lg: 1.02 },
                letterSpacing: "-0.02em",
                fontWeight: 800,
                color: landingColors.heroText,
                maxWidth: { xs: "100%", md: 720, lg: 760 },
                textWrap: "balance",
                textAlign: "left",
                mx: 0,
                mb: 2,
              }}
            >
              I have two nephews with autism. I built the app I always needed.
            </Typography>

            <Typography
              sx={{
                ...landingTypography.heroBody,
                maxWidth: { xs: "100%", md: 760, lg: 800 },
                mt: 0,
                fontSize: { xs: "1rem", md: "1.05rem" },
                lineHeight: { xs: 1.6, md: 1.65, lg: 1.7 },
                textAlign: "left",
                mx: 0,
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 400,
              }}
            >
              For years I scrambled to remember what happened before every therapy appointment.
              Behaviors, triggers, good days, hard days - all buried in phone notes. I built{" "}
                    <BrandWordmark
                      variant="heroInline"
                      color={landingColors.deepNavy}
                      sx={{
                        display: 'inline-flex',
                  verticalAlign: 'baseline',
                }}
              />{" "}
              so no parent has to do that anymore.
            </Typography>

            <Typography
              sx={{
                ...landingTypography.heroBody,
                maxWidth: { xs: "100%", md: 760, lg: 800 },
                mt: 1.75,
                fontSize: { xs: "1rem", md: "1.05rem" },
                lineHeight: { xs: 1.6, md: 1.65, lg: 1.7 },
                textAlign: "left",
                mx: 0,
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 400,
              }}
            >
              Everyone caring for your child sees the same timeline in real time. A caregiver logs
              a meltdown at 1 PM. You see it before the 2 PM appointment. The therapist walks in
              already knowing.
            </Typography>

            <Box
              sx={{
                mt: { xs: 3, md: 4 },
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                justifyContent: "flex-start",
                gap: 1.5,
                width: "100%",
                maxWidth: { xs: "100%", md: 620, lg: 660 },
              }}
            >
              <Button
                component={RouterLink}
                to={tryLifelogPath}
                variant="contained"
                data-cy="landing-start-tracking-btn"
                sx={{ ...landingPrimaryButtonStyles, height: 48, minHeight: 48 }}
              >
                Start Tracking Free
              </Button>
              <Button
                component={RouterLink}
                to="/#how-it-works"
                variant="outlined"
                data-cy="landing-how-it-works-btn"
                sx={{ ...landingSecondaryButtonStyles, height: 48, minHeight: 48 }}
              >
                See How It Works
              </Button>
            </Box>

            <Box
              data-cy="founding-family-form"
              component="form"
              onSubmit={handleFoundingFamilySubmit}
              sx={{
                mt: 4,
                mb: 8,
                width: "100%",
                maxWidth: { xs: "100%", md: 660, lg: 700 },
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: landingColors.textMuted,
                  fontFamily: "'Outfit', sans-serif",
                  mb: 1.5,
                }}
              >
                Join the Founding Family
              </Typography>

              {submitSuccess && <Alert severity="success" sx={{ mb: 1.5, py: 0 }}>{submitSuccess}</Alert>}
              {submitError && <Alert severity="error" sx={{ mb: 1.5, py: 0 }}>{submitError}</Alert>}

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
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: 48,
                      borderRadius: "12px",
                    },
                    "& .MuiOutlinedInput-input": {
                      py: 0,
                      px: 1.75,
                      height: "100%",
                      boxSizing: "border-box",
                    },
                  }}
                  InputProps={{
                    sx: {
                      backgroundColor: landingColors.surface,
                      borderRadius: "12px",
                      height: 48,
                      fontSize: "0.9rem",
                      "& fieldset": { borderColor: landingColors.borderMedium },
                    },
                  }}
                />
                <Button
                  variant="outlined"
                  type="submit"
                  disabled={isSubmitting}
                  sx={{ ...landingFormButtonStyles, height: 48, minHeight: 48 }}
                >
                  {isSubmitting ? "..." : "Join"}
                </Button>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "center", lg: "flex-end" },
              alignItems: "center",
              pt: { xs: 0, lg: 1 },
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: { xs: 560, md: 540, lg: 520 },
              }}
            >
              <Box
                sx={{
                  p: { xs: 1.5, md: 2 },
                  borderRadius: "20px",
                  background: `linear-gradient(180deg, ${landingColors.surface} 0%, ${landingColors.surfaceSoft} 100%)`,
                  border: `1px solid ${landingColors.borderSoft}`,
                  boxShadow: `0 18px 42px ${landingColors.shadowMedium}`,
                  maxHeight: 600,
                  minHeight: { xs: 390, md: 500 },
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  overflow: "hidden",
                }}
              >
                

                <Box
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    borderRadius: "16px",
                    overflow: "hidden",
                    backgroundColor: landingColors.surfaceSoft,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Box
                    component="img"
                    src={heroImage}
                    alt="Lifelog app preview"
                    sx={{
                      width: "100%",
                      height: "100%",
                      maxHeight: 600,
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

      </Container>
    </Box>
  );
};

export default HeaderSection;
