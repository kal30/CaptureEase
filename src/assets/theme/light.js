import { createTheme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import brand from "./brand";
import getMuiButtonTheme from "./components/buttonTheme";

const theme = createTheme({
  breakpoints: { values: { xs: 0, sm: 480, md: 768, lg: 1200, xl: 1536 } },

  palette: {
    mode: "light",
    background: {
      default: "#FFFFFF",
      paper: "#FFFFFF",
      container: "#fff8ed", // light blue background for containers
    },
    primary: {
      main: brand.palette.primary.main,
      dark: brand.palette.primary.dark,
      light: brand.palette.primary.light,
    },
    secondary: {
      main: brand.palette.secondary.main,
      light: brand.palette.secondary.light,
      dark: brand.palette.secondary.dark,
    },
    info: {
      main: brand.palette.primary.main,
    },
    accent: {
      main: brand.palette.secondary.main,
    },
    success: {
      main: "#4CAF50", // Keep existing mapping for success
    },
    tertiary: {
      main: "#7C6F57", // muted brown/khaki
      light: "#A49592", // secondary from CSS files
      dark: "#727077", // darker neutral
    },
    calendar: {
      background: "#EED8C9",
      accent: "#E99787",
      accentHover: "#d48a7a",
      weekendBg: "#f9f5f2",
      eventDot: "#EB684A",
      todayBg: "#A49592",
      hoverBg: "#fce9e5",
    },
    dailyCare: {
      primary: "#6D28D9", // Daily Care purple
      light: "#8B5CF6", // Lighter purple
      dark: "#5B21B6", // Darker purple
      background: "rgba(109, 40, 217, 0.1)", // Light purple background
      hover: "rgba(109, 40, 217, 0.2)", // Hover background
    },
    journal: {
      chipBg: "#A3B18A", // sage green
      hoverIcon: "#EB684A", // terracotta
      deleteHover: "#F4B860", // mustard
    },
    behavior: {
      primary: "#FF9800", // Orange (matches timeline service)
      light: "#FFB74D",
      dark: "#F57C00",
      background: "rgba(255, 152, 0, 0.1)",
      hover: "rgba(255, 152, 0, 0.2)",
    },
    performance: {
      primary: "#4CAF50", // Green (matches timeline service)
      light: "#81C784",
      dark: "#388E3C",
      background: "rgba(76, 175, 80, 0.1)",
      hover: "rgba(76, 175, 80, 0.2)",
    },
    timeline: {
      progress: "#6D28D9", // Use dailyCare primary for progress rings
      background: "rgba(109, 40, 217, 0.05)",
      border: "rgba(109, 40, 217, 0.1)",
      entries: {
        incident: "#DC2626",
        dailyHabit: "#D97706",
        dailyNote: "#059669",
        journal: "#8B5CF6",
      },
      periods: {
        morning: "#0284C7", // info-like
        afternoon: "#F59E0B", // warning-like
        evening: "#7C6F57", // secondary-like
      },
    },
    incident: {
      // Base incident type colors for chips/buttons
      types: {
        eating_nutrition: "#22C55E",
        mood: "#F59E0B",
        sleep: "#3B82F6",
        behavioral: "#EF4444",
        sensory: "#8B5CF6",
        pain_medical: "#DC2626",
        other: "#6B7280",
      },
    },
    safety: {
      allergy: "#FF9800", // Orange for allergies
      medication: "#4CAF50", // Green for medications
      allergyBg: "rgba(255, 152, 0, 0.15)", // Light orange background
      medicationBg: "rgba(76, 175, 80, 0.15)", // Light green background
      allergyBorder: "rgba(255, 152, 0, 0.3)", // Orange border
      medicationBorder: "rgba(76, 175, 80, 0.3)", // Green border
    },

    text: {
      primary: "#333333",
      secondary: "#666666",
      tertiary: "#888888", // muted grey
      darkNeutral: "#04061f", // black pearl from App.css
    },
  },
  typography: {
    fontSize: 16,
    fontFamily: "'Lancelot', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    // Poppins for special UI elements (buttons, headers, etc.)
    hero: {
      fontFamily: "'Poppins', 'Inter', 'Roboto', sans-serif",
    },
    // App UI typography variants
    sectionHeader: {
      fontWeight: 600,
      marginTop: 4,
      marginBottom: 2,
    },
    modalTitle: {
      fontWeight: 700,
    },
    fieldLabel: {
      fontWeight: 600,
      marginBottom: 1.5,
    },
    formHelper: {
      marginBottom: 3,
    },
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
      fontFamily: brand.typography.buttonFontFamily,
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
          minHeight: 56,
          paddingLeft: 16,
          paddingRight: 16,
          "@media (min-width:480px)": { minHeight: 60 },
          "@media (min-width:768px)": { minHeight: 72 },
        },
      },
    },
    MuiButton: getMuiButtonTheme(brand),
    MuiIconButton: {
      styleOverrides: {
        root: {
          width: 44,
          height: 44,
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
              borderColor: "#5B8C51",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#5B8C51",
              borderWidth: "2px",
              boxShadow: "0px 0px 0px 3px rgba(91, 140, 81, 0.12)",
            },
            "&.Mui-focused": {
              backgroundColor: "#FFFFFF",
            },
          },
          "& .MuiInputLabel-root": {
            color: "#666666",
            "&.Mui-focused": {
              color: "#5B8C51",
            },
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          "& .MuiTabs-indicator": {
            backgroundColor: "#5B8C51",
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
            color: "#5B8C51",
          },
          "&:hover": {
            backgroundColor: alpha("#5B8C51", 0.06),
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
            backgroundColor: alpha("#5B8C51", 0.05),
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
            backgroundColor: alpha("#5B8C51", 0.08),
          },
          minHeight: 48,
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
          backgroundColor: "#5B8C51",
          color: "#FFFFFF",
          "&:hover": {
            backgroundColor: "#4a7342",
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
          width: "100%",
          padding: "0 16px",
          "@media (min-width:480px)": { padding: "0 20px" },
          "@media (min-width:768px)": { padding: "0 28px" },
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
            color: "#5B8C51",
            fontWeight: 500,
          },
          "& .MuiBreadcrumbs-separator": {
            color: "#5B8C51",
          },
        },
      },
    },
    // Calendar component styling
    MuiCalendar: {
      styleOverrides: {
        root: {
          background: "#EED8C9",
          borderRadius: "16px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)",
          padding: "20px",
          maxWidth: "100%",
          margin: "0 auto",
          "& .rbc-toolbar": {
            backgroundColor: "#FFFFFF",
            padding: "10px",
            borderRadius: "10px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
          },
          "& .rbc-toolbar button": {
            backgroundColor: "#E99787",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "6px",
            padding: "5px 10px",
            fontWeight: "bold",
            transition: "background-color 0.2s ease, box-shadow 0.2s ease",
            "&:hover": {
              backgroundColor: "#d48a7a",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
            },
          },
          "& .rbc-month-view": {
            borderRadius: "10px",
          },
          "& .rbc-date-cell": {
            borderRadius: "8px",
            padding: "5px",
            transition: "background-color 0.2s ease",
            "&:hover": {
              backgroundColor: "transparent !important",
            },
          },
          "& .rbc-day-bg:hover": {
            backgroundColor: "#fce9e5 !important",
          },
          "& .rbc-date-cell--now": {
            backgroundColor: "#A49592",
            borderRadius: "50%",
          },
          "& .rbc-date-cell--active": {
            backgroundColor: "#E99787 !important",
            color: "#FFFFFF !important",
            borderRadius: "50%",
          },
          "& .rbc-header": {
            fontWeight: "bold",
            fontSize: "small",
            color: "#333333",
            padding: "10px",
            textTransform: "uppercase",
            textAlign: "center",
          },
          "& .rbc-day-bg:nth-child(1), & .rbc-day-bg:nth-child(7)": {
            backgroundColor: "#f9f5f2",
            color: "#888888",
          },
          "& .rbc-event": {
            backgroundColor: "#A49592",
            borderRadius: "8px",
            color: "#FFFFFF",
            padding: "5px",
            opacity: 0.9,
          },
          "& .rbc-day-bg.has-event::after": {
            content: "''",
            position: "absolute",
            bottom: "5px",
            right: "5px",
            width: "8px",
            height: "8px",
            backgroundColor: "#EB684A",
            borderRadius: "50%",
          },
          "& .rbc-day-bg.has-progress-note::before": {
            content: "''",
            position: "absolute",
            top: "5px",
            left: "5px",
            width: "8px",
            height: "8px",
            backgroundColor: "#A49592",
            borderRadius: "50%",
          },
          "& .rbc-day-bg.has-sensory-log::after": {
            content: "''",
            position: "absolute",
            top: "5px",
            right: "5px",
            width: "8px",
            height: "8px",
            backgroundColor: "#727077",
            borderRadius: "50%",
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
          position: "sticky",
        },
      },
    },
  },
  spacing: 8,
});

export default theme;
