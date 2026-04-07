import React from "react";
import { AppBar, Toolbar, Button, Box, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import colors from "../../assets/theme/colors";

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
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
            <Typography
              component="span"
              sx={{
                fontSize: { xs: "1.45rem", md: "1.7rem" },
                fontWeight: 700,
                letterSpacing: "-0.05em",
                color: colors.landing.heroText,
                textTransform: "lowercase",
                lineHeight: 1,
              }}
            >
              lifelog
            </Typography>
            <Box
              component="span"
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: colors.brand.ink,
                boxShadow: `0 0 0 4px ${colors.brand.ink}22`,
              }}
            />
          </Box>
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default MinimalHeader;
