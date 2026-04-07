import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { getAuth } from "firebase/auth";
import heroImage from "../../assets/image/landing/heroImage-Lifelog.png";
import { saveFoundingFamilyEmail } from "../../services/foundingFamilyService";
import { landingLayout, landingTypography, landingColors } from "../../assets/theme/landingTheme";

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
    <Box sx={{ backgroundColor: "transparent", position: "relative", pt: { xs: 3, md: 5 }, pb: { xs: 4, md: 6 } }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2.5, md: 4, lg: 6 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.2fr 0.8fr" },
            alignItems: "start",
            gap: { xs: 5, md: 8 },
            maxWidth: 1200,
            mx: "auto",
          }}
        >
          <Box>
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

            <Typography
              component="h1"
              sx={{
                ...landingTypography.heroMain,
                color: landingColors.heroText,
                maxWidth: { xs: "100%", md: 700 },
                textAlign: "left",
                mx: 0,
              }}
            >
              I have two nephews with autism. I built the app I always needed.
            </Typography>

            <Typography
              sx={{
                ...landingTypography.heroBody,
                maxWidth: { xs: "100%", md: 700 },
                mt: 2,
                fontSize: { xs: "1rem", md: "1.05rem" },
                lineHeight: { xs: 1.75, md: 1.85 },
                textAlign: "left",
                mx: 0,
              }}
            >
              For years I scrambled to remember what happened before every therapy appointment.
              Behaviors, triggers, good days, hard days - all buried in phone notes. I built
              Lifelog so no parent has to do that anymore.
            </Typography>

            <Typography
              sx={{
                ...landingTypography.heroBody,
                maxWidth: { xs: "100%", md: 700 },
                mt: 1.5,
                fontSize: { xs: "1rem", md: "1.05rem" },
                lineHeight: { xs: 1.75, md: 1.85 },
                textAlign: "left",
                mx: 0,
              }}
            >
              Everyone caring for your child sees the same timeline in real time. A caregiver logs
              a meltdown at 1 PM. You see it before the 2 PM appointment. The therapist walks in
              already knowing.
            </Typography>

            <Typography
              sx={{
                ...landingTypography.heroBody,
                maxWidth: { xs: "100%", md: 700 },
                mt: 1.5,
                fontWeight: 700,
                fontSize: { xs: "1rem", md: "1.05rem" },
                textAlign: "left",
                mx: 0,
              }}
            >
              No more "I didn't know that happened."
            </Typography>

            <Box
              sx={{
                mt: { xs: 3, md: 4 },
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                justifyContent: "flex-start",
                gap: 1.5,
                width: "100%",
                maxWidth: { xs: "100%", md: 580 },
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
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "center", md: "flex-end" },
              alignItems: "flex-start",
              pt: { xs: 0, md: 1 },
            }}
          >
            <Box
              component="img"
              src={heroImage}
              alt="Lifelog app preview"
              sx={{
                width: "100%",
                maxWidth: { xs: 560, md: 600, lg: 640 },
                display: "block",
                borderRadius: "28px",
                objectFit: "cover",
                boxShadow: `0 18px 42px ${landingColors.shadowMedium}`,
              }}
            />
          </Box>
        </Box>

        <Paper
          component="form"
          onSubmit={handleFoundingFamilySubmit}
          elevation={0}
          sx={{
            mt: { xs: 4, md: 5 },
            mx: "auto",
            width: "100%",
            maxWidth: 760,
            px: { xs: 2.25, md: 3 },
            py: { xs: 2.25, md: 2.75 },
            borderRadius: "24px",
            border: `1px solid ${landingColors.borderSoft}`,
            backgroundColor: landingColors.surfaceSoft,
            boxShadow: `0 10px 28px ${landingColors.shadowSoft}`,
          }}
        >
          <Typography
            sx={{
              fontSize: "0.82rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: landingColors.textMuted,
              fontWeight: 700,
              mb: 0.75,
              textAlign: "center",
            }}
          >
            Join the founding family
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: "0.95rem", md: "1rem" },
              lineHeight: 1.6,
              color: landingColors.bodyText,
              mb: 2,
              maxWidth: 520,
              mx: "auto",
              textAlign: "center",
            }}
          >
            Get early access and help shape the calm, caregiver-first version of Lifelog.
          </Typography>
          {submitSuccess && <Alert severity="success">{submitSuccess}</Alert>}
          {submitError && <Alert severity="error">{submitError}</Alert>}
          <Box
            sx={{
              mt: submitSuccess || submitError ? 1.25 : 0,
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "stretch",
              gap: 1,
              maxWidth: 640,
              mx: "auto",
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
                  backgroundColor: landingColors.surface,
                  borderRadius: "16px",
                  height: 48,
                  minHeight: 48,
                  fontSize: "1rem",
                  "& fieldset": {
                    borderRadius: "16px",
                    borderColor: landingColors.borderMedium,
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
        </Paper>
      </Container>
    </Box>
  );
};

export default HeaderSection;
