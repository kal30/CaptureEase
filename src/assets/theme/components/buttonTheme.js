import { alpha } from "@mui/material/styles";

// Returns MUI Button component overrides built from brand tokens
const getMuiButtonTheme = (brand) => ({
  styleOverrides: {
    root: {
      borderRadius: `${brand.radii.button}px`,
      padding: "12px 24px",
      fontSize: "0.95rem",
      fontWeight: 600,
      textTransform: "none",
      transition: "background-color 120ms ease, transform 120ms ease",
      minHeight: 44,
      fontFamily: brand.typography.buttonFontFamily,
    },
    containedPrimary: {
      background: brand.palette.primary.main,
      color: "#FFFFFF",
      "&:hover": {
        background: brand.palette.primary.dark,
      },
    },
    containedSecondary: {
      background: brand.palette.secondary.main,
      color: brand.palette.primary.main,
      "&:hover": {
        background: brand.palette.secondary.light,
      },
    },
    outlined: {
      borderWidth: "2px",
      borderColor: brand.palette.primary.main,
      color: brand.palette.primary.main,
      "&:hover": {
        borderWidth: "2px",
        borderColor: brand.palette.primary.dark,
        backgroundColor: alpha(brand.palette.primary.main, 0.1),
      },
    },
    text: {
      "&:hover": {
        backgroundColor: alpha(brand.palette.primary.main, 0.1),
      },
    },
  },
});

export default getMuiButtonTheme;
