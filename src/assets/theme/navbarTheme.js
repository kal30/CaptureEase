/****
 * Navbar Theme Configuration
 * Centralized styling for navigation bar components
 * Supports multiple style variants and responsive design
 */

import { alpha } from "@mui/material/styles";

// Color schemes for different navbar styles
export const navbarColors = {
  current: {
    appBarBg: "#0a2270",
    textColor: "#c8d9e6",
    hoverColor: "#ffffff",
  },
  pastel: {
    appBarBg: "#c8d9e6",
    textColor: "#081f5c",
    hoverColor: "#ffffff",
  },
  gradient: {
    appBarBg: "linear-gradient(90deg, #081f5c 0%, #c8d9e6 100%)",
    textColor: "#ffffff",
    hoverColor: "#081f5c",
  },
};

// Typography constants
export const navbarFonts = {
  button: '"Harmattan", sans-serif',
  paragraph: '"Lancelot", serif',
};

// Icon styling constants
export const navbarIconStyles = {
  color: "#c8d9e6",
  fontSize: { xs: 20, md: 22 },
  verticalAlign: "middle",
};

// Visual crop for logos with transparent padding
export const logoCropInsets = "inset(5% 2% 5% 2%)"; // top right bottom left

// AppBar base styles (curved, gradient background)
export const appBarStyles = (theme, colorScheme) => ({
  boxShadow: "none",
  background: `linear-gradient(180deg, ${colorScheme.appBarBg} 0%, #02457A 100%)`,
  color: colorScheme.textColor,
  borderBottom: `1px solid ${theme.palette.divider}`,
  borderBottomLeftRadius: "0.75rem",
  borderBottomRightRadius: "0.75rem",
  borderTopLeftRadius: "0.5rem",
  borderTopRightRadius: "0.5rem",
  position: "relative",
  overflow: "hidden",
});

// Toolbar styles
export const toolbarStyles = {
  py: { xs: 1, md: 1.5 },
};

// Container styles for navbar content
export const containerStyles = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  px: { xs: 1, sm: 1.5, md: 3, lg: 4 },
};

// Logo button styles
export const logoButtonStyles = {
  p: 0,
  minWidth: "auto",
  backgroundColor: "transparent",
  "&:hover": { backgroundColor: "transparent" },
  textTransform: "none",
  display: "flex",
  alignItems: "center",
  height: { xs: 48, md: 56, lg: 64 },
  lineHeight: 0,
  borderRadius: 0,
  mr: { xs: 2, md: 4, lg: 6 },
};

// Logo image styles
export const logoImageStyles = {
  height: { xs: 40, sm: 44, md: 48, lg: 56 },
  width: "auto",
  maxHeight: "100%",
  maxWidth: "100%",
  display: "block",
  objectFit: "contain",
  objectPosition: "left center",
  filter:
    "drop-shadow(0 1px 0 rgba(0,0,0,0.12)) drop-shadow(0 2px 4px rgba(0,0,0,0.14))",
  transform: "none",
  m: 0,
  transition: "all 0.2s ease",
  borderRadius: "6px",
  "&:hover": {
    opacity: 0.95,
    transform: "scale(1.01)",
  },
};

// Navigation links container styles
export const navLinksContainerStyles = (theme, isLoggedIn, colorScheme) => ({
  display: { xs: isLoggedIn ? "flex" : "none", md: "flex" },
  gap: { xs: 0.5, md: 2.5 },
  ml: "auto",
  alignItems: "center",
  "& .MuiButton-root": {
    textTransform: "none",
    color: colorScheme.textColor,
    position: "relative",
    backgroundColor: "transparent",
    borderRadius: isLoggedIn ? 999 : 0,
    paddingLeft: isLoggedIn ? theme.spacing(1.25) : undefined,
    paddingRight: isLoggedIn ? theme.spacing(1.25) : undefined,
    boxShadow: "none",
    fontWeight: 600,
    fontSize: { xs: "0.95rem", md: "1.05rem" },
    px: { xs: 1, md: 1.5 },
    "&:hover": {
      backgroundColor: isLoggedIn
        ? alpha(theme.palette.primary.main, 0.08)
        : "transparent",
      color: colorScheme.hoverColor,
    },
    "&:focus": { backgroundColor: "transparent" },
    "&.Mui-focusVisible": { backgroundColor: "transparent" },
    "&:active": { backgroundColor: "transparent" },
    "& .MuiButton-startIcon svg": {
      fill: `${colorScheme.textColor} !important`,
      stroke: `${colorScheme.textColor} !important`,
      color: `${colorScheme.textColor} !important`,
    },
    // Underline effect for logged-out users
    "&::after": !isLoggedIn
      ? {
          content: '""',
          position: "absolute",
          left: 0,
          bottom: -4,
          width: 0,
          height: 2,
          backgroundColor: colorScheme.hoverColor,
          transition: "width 0.3s ease",
        }
      : {},
    "&:hover::after, &:focus::after": !isLoggedIn ? { width: "100%" } : {},
  },
});

