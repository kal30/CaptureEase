import React from "react";
import { Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { navButtonStyles, getNavbarColorScheme } from "../../assets/theme/navbarTheme";

// NavButton Component
const NavButton = ({ text, icon, to }) => {
  const theme = useTheme();
  const colorScheme = getNavbarColorScheme("current");

  return (
    <Button
      component={RouterLink}
      to={to}
      sx={navButtonStyles(theme, colorScheme)}
    >
      {icon}
      {text}
    </Button>
  );
};

export default NavButton;
