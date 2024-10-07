import React from "react";
import { Box, Typography, Link } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

const Footer = () => {
  return (
    <Box
      sx={{
        backgroundColor: "#E0F7FA", // Light cyan background
        padding: "20px 0",
        textAlign: "center",
        mt: 1, // Adds space above the footer
        borderTop: "1px solid #B2EBF2", // Optional top border for separation
      }}
    >
      {/* Footer content */}
      <Typography
        variant="h6"
        sx={{ fontWeight: "bold", color: "#027a79", mb: 2 }}
      >
        CaptureEase © {new Date().getFullYear()} - Caring Made Simple
      </Typography>

      {/* Links */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 2 }}>
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

      {/* Social Media Icons */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 3 }}>
        <Link href="https://facebook.com" target="_blank">
          <FacebookIcon sx={{ color: "#1F4E5F" }} />
        </Link>
        <Link href="https://twitter.com" target="_blank">
          <TwitterIcon sx={{ color: "#1F4E5F" }} />
        </Link>
        <Link href="https://linkedin.com" target="_blank">
          <LinkedInIcon sx={{ color: "#1F4E5F" }} />
        </Link>
      </Box>
    </Box>
  );
};

export default Footer;