// Auth buttons container styles
export const authButtonsContainerStyles = {
  display: "flex",
  gap: { xs: 1, md: 2.5 },
  ml: { xs: 0.5, md: 3 },
  flexShrink: 0, // Prevent shrinking on mobile
};

// Login button styles
export const loginButtonStyles = () => ({
  backgroundColor: "#081f5c",
  color: "#ffffff",
  fontWeight: 600,
  fontFamily: navbarFonts.button,
  fontSize: { xs: "0.9rem", md: "1rem" },
  borderRadius: "8px",
  textTransform: "none",
  px: { xs: 2, md: 3.5 },
  py: { xs: 1, md: 1.2 },
  minWidth: { xs: 80, md: "auto" },
  boxShadow: "0px 2px 8px rgba(8, 31, 92, 0.15)",
  border: "1px solid #081f5c",
  "&:hover": {
    backgroundColor: "#0a2270",
    boxShadow: "0px 4px 12px rgba(8, 31, 92, 0.25)",
    transform: "translateY(-1px)",
  },
});

// Sign up button styles
export const signUpButtonStyles = {
  background: "linear-gradient(135deg, #c8d9e6 0%, #ffffff 100%)",
  color: "#081f5c",
  fontWeight: 600,
  fontFamily: navbarFonts.button,
  fontSize: { xs: "0.9rem", md: "1rem" },
  borderRadius: "8px",
  px: { xs: 2, md: 3.5 },
  py: { xs: 1, md: 1.2 },
  minWidth: { xs: 80, md: "auto" },
  boxShadow: "0px 2px 8px rgba(200, 217, 230, 0.3)",
  border: "1px solid #c8d9e6",
  "&:hover": {
    background: "linear-gradient(135deg, #ffffff 0%, #c8d9e6 100%)",
    boxShadow: "0px 4px 12px rgba(200, 217, 230, 0.4)",
    transform: "translateY(-1px)",
  },
};

// NavButton component styles
export const navButtonStyles = (theme, colorScheme) => ({
  position: "relative",
  fontSize: { xs: "0.95rem", sm: "1.05rem", md: "1.1rem" },
  fontWeight: 500,
  fontFamily: navbarFonts.button,
  transition: "all 0.3s ease",
  padding: { xs: "8px 12px", md: "10px 16px" },
  color: colorScheme.textColor,
  display: "flex",
  alignItems: "center",
  backgroundColor: "transparent",
  boxShadow: "none",
  borderRadius: "8px",
  textTransform: "none",

  "& .MuiSvgIcon-root": {
    opacity: 0.7,
    transition: "all 0.3s ease",
    marginRight: "6px",
    color: navbarIconStyles.color,
    fontSize: navbarIconStyles.fontSize,
  },

  "&:hover": {
    backgroundColor: alpha(colorScheme.textColor, 0.08),
    color: colorScheme.hoverColor,
    boxShadow: `0px 2px 8px ${alpha(colorScheme.textColor, 0.1)}`,
    transform: "translateY(-1px)",

    "& .MuiSvgIcon-root": {
      opacity: 1,
      transform: "scale(1.1)",
    },
  },

  "&::after": {
    content: '""',
    position: "absolute",
    width: "0",
    height: "3px",
    left: "50%",
    bottom: "-2px",
    backgroundColor: colorScheme.hoverColor,
    transition: "all 0.3s ease",
    borderRadius: "2px",
  },

  "&:hover::after": {
    width: "80%",
    left: "10%",
  },
});

// Default color scheme selector
export const getNavbarColorScheme = (variant = "current") => {
  return navbarColors[variant] || navbarColors.current;
};
