import React from "react";
import { Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useTheme, alpha } from "@mui/material/styles";

// NavButton Component
const NavButton = ({ text, icon, to }) => {
  const theme = useTheme();

  return (
    <Button
      component={RouterLink}
      to={to}
      sx={{
        position: "relative",
        fontSize: { xs: "0.95rem", sm: "1.05rem", md: "1.1rem" },
        fontWeight: 400,
        fontFamily: "'Inter', sans-serif",
        transition:
          "color 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease",
        padding: "8px 10px", // Better padding for modern look
        color: theme.palette.text.primary, // Dark text for light background
        display: "flex",
        alignItems: "center", // Ensure icon and text are aligned
        backgroundColor: "transparent", // No background
        boxShadow: "none", // No shadow
        borderRadius: "8px", // Rounded corners

        "& .MuiSvgIcon-root": {
          // Target the SVG icon directly
          opacity: 0, // Hide icon by default
          transition: "opacity 0.3s ease, margin-right 0.3s ease", // Smooth transition for icon
          marginRight: 0, // No margin by default
          color: theme.palette.grey[700], // Purple icon color
        },

        "&:hover": {
          backgroundColor: alpha(theme.palette.primary.main, 0.08), // Light purple background on hover
          color: theme.palette.primary.main, // Purple text on hover
          boxShadow: `0px 2px 4px ${alpha(theme.palette.primary.main, 0.1)}`, // Subtle shadow

          "& .MuiSvgIcon-root": {
            opacity: 1, // Show icon on hover
            marginRight: "4px", // Add margin on hover
          },
        },

        "&::after": {
          content: '""',
          position: "absolute",
          width: "0",
          height: "2px",
          left: "50%",
          bottom: "0",
          backgroundColor: theme.palette.primary.main, // Purple underline
          transition: "width 0.3s ease, left 0.3s ease",
          borderRadius: "1px",
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
