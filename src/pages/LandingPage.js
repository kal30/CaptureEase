import React from "react";
import Expert from "../components/Landing/Expert";
import Footer from "../components/Landing/Footer";
import HeaderSection from "../components/Landing/HeaderSection";
import TestimonialCarousel from "../components/Landing/TestimonialCarousel";

const LandingPage = () => {
  return (
    <>
      <HeaderSection />
      <TestimonialCarousel />
      <Expert />
      <Footer />
    </>
  );
};

export default LandingPage;
