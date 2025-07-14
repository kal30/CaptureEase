import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2A9D8F", // Calming Teal
    },
    secondary: {
      main: "#E76F51", // Warm Coral
    },
    accent: {
      main: "#E9C46A", // Soft Yellow
    },
    background: {
      default: "#F8F9FA", // Off-White
    },
    text: {
      primary: "#264653", // Dark Charcoal
      secondary: "#5C6F78", // Lighter Charcoal for secondary text
    },
  },
  typography: {
    fontFamily: "Inter, sans-serif",
    h1: {
      fontSize: {
        xs: "1.75rem",
        md: "2.5rem",
        lg: "3rem",
      },
      fontWeight: "bold",
      color: "#2A9D8F", // Calming Teal
    },
    h2: {
      fontSize: {
        xs: "1.5rem",
        md: "2rem",
      },
      fontWeight: "bold",
      color: "#264653", // Dark Charcoal
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
      color: "#264653", // Dark Charcoal for body text
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
            xs: "8px 16px",
            md: "10px 20px",
          },
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)", // Subtle shadow for buttons
          "&:hover": {
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)", // Enhanced shadow on hover
          },
        },
        containedPrimary: {
          backgroundColor: "#2A9D8F", // Calming Teal
          color: "#FFFFFF",
          "&:hover": {
            backgroundColor: "#217a70", // Darker Teal
          },
        },
        containedSecondary: {
          backgroundColor: "#E76F51", // Warm Coral
          color: "#FFFFFF",
          "&:hover": {
            backgroundColor: "#d85a3a", // Darker Coral
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            "& fieldset": {
              borderColor: "#e0e0e0", // Light border color
            },
            "&:hover fieldset": {
              borderColor: "#2A9D8F", // Primary color on hover
            },
            "&.Mui-focused fieldset": {
              borderColor: "#2A9D8F", // Primary color when focused
              boxShadow: "0px 0px 0px 3px rgba(42, 157, 143, 0.2)", // Subtle focus ring
            },
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          marginBottom: "8px", // Space between list items
          borderRadius: "8px",
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)", // Subtle shadow for list items
          backgroundColor: "#FFFFFF", // White background for list items
          "&:hover": {
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", // Enhanced shadow on hover
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
          color: "#2A9D8F", // Calming Teal
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
          maxWidth: "1200px",
          marginRight: "10%",
          marginLeft: "10%",
          margin: "0 auto",
          padding: "0 16px",
        },
      },
    },
    MuiModal: {
      styleOverrides: {
        root: {
          "& .MuiPaper-root": {
            borderRadius: "12px", // Rounded corners for modals
            boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.15)", // Deeper shadow for modals
          },
        },
      },
    },
  },
  spacing: 8,
});

export default theme;
