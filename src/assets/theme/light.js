import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#F27F45", // softer orange
      dark: "#E85D2F", // used for hover/active
      light: "#F9A06B",
    },
    secondary: {
      // A complementary, softer tone to the green info color
      main: "#7C6F57", // muted brown/khaki, complements green
    },
    info: {
      main: "#5B8C51",
    },
    accent: {
      main: "#FFC857",
    },
    background: {
      default: "#FFF8ED",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#333333",
      secondary: "#666666",
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontSize: {
        xs: "2rem",
        sm: "2.5rem",
        md: "3rem",
        lg: "3.5rem",
      },
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: "-0.02em",
      color: "#333333",
    },
    h2: {
      fontSize: {
        xs: "1.75rem",
        sm: "2rem",
        md: "2.25rem",
        lg: "2.5rem",
      },
      fontWeight: 600,
      lineHeight: 1.3,
      color: "#333333",
    },
    h3: {
      fontSize: {
        xs: "1.5rem",
        sm: "1.75rem",
        md: "2rem",
      },
      fontWeight: 600,
      lineHeight: 1.4,
      color: "#333333",
    },
    h4: {
      fontSize: {
        xs: "1.25rem",
        sm: "1.5rem",
        md: "1.75rem",
      },
      fontWeight: 600,
      lineHeight: 1.4,
      color: "#333333",
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
      lineHeight: 1.4,
      color: "#333333",
    },
    h6: {
      fontSize: "1.125rem",
      fontWeight: 600,
      lineHeight: 1.4,
      color: "#333333",
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
      color: "#333333",
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.5,
      color: "#727077",
    },
    button: {
      textTransform: "none",
      fontSize: "0.95rem",
      fontWeight: 600,
      letterSpacing: "0.025em",
    },
    caption: {
      fontSize: "0.75rem",
      lineHeight: 1.4,
      color: "#727077",
    },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 64,
          paddingLeft: 16,
          paddingRight: 16,
          "@media (min-width:600px)": { minHeight: 72 },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "14px",
          padding: "12px 24px",
          fontSize: "0.95rem",
          fontWeight: 600,
          textTransform: "none",
          transition: "background-color 120ms ease, transform 120ms ease",
          backgroundColor: "#F27F45",
          color: "#FFFFFF",
          "&:hover": {
            backgroundColor: "#E85D2F",
          },
        },
        containedPrimary: {
          background: "#F27F45",
          color: "#FFFFFF",
          "&:hover": {
            background: "#E85D2F",
          },
        },
        containedSecondary: {
          background: "#5B8C51", // Use info.main for containedSecondary
          color: "#FFFFFF",
          "&:hover": {
            background: "#4a7342", // Slightly darker shade for hover
          },
        },
        outlined: {
          borderWidth: "2px",
          borderColor: "#F27F45",
          color: "#F27F45",
          "&:hover": {
            borderWidth: "2px",
            borderColor: "#E85D2F",
            backgroundColor: "rgba(242, 127, 69, 0.1)",
          },
        },
        text: {
          "&:hover": {
            backgroundColor: "rgba(242, 127, 69, 0.1)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "18px",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
          transition: "box-shadow 120ms ease",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: "18px",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 1px 2px rgba(17,24,39,0.04)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "14px",
            backgroundColor: "#FFFFFF",
            transition: "all 0.2s ease-in-out",
            "& fieldset": {
              borderColor: "#E8E2D9",
              borderWidth: "2px",
            },
            "&:hover fieldset": {
              borderColor: "#F27F45",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#F27F45",
              borderWidth: "2px",
              boxShadow: "0px 0px 0px 3px rgba(242, 127, 69, 0.12)",
            },
            "&.Mui-focused": {
              backgroundColor: "#FFFFFF",
            },
          },
          "& .MuiInputLabel-root": {
            color: "#666666",
            "&.Mui-focused": {
              color: "#F27F45",
            },
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          "& .MuiTabs-indicator": {
            backgroundColor: "#F27F45",
            height: "3px",
            borderRadius: "2px",
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.875rem",
          minHeight: "48px",
          color: "#666666",
          "&.Mui-selected": {
            color: "#F27F45",
          },
          "&:hover": {
            backgroundColor: "rgba(242, 127, 69, 0.06)",
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          marginBottom: "8px",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            backgroundColor: "rgba(242, 127, 69, 0.05)",
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          marginBottom: "4px",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            backgroundColor: "rgba(242, 127, 69, 0.08)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: "20px",
          fontWeight: 600,
          fontSize: "0.8rem",
        },
        filled: {
          backgroundColor: "#F27F45",
          color: "#FFFFFF",
          "&:hover": {
            backgroundColor: "#E85D2F",
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
          "&:before": {
            display: "none",
          },
          "&.Mui-expanded": {
            margin: "16px 0",
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          "&.Mui-expanded": {
            borderBottomLeftRadius: "0",
            borderBottomRightRadius: "0",
          },
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: "24px",
          backgroundColor: "#FFFFFF",
          borderBottomLeftRadius: "16px",
          borderBottomRightRadius: "16px",
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          maxWidth: "1400px",
          padding: "0 18px",
          "@media (min-width: 600px)": {
            padding: "0 28px",
          },
          "@media (min-width: 900px)": {
            padding: "0 36px",
          },
        },
      },
    },
    MuiModal: {
      styleOverrides: {
        root: {
          "& .MuiPaper-root": {
            borderRadius: "20px",
            boxShadow: "0px 25px 50px rgba(0, 0, 0, 0.15)",
            border: "1px solid #E8E2D9",
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: "20px",
          boxShadow: "0px 25px 50px rgba(0, 0, 0, 0.15)",
          border: "1px solid #E8E2D9",
        },
      },
    },
    MuiBreadcrumbs: {
      styleOverrides: {
        root: {
          "& .MuiBreadcrumbs-ol": {
            color: "#F27F45",
            fontWeight: 500,
          },
          "& .MuiBreadcrumbs-separator": {
            color: "#F27F45",
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFF8ED",
          color: "#333333",
          boxShadow: "none",
          borderBottom: "1px solid #E8E2D9",
          backgroundImage: "none",
        },
      },
    },
  },
  spacing: 8,
});

export default theme;
