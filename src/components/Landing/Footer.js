import React from "react";
import { Box, Typography, Link } from "@mui/material";

const Footer = () => {
  return (
    <Box
      sx={{
        backgroundColor: "#E3F2F0", // Footer background color
        padding: "20px 0",
        textAlign: "center",
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
          color: "#00695C", // Footer text color
          fontSize: "1rem", // Footer font size
          mb: 2,
        }}
      >
        CaptureEase © {new Date().getFullYear()} - Caring Made Simple
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", gap: 4 }}>
        <Link
          href="/privacy-policy"
          sx={{
            color: "#1F4E5F",
            textDecoration: "none",
            "&:hover": { color: "#004D40" },
          }}
        >
          Privacy Policy
        </Link>
        <Link
          href="/terms-of-service"
          sx={{
            color: "#1F4E5F",
            textDecoration: "none",
            "&:hover": { color: "#004D40" },
          }}
        >
          Terms of Service
        </Link>
        <Link
          href="/contact-us"
          sx={{
            color: "#1F4E5F",
            textDecoration: "none",
            "&:hover": { color: "#004D40" },
          }}
        >
          Contact Us
        </Link>
      </Box>
    </Box>
  );
};

export default Footer;
