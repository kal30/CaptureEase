import React from "react";
import { Box } from "@mui/material";
import Expert from "../components/Landing/Expert";
import Footer from "../components/Landing/Footer";
import HeaderSection from "../components/Landing/HeaderSection";
import { landingPageStyles } from "../assets/theme/landingTheme";

const LandingPage = () => {
  return (
    <Box sx={landingPageStyles}>
      <HeaderSection />
      <Expert />
      <Footer />
    </Box>
  );
};

export default LandingPage;
