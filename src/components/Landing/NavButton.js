import React from "react";
import { Button } from "@mui/material";

// NavButton Component
const NavButton = ({ text, icon, href }) => {
  return (
    <Button
      href={href}
      startIcon={icon} // Optional icon
      sx={{
        position: "relative",
        fontSize: "1.1rem",
        fontWeight: "bold",
        fontFamily: "'Inter', sans-serif",
        transition:
          "color 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease",
        padding: "10px 20px",
        color: "#1F4E5F", // Default text color (dark blue)
        display: "flex",
        alignItems: "center", // Ensure icon and text are aligned

        "&:hover": {
          backgroundColor: "#B3E5FC", // Background color on hover
          color: "#027a79", // Change text color on hover
          borderRadius: "8px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", // Subtle shadow on hover
        },

        "& .MuiButton-startIcon": {
          color: "#1F4E5F", // Icon color matching the text
          transition: "color 0.3s ease", // Icon color transitions with text
        },

        "&:hover .MuiButton-startIcon": {
          color: "#027a79", // Change icon color on hover
        },

        "&::after": {
          content: '""',
          position: "absolute",
          width: "0",
          height: "2px",
          left: "50%",
          bottom: "-5px",
          backgroundColor: "#027a79", // Line color
          transition: "width 0.3s ease, left 0.3s ease",
        },

        "&:hover::after": {
          width: "100%",
          left: "0",
        },
      }}
    >
      {text} {/* The label of the button */}
    </Button>
  );
};

export default NavButton;
