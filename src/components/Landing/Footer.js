import React from "react";
import { Box, Typography, Link } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

const Footer = () => {
  return (
    <Box
      sx={{
        backgroundColor: "#B2EBF2", // Footer background color
        padding: "40px 0",
        textAlign: "center",
        clipPath: "polygon(0 10%, 100% 0%, 100% 100%, 0% 100%)",
        position: "relative",
        mt: 0, // Ensure no extra margin on top
        paddingBottom: 0, // Ensure no extra padding at the bottom
        height: "auto", // Make sure the footer height is flexible
      }}
    >
      <Typography
        variant="body1"
        sx={{
          fontWeight: "bold",
          color: "#027a79", // Footer text color
          fontSize: "1rem", // Footer font size
          mb: 2,
        }}
      >
        CaptureEase © {new Date().getFullYear()} - Caring Made Simple
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", gap: 3 }}>
        <Link
          href="/privacy-policy"
          sx={{ color: "#1F4E5F", textDecoration: "none" }}
        >
          Privacy Policy
        </Link>
        <Link
          href="/terms-of-service"
          sx={{ color: "#1F4E5F", textDecoration: "none" }}
        >
          Terms of Service
        </Link>
        <Link
          href="/contact-us"
          sx={{ color: "#1F4E5F", textDecoration: "none" }}
        >
          Contact Us
        </Link>
      </Box>
    </Box>
  );
};

export default Footer;
