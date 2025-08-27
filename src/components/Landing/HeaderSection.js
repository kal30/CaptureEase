import React from "react";
import { Box, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { PRODUCT_NAME } from "../../constants/config";
import AppScreenshots from "./AppScreenshot";
import { GradientButton, ThemeSpacing, ThemeText } from "../UI";

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
        backgroundColor: "background.default",
        position: "relative",
        pt: { xs: 5, md: 6, lg: 7 },
        pb: { xs: 4, md: 6, lg: 8 },
        minHeight: { xs: "auto", md: "auto", lg: "auto" },
        display: "flex",
        alignItems: "center",
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            justifyContent: { xs: "center", md: "space-between" },
            gap: { xs: 3, md: 4, lg: 5 },
            padding: { xs: 1, md: 2, lg: 3 },
          }}
        >
          {/* Left Side - Text */}
          <Box
            sx={{
              width: { xs: "100%", md: "50%", lg: "45%" },
              pr: { md: 2, lg: 4 },
            }}
          >
            <ThemeText variant="hero-main">
              Simplifying Care for{" "}
              <ThemeText variant="brand-accent" component="span">
                Everyone Who Cares
              </ThemeText>
            </ThemeText>

            <ThemeText variant="hero-subtitle">
              No more sticky notes, endless texts, or scattered updates. With{" "}
              <ThemeText variant="product-highlight" component="span">
                {PRODUCT_NAME}
              </ThemeText>
              , everything that matters—notes, photos, and reminders—lives in
              one place. Clear, accessible, and stress‑free so you can focus on
              caring.
            </ThemeText>

            <ThemeSpacing variant="section-large">
              <GradientButton
                variant="gradient"
                size="hero"
                elevated
                onClick={handleGetStarted}
              >
                Try CaptureEz Free
              </GradientButton>
            </ThemeSpacing>
          </Box>

          {/* Right Side - Image and Floating Circle */}
          <Box
            sx={{
              width: { xs: "100%", md: "50%", lg: "55%" },
              position: "relative",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: { xs: 300, md: 400, lg: 500, xl: 600 },
              ...{ mt: { xs: 4, md: 0 } },
            }}
          >
            {/* Floating Circle Shape */}
            <Box
              sx={{
                position: "absolute",
                width: { xs: 180, md: 260, lg: 320, xl: 380 },
                height: { xs: 180, md: 260, lg: 320, xl: 380 },
                backgroundColor: "secondary.main",
                borderRadius: "50%",
                zIndex: 0,
                opacity: 0.04,
                top: { xs: "-10%", md: "-15%", lg: "-12%" },
                right: { xs: "-8%", md: "-10%", lg: "-8%" },
                boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
                pointerEvents: "none",
              }}
            />

            {/* Carousel in place of image */}
            <Box
              sx={{
                width: "100%",
                maxWidth: { xs: 240, md: 360, lg: 440, xl: 480 },
                zIndex: 1,
              }}
            >
              <AppScreenshots compact />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HeaderSection;
