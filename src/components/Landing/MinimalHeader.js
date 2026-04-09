import React from "react";
import { AppBar, Toolbar, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import colors from "../../assets/theme/colors";
import BrandWordmark from "../UI/BrandWordmark";

const MinimalHeader = () => {
  return (
    <AppBar
      position="static"
      sx={{
        boxShadow: "none",
        backgroundColor: colors.landing.pageBackground,
        backgroundImage: `linear-gradient(180deg, ${colors.landing.pageBackground} 0%, ${colors.landing.panelSoft} 100%)`,
        borderBottom: `1px solid ${colors.landing.borderLight}`,
      }}
    >
      <Toolbar
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Button
          component={RouterLink}
          to="/"
          sx={{ padding: 0, minWidth: "auto", borderRadius: 0, textTransform: "none" }}
        >
          <BrandWordmark variant="minimal" showDot />
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default MinimalHeader;
