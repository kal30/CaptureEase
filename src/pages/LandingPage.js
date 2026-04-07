import React from "react";
import { Box } from "@mui/material";
import Footer from "../components/Landing/Footer";
import HeaderSection from "../components/Landing/HeaderSection";
import HowItWorksSection from "../components/Landing/HowItWorksSection";
import SocialProofSection from "../components/Landing/SocialProofSection";
import { landingPageStyles } from "../assets/theme/landingTheme";

const LandingPage = () => {
  return (
    <Box sx={landingPageStyles}>
      <HeaderSection />
      <SocialProofSection />
      <HowItWorksSection />
      <Footer />
    </Box>
  );
};

export default LandingPage;
