import React from "react";
import { Box, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { PRODUCT_NAME } from "../../constants/config";
import landingImage from "../../assets/image/landing/landingimageRealisitic4.jpg";
import { GradientButton, ThemeSpacing } from "../UI";
import {
  landingLayout,
  landingTypography,
  landingColors,
} from "../../assets/theme/landingTheme";

const HeaderSection = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    try {
      const isLoggedIn =
        typeof window !== "undefined" &&
        (localStorage.getItem("ce_user") ||
          localStorage.getItem("authUser") ||
          localStorage.getItem("token"));
      if (isLoggedIn) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    } catch (e) {
      navigate("/login");
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "transparent",
        position: "relative",
        mt: 10,
        ...landingLayout.heroSection.padding,
        minHeight: { xs: "auto", md: "auto", lg: "auto" },
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
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
                SIMPLIFYING CARE FOR
              </Typography>
              <Typography
                sx={{
                  ...landingTypography.heroMain,
                  color: landingColors.heroText,
                }}
              >
                EVERYONE WHO
              </Typography>
              <Typography
                sx={{
                  ...landingTypography.heroSubtitle,
                  color: landingColors.heroText,
                }}
              >
                CARES
              </Typography>
            </Box>

            <Typography sx={landingTypography.heroBody}>
              No more sticky notes, group texts, or scattered updates. Whether
              you’re raising kids, caring for a parent with dementia, supporting
              a loved one with disabilities, or working alongside teachers and
              caregivers, {PRODUCT_NAME} brings everything together. Notes,
              photos, and reminders stay in one place — clear, accessible, and
              stress-free — so you can spend less time coordinating and more
              time caring.
            </Typography>

            <ThemeSpacing variant="section-large">
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <GradientButton
                  variant="gradient"
                  size="hero"
                  elevated
                  onClick={handleGetStarted}
                >
                  Try CaptureEz Free
                </GradientButton>
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
                maxWidth: { xs: 280, md: 400, lg: 480, xl: 520 },
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
                  //borderRadius: { xs: 2, md: 3, lg: 4 },
                  boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.12)",
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
