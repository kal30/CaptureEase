import React from "react";
import Expert from "../components/Landing/Expert";
import Footer from "../components/Landing/Footer";
import HeaderSection from "../components/Landing/HeaderSection";
import TestimonialCarousel from "../components/Landing/TestimonialCarousel";
import ResponsiveLayout from "../components/Layout/ResponsiveLayout";

const LandingPage = () => {
  return (
    <ResponsiveLayout pageTitle="CaptureEz" showBottomNav={false}>
      <HeaderSection />

      <Expert />
      <Footer />
    </ResponsiveLayout>
  );
};

export default LandingPage;
