import { createTheme } from "@mui/material/styles";
import { themeRoles, getRoleColor } from "./roleColors";
import { alpha } from "@mui/material/styles";
import brand from "./brand";
import getMuiButtonTheme from "./components/buttonTheme";
import colors from "./colors";

const theme = createTheme({
  breakpoints: { values: { xs: 0, sm: 480, md: 768, lg: 1200, xl: 1536 } },

  palette: {
    mode: "light",
    background: {
      default: colors.landing.pageBackground,
      paper: colors.semantic.surface,
      container: colors.app.container,
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
    success: {
      main: colors.semantic.success,
    },
    tertiary: {
      main: colors.app.tertiary.main,
      light: colors.app.tertiary.light,
      dark: colors.app.tertiary.dark,
    },
    calendar: {
      background: colors.app.calendar.background,
      accent: colors.app.calendar.accent,
      accentHover: colors.app.calendar.accentHover,
      weekendBg: colors.app.calendar.weekendBg,
      eventDot: colors.app.calendar.eventDot,
      todayBg: colors.app.calendar.todayBg,
      hoverBg: colors.app.calendar.hoverBg,
    },
    dailyCare: {
      primary: colors.app.dailyCare.primary,
      light: colors.app.dailyCare.light,
      dark: colors.app.dailyCare.dark,
      background: colors.app.dailyCare.background,
      hover: colors.app.dailyCare.hover,
    },
    journal: {
      chipBg: colors.app.journal.chipBg,
      hoverIcon: colors.app.journal.hoverIcon,
      deleteHover: colors.app.journal.deleteHover,
    },
    behavior: {
      primary: colors.app.behavior.primary,
      light: colors.app.behavior.light,
      dark: colors.app.behavior.dark,
      background: colors.app.behavior.background,
      hover: colors.app.behavior.hover,
    },
    performance: {
      primary: colors.app.performance.primary,
      light: colors.app.performance.light,
      dark: colors.app.performance.dark,
      background: colors.app.performance.background,
      hover: colors.app.performance.hover,
    },
    timeline: {
      progress: colors.app.dailyCare.primary,
      background: colors.app.dailyCare.progressBackground,
      border: colors.app.dailyCare.progressBorder,
      entries: {
        incident: colors.app.timeline.incident,
        dailyHabit: colors.app.timeline.dailyHabit,
        journal: colors.app.timeline.journal,
        therapyNote: getRoleColor("therapist", "primary"),
      },
      periods: {
        morning: colors.app.timeline.morning,
        afternoon: colors.app.timeline.afternoon,
        evening: colors.app.timeline.evening,
      },
    },
    incident: {
      // Base incident type colors for chips/buttons
      types: {
        eating_nutrition: colors.app.incident.eatingNutrition,
        mood: colors.app.incident.mood,
        sleep: colors.app.incident.sleep,
        behavioral: colors.app.incident.behavioral,
        sensory: colors.app.incident.sensory,
        pain_medical: colors.app.incident.painMedical,
        other: colors.app.incident.other,
      },
    },
    safety: {
      allergy: colors.app.safety.allergy,
      medication: colors.app.safety.medication,
      allergyBg: colors.app.safety.allergyBg,
      medicationBg: colors.app.safety.medicationBg,
      allergyBorder: colors.app.safety.allergyBorder,
      medicationBorder: colors.app.safety.medicationBorder,
    },
    // Role-based colors for care team members
    roles: themeRoles,
    text: {
      primary: colors.landing.bodyText,
      secondary: colors.app.text.secondary,
      tertiary: colors.semantic.neutral, // muted grey
      darkNeutral: colors.app.text.darkNeutral,
    },
  },
  typography: {
    fontSize: 16,
    fontFamily: "'Outfit', sans-serif",
    allVariants: {
      letterSpacing: '-0.015em',
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
      fontWeight: 800,
      lineHeight: 1.2,
      letterSpacing: "-0.02em",
      color: colors.landing.bodyText,
    },
    h2: {
      fontSize: {
        xs: "1.75rem",
        sm: "2rem",
        md: "2.25rem",
        lg: "2.5rem",
      },
      fontWeight: 800,
      lineHeight: 1.3,
      letterSpacing: "-0.02em",
      color: colors.landing.bodyText,
    },
    h3: {
      fontSize: {
        xs: "1.5rem",
        sm: "1.75rem",
        md: "2rem",
      },
      fontWeight: 800,
      lineHeight: 1.4,
      letterSpacing: "-0.02em",
      color: colors.landing.bodyText,
    },
    h4: {
      fontSize: {
        xs: "1.25rem",
        sm: "1.5rem",
        md: "1.75rem",
      },
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: "-0.02em",
      color: colors.landing.bodyText,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: "-0.02em",
      color: colors.landing.bodyText,
    },
    h6: {
      fontSize: "1.125rem",
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: "-0.02em",
      color: colors.landing.bodyText,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
      fontWeight: 400,
      color: colors.landing.bodyText,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.5,
      fontWeight: 400,
      color: colors.semantic.neutral,
    },
    button: {
      textTransform: "none",
      fontSize: "0.95rem",
      fontWeight: 600,
      letterSpacing: "-0.01em",
      fontFamily: brand.typography.buttonFontFamily,
    },
    caption: {
      fontSize: "0.75rem",
      lineHeight: 1.4,
      color: colors.semantic.neutral,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colors.landing.pageBackground,
          fontFamily: "'Outfit', sans-serif",
        },
      },
    },
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
          borderRadius: "12px",
          backgroundColor: colors.app.cards.background,
          border: `1px solid ${colors.landing.borderLight}`,
          boxShadow: `0 4px 6px -1px ${colors.app.cards.shadowSoft}`,
          transition: "box-shadow 120ms ease",
          "&:hover": {
            boxShadow: `0 8px 16px -4px ${colors.app.cards.shadowHover}`,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          backgroundColor: colors.app.cards.background,
          border: `1px solid ${colors.landing.borderLight}`,
          boxShadow: `0 4px 6px -1px ${colors.app.cards.shadowPanel}`,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            backgroundColor: colors.app.cards.background,
            transition: "all 0.2s ease-in-out",
            "& fieldset": {
              borderColor: colors.app.cards.border,
              borderWidth: "2px",
            },
            "&:hover fieldset": {
              borderColor: brand.palette.primary.main,
            },
            "&.Mui-focused fieldset": {
              borderColor: brand.palette.primary.main,
              borderWidth: "2px",
              boxShadow: `0px 0px 0px 3px ${alpha(brand.palette.primary.main, 0.12)}`,
            },
            "&.Mui-focused": {
              backgroundColor: colors.app.cards.background,
            },
          },
          "& .MuiInputLabel-root": {
            color: colors.app.text.secondary,
            "&.Mui-focused": {
              color: brand.palette.primary.main,
            },
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          "& .MuiTabs-indicator": {
            backgroundColor: brand.palette.primary.main,
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
          color: colors.app.text.secondary,
          "&.Mui-selected": {
            color: brand.palette.primary.main,
          },
          "&:hover": {
            backgroundColor: alpha(brand.palette.primary.main, 0.06),
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
            backgroundColor: alpha(brand.palette.primary.main, 0.05),
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
            backgroundColor: alpha(brand.palette.primary.main, 0.08),
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
          backgroundColor: brand.palette.primary.main,
          color: colors.semantic.surface,
          "&:hover": {
            backgroundColor: brand.palette.primary.dark,
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          boxShadow: `0 2px 6px ${colors.app.cards.shadowSoft}`,
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
          backgroundColor: colors.app.cards.background,
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
            boxShadow: `0px 25px 50px ${colors.app.cards.modalShadow}`,
            border: `1px solid ${colors.app.cards.border}`,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: "20px",
          boxShadow: `0px 25px 50px ${colors.app.cards.modalShadow}`,
          border: `1px solid ${colors.app.cards.border}`,
        },
      },
    },
    MuiBreadcrumbs: {
      styleOverrides: {
        root: {
          "& .MuiBreadcrumbs-ol": {
            color: brand.palette.primary.main,
            fontWeight: 500,
          },
          "& .MuiBreadcrumbs-separator": {
            color: brand.palette.primary.main,
          },
        },
      },
    },
    // Calendar component styling
    MuiCalendar: {
      styleOverrides: {
        root: {
          background: colors.app.calendar.background,
          borderRadius: "16px",
          boxShadow: `0 4px 10px ${colors.app.cards.shadowMedium}`,
          padding: "20px",
          maxWidth: "100%",
          margin: "0 auto",
          "& .rbc-toolbar": {
            backgroundColor: colors.app.cards.background,
            padding: "10px",
            borderRadius: "10px",
            boxShadow: `0 2px 8px ${colors.app.cards.shadowPanel}`,
          },
          "& .rbc-toolbar button": {
            backgroundColor: colors.app.calendar.accent,
            color: colors.semantic.surface,
            border: "none",
            borderRadius: "6px",
            padding: "5px 10px",
            fontWeight: "bold",
            transition: "background-color 0.2s ease, box-shadow 0.2s ease",
            "&:hover": {
              backgroundColor: colors.app.calendar.accentHover,
              boxShadow: `0 2px 5px ${colors.app.cards.shadowHover}`,
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
            backgroundColor: `${colors.app.calendar.hoverBg} !important`,
          },
          "& .rbc-date-cell--now": {
            backgroundColor: colors.app.calendar.todayBg,
            borderRadius: "50%",
          },
          "& .rbc-date-cell--active": {
            backgroundColor: `${colors.app.calendar.accent} !important`,
            color: `${colors.semantic.surface} !important`,
            borderRadius: "50%",
          },
          "& .rbc-header": {
            fontWeight: "bold",
            fontSize: "small",
            color: colors.app.calendar.headerText,
            padding: "10px",
            textTransform: "uppercase",
            textAlign: "center",
          },
          "& .rbc-day-bg:nth-child(1), & .rbc-day-bg:nth-child(7)": {
            backgroundColor: colors.app.calendar.weekendBg,
            color: colors.app.text.muted,
          },
          "& .rbc-event": {
            backgroundColor: colors.app.calendar.todayBg,
            borderRadius: "8px",
            color: colors.semantic.surface,
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
            backgroundColor: colors.app.calendar.eventDot,
            borderRadius: "50%",
          },
          "& .rbc-day-bg.has-progress-note::before": {
            content: "''",
            position: "absolute",
            top: "5px",
            left: "5px",
            width: "8px",
            height: "8px",
            backgroundColor: colors.app.calendar.todayBg,
            borderRadius: "50%",
          },
          "& .rbc-day-bg.has-sensory-log::after": {
            content: "''",
            position: "absolute",
            top: "5px",
            right: "5px",
            width: "8px",
            height: "8px",
            backgroundColor: colors.app.tertiary.dark,
            borderRadius: "50%",
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.app.container,
          color: colors.app.text.strong,
          boxShadow: "none",
          borderBottom: `1px solid ${colors.app.cards.border}`,
          backgroundImage: "none",
          position: "sticky",
        },
      },
    },
  },
  spacing: 8,
});

export default theme;
