import React from "react";
import { AppBar, Box, Toolbar } from "@mui/material";
import colors from "../../../assets/theme/colors";

const ResponsiveHeaderBar = ({
  position = "sticky",
  elevation = 0,
  height = 56,
  showSafeArea = true,
  backgroundColor = colors.landing.surface,
  boxShadow = "0 4px 10px rgba(15, 23, 42, 0.05)",
  borderBottom = `1px solid ${colors.landing.borderLight}`,
  children,
  sx = {},
}) => {
  return (
    <AppBar
      position={position}
      elevation={elevation}
      sx={{
        top: 0,
        bgcolor: backgroundColor,
        color: colors.landing.heroText,
        borderBottom,
        backgroundImage: "none",
        boxShadow,
        pt: showSafeArea ? "env(safe-area-inset-top)" : 0,
        zIndex: (theme) => theme.zIndex.appBar,
        ...sx,
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          minHeight: `calc(${height}px + env(safe-area-inset-top))`,
          height: `calc(${height}px + env(safe-area-inset-top))`,
          px: { xs: 1.25, sm: 2, md: 3 },
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            alignItems: "center",
            gap: 1,
            px: "0 !important",
          }}
        >
          {children}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default ResponsiveHeaderBar;
