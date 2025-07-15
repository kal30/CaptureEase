import React from "react";
import { Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

// NavButton Component
const NavButton = ({ text, icon, to }) => {
  return (
    <Button
      component={RouterLink}
      to={to}
      sx={{
        position: "relative",
        fontSize: "1.1rem",
        fontWeight: "bold",
        fontFamily: "'Inter', sans-serif",
        transition:
          "color 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease",
        padding: "5px 10px", // Minimal padding for text link feel
        color: "#fff", // Default text color (white)
        display: "flex",
        alignItems: "center", // Ensure icon and text are aligned
        backgroundColor: "transparent", // No background
        boxShadow: "none", // No shadow

        "& .MuiSvgIcon-root": {
          // Target the SVG icon directly
          opacity: 0, // Hide icon by default
          transition: "opacity 0.3s ease, margin-right 0.3s ease", // Smooth transition for icon
          marginRight: 0, // No margin by default
        },

        "&:hover": {
          backgroundColor: "transparent", // Still no background on hover
          color: "#B3E5FC", // Consistent hover color
          boxShadow: "none", // Still no shadow on hover

          "& .MuiSvgIcon-root": {
            opacity: 1, // Show icon on hover
            marginRight: "8px", // Add margin on hover
          },
        },

        "&::after": {
          content: '""',
          position: "absolute",
          width: "0",
          height: "2px",
          left: "50%",
          bottom: "-5px",
          backgroundColor: "#B3E5FC", // Consistent hover color
          transition: "width 0.3s ease, left 0.3s ease",
        },

        "&:hover::after": {
          width: "100%",
          left: "0",
        },
      }}
    >
      {icon} {/* Render icon directly */}
      {text} {/* The label of the button */}
    </Button>
  );
};

export default NavButton;
