import { alpha } from "@mui/material/styles";

// Breadcrumbs theme helpers built from the active MUI theme
export const containerStyles = (theme) => ({
  backgroundColor: theme.palette.background.default,
  borderBottom: "none",
  padding: "20px 0",
  marginBottom: 2,
  position: "relative",
});

export const listStyles = {
  "& ol": {
    display: "flex",
    flexWrap: "nowrap",
    alignItems: "center",
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  "& li": {
    display: "flex",
    alignItems: "center",
  },
};

export const linkStyles = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: 0.5,
  color: theme.palette.primary.main,
  fontWeight: 500,
  textDecoration: "none",
  "&:hover": {
    color: theme.palette.primary.dark,
    textDecoration: "underline",
    backgroundColor: "transparent",
  },
});

export const homeIconStyles = (theme) => ({
  fontSize: 18,
  color: theme.palette.primary.main,
});

export const parentTextStyles = (theme) => ({
  fontWeight: 500,
  color: theme.palette.text.secondary,
});

export const activeTextStyles = (theme) => ({
  fontWeight: 600,
  color: theme.palette.text.primary,
});

export const separatorIconStyles = (theme) => ({
  color: alpha(theme.palette.text.secondary, 0.9),
});

