import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#A7D9F0", // Calming Blue
    },
    secondary: {
      main: "#FF4500", // Orange Red (a very bright, almost neon orange)
    },
    accent: {
      main: "#C8E6C9", // Subtle Green
    },
    background: {
      default: "#F9F9F9", // Very Light Background
    },
    text: {
      primary: "#4A4A4A", // Soft charcoal for main text
      secondary: "#888888", // Muted grey for secondary information
    },
  },
  typography: {
    fontFamily: "Inter, sans-serif",
    h1: {
      fontSize: {
        xs: "1.75rem", // Responsive font size
        md: "2.5rem",
        lg: "3rem",
      },
      fontWeight: "bold",
      color: "#01a0e2", // Cerulean
    },
    h2: {
      fontSize: {
        xs: "1.5rem",
        md: "2rem",
      },
      fontWeight: "bold",
      color: "#027a79", // Pine Green
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6, // Improve readability
      color: "#04061f", // Black Pearl for body text
    },
    button: {
      textTransform: "none",
      fontSize: "1rem",
      fontWeight: "bold",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          padding: {
            xs: "8px 16px", // Responsive padding for mobile
            md: "10px 20px",
          },
        },
        containedPrimary: {
          backgroundColor: "#01a0e2", // Cerulean
          color: "#FFFFFF",
          "&:hover": {
            backgroundColor: "#027a79", // Pine Green
          },
        },
        containedSecondary: {
          backgroundColor: "#027a79", // Pine Green
          color: "#FFFFFF",
          "&:hover": {
            backgroundColor: "#6c707b", // Pale Sky for hover
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          marginBottom: "1rem",
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: "#01a0e2", // Cerulean
          textDecoration: "none",
          "&:hover": {
            textDecoration: "underline",
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          maxWidth: "1200px", // Max width for large screens
          marginRight: "10%",
          marginLeft: "10%",
          margin: "0 auto", // Center container
          padding: "0 16px", // Responsive padding for mobile
        },
      },
    },
  },
  spacing: 8, // Base spacing for consistency
});

export default theme;
