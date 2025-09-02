import React from "react";
import { Box, Typography, Link } from "@mui/material";
import { landingColors } from "../../assets/theme/landingTheme";

const Footer = () => {
  return (
    <Box
      sx={{
        padding: "12px 0",
        textAlign: "center",
        position: "relative",
        mt: 0, // Ensure no extra margin on top
        paddingBottom: 2, // Ensure no extra padding at the bottom
        height: "auto", // Make sure the footer height is flexible
      }}
    >
      <Typography
        variant="body1"
        sx={{
          fontWeight: "bold",
          color: landingColors.deepNavy, // Eggplant tone
          fontSize: "0.95rem", // Footer font size
          mb: 1,
        }}
      >
        CaptureEz © {new Date().getFullYear()} - Caring Made Simple
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mt: 0.5 }}>
        <Link
          href="/privacy-policy"
          sx={{
            color: landingColors.deepNavy,
            textDecoration: "none",
            "&:hover": { color: landingColors.brandAccent },
          }}
        >
          Privacy Policy
        </Link>
        <Link
          href="/terms-of-service"
          sx={{
            color: landingColors.deepNavy,
            textDecoration: "none",
            "&:hover": { color: landingColors.brandAccent },
          }}
        >
          Terms of Service
        </Link>
        <Link
          href="/contact-us"
          sx={{
            color: landingColors.deepNavy,
            textDecoration: "none",
            "&:hover": { color: landingColors.brandAccent },
          }}
        >
          Contact Us
        </Link>
      </Box>
    </Box>
  );
};

export default Footer;
