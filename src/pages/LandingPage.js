import React from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import image2 from "../image/landingimageRealisitic4.jpg";
import Expert from "../components/Landing/Expert";
import Footer from "../components/Landing/Footer";
import HeaderSection from "../components/Landing/HeaderSection";

const LandingPage = () => {
  return (
    <>
      <HeaderSection />
      <Expert />
      <Footer />
    </>
  );
};

export default LandingPage;
