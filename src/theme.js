import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#df4c0a", // Bright orange for primary elements
    },
    secondary: {
      main: "#661f8d", // Eggplant purple for secondary elements
    },
    background: {
      default: "#f5f5f5", // Soft pastel background
    },
    text: {
      primary: "#000000", // Primary text color
      secondary: "#94618E", // Muted purple for secondary text
    },
  },
  typography: {
    fontFamily: "Poppins, sans-serif", // Set a consistent font family across the app
    h1: {
      fontSize: "2rem", // Example heading size
      fontWeight: "bold",
      color: "#FF6A33", // Primary color for headings
    },
    h2: {
      fontSize: "1.75rem",
      fontWeight: "bold",
      color: "#49274A", // Secondary color for subheadings
    },
    body1: {
      fontSize: "1rem",
      fontWeight: "normal",
      color: "#000000", // Standard black for body text
    },
    button: {
      textTransform: "none", // Keep button text as entered (no uppercase transformation)
      fontSize: "1rem", // Standard button font size
      fontWeight: "bold",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px", // Rounded button corners
          padding: "10px 20px", // Standard padding for buttons
        },
        containedPrimary: {
          backgroundColor: "#FF6A33", // Primary button color (orange)
          color: "#FFFFFF", // White text on primary button
          "&:hover": {
            backgroundColor: "#E65C2D", // Darken the primary button on hover
          },
        },
        containedSecondary: {
          backgroundColor: "#49274A", // Secondary button color (eggplant)
          color: "#FFFFFF", // White text on secondary button
          "&:hover": {
            backgroundColor: "#3B1F3B", // Darken the secondary button on hover
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          marginBottom: "1rem", // Standard margin below text elements
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: "#FF6A33", // Consistent color for links
          textDecoration: "none",
          "&:hover": {
            textDecoration: "underline",
          },
        },
      },
    },
  },
});

export default theme;
