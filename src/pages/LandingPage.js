import React from "react";
import Expert from "../components/Landing/Expert";
import Footer from "../components/Landing/Footer";
import HeaderSection from "../components/Landing/HeaderSection";
import ResponsiveLayout from "../components/Layout/ResponsiveLayout";
import { landingPageStyles } from "../assets/theme/landingTheme";

const LandingPage = () => {
  return (
    <ResponsiveLayout 
      pageTitle="CaptureEz" 
      showBottomNav={false} 
      fullWidth
      sx={landingPageStyles}
    >
        <HeaderSection />
        <Expert />
        <Footer />
      </ResponsiveLayout>
  );
};

export default LandingPage;
