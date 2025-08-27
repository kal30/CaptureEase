import React from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import { AppBar, Toolbar, Button, Box, Container } from "@mui/material";
import { alpha } from "@mui/material/styles";
import NavButton from "./NavButton";
import InfoIcon from "@mui/icons-material/Info";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import AvatarMenu from "./AvatarMenu"; // Import the avatar menu component
import Wordmark from "../../assets/image/logo/logo-transparent.png";

const navStyles = {
  current: {
    appBarBg: "#F5F3EE",
    textColor: "#2F3A3A",
    hoverColor: "#1F2A2A",
  },
  pastel: {
    appBarBg: "#FDF6F0",
    textColor: "#6B4F4F",
    hoverColor: "#B75C3B",
  },
  gradient: {
    appBarBg: "linear-gradient(90deg, #E07A5F 0%, #F4A261 100%)",
    textColor: "#fff",
    hoverColor: "#FFDAB9",
  },
};

const Navbar = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const style = navStyles.pastel;

  return (
    <AppBar
      position="static"
      sx={{
        boxShadow: "none",
        background: style.appBarBg,
        color: style.textColor,
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar sx={{ py: { xs: 1, md: 1.5 } }}>
        <Container
          maxWidth="xl"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: { xs: 1, sm: 1.5, md: 3, lg: 4 },
          }}
        >
          {/* Logo Text */}
          <Button
            component={RouterLink}
            to="/"
            aria-label="CaptureEz home"
            sx={{
              p: 0,
              minWidth: "auto",
              backgroundColor: "transparent",
              "&:hover": { backgroundColor: "transparent" },
              textTransform: "none",
              display: "flex",
              alignItems: "center",
              height: { xs: 36, md: 44 },
              borderRadius: 0,
              mr: { xs: 1, md: 4, lg: 6 },
            }}
          >
            <Box
              component="img"
              src={Wordmark}
              alt="CaptureEz"
              sx={{
                width: { xs: 100, sm: 130, md: 200, lg: 240, xl: 280 },
                maxWidth: { xs: "45vw", md: "70vw" },
                height: "auto",
                display: "block",
                objectFit: "contain",
                objectPosition: "left center",
                transform: "none",
                m: 0,
                transition: "height 0.2s ease",
              }}
            />
          </Button>

          {/* Navigation Links - Hidden on mobile when logged out */}
          <Box
            sx={(theme) => ({
              display: { xs: isLoggedIn ? "flex" : "none", md: "flex" },
              gap: { xs: 0.5, md: 2.5 },
              ml: "auto",
              alignItems: "center",
              "& .MuiButton-root": {
                textTransform: "none",
                color: style.textColor,
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
                },
                "&:focus": { backgroundColor: "transparent" },
                "&.Mui-focusVisible": { backgroundColor: "transparent" },
                "&:active": { backgroundColor: "transparent" },
                "& .MuiButton-startIcon svg": {
                  fill: "#E07A5F !important",
                  stroke: "#E07A5F !important",
                  color: "#E07A5F !important",
                },
                // Underline only for logged-out style
                "&::after": !isLoggedIn
                  ? {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      bottom: -4,
                      width: 0,
                      height: 2,
                      backgroundColor: "#E07A5F",
                      transition: "width 0.3s ease",
                    }
                  : {},
                "&:hover::after, &:focus::after": !isLoggedIn
                  ? { width: "100%" }
                  : {},
              },
              "& .MuiButton-root:hover": {
                color: style.hoverColor,
              },
            })}
          >
            {!isLoggedIn && (
              <>
                <NavButton
                  text="About Us"
                  icon={
                    <InfoIcon
                      sx={{
                        fontSize: { xs: 24, md: 28 },
                        verticalAlign: "middle",
                      }}
                      htmlColor="#E07A5F"
                    />
                  }
                  to="/about"
                />
              </>
            )}

            {isLoggedIn && (
              <>
                <NavButton
                  text="Dashboard"
                  icon={
                    <DashboardIcon
                      sx={{
                        fontSize: { xs: 24, md: 28 },
                        verticalAlign: "middle",
                      }}
                      htmlColor="#E07A5F"
                    />
                  }
                  to="/dashboard"
                />
                <NavButton
                  text="Care Team"
                  icon={
                    <GroupIcon
                      sx={{
                        fontSize: { xs: 24, md: 28 },
                        verticalAlign: "middle",
                      }}
                      htmlColor="#E07A5F"
                    />
                  }
                  to="/care-team"
                />
              </>
            )}
          </Box>

          {/* Auth Buttons or Avatar - Mobile optimized */}
          <Box 
            sx={{ 
              display: "flex", 
              gap: { xs: 1, md: 2.5 }, 
              ml: { xs: 0.5, md: 3 },
              flexShrink: 0 // Prevent shrinking on mobile
            }}
          >
            {isLoggedIn ? (
              <AvatarMenu user={getAuth().currentUser} />
            ) : (
              <>
                <Button
                  variant="contained"
                  component={RouterLink}
                  to="/login"
                  sx={{
                    backgroundColor: (theme) => alpha("#E07A5F", 0.12),
                    color: "#B75C3B",
                    fontWeight: 700,
                    fontSize: { xs: "0.875rem", md: "1rem" },
                    borderRadius: "8px",
                    textTransform: "none",
                    px: { xs: 1.5, md: 3.2 },
                    py: { xs: 0.75, md: 0.95 },
                    minWidth: { xs: 60, md: "auto" },
                    boxShadow: "none",
                    border: (theme) => `1px solid ${alpha("#E07A5F", 0.3)}`,
                    "&:hover": {
                      backgroundColor: (theme) => alpha("#E07A5F", 0.2),
                      boxShadow: "none",
                    },
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  component={RouterLink}
                  to="/register"
                  sx={{
                    background:
                      "linear-gradient(135deg, #E07A5F 0%, #F7B267 100%)",
                    color: "#fff",
                    fontWeight: 500,
                    fontSize: { xs: "0.875rem", md: "1rem" },
                    borderRadius: "8px",
                    px: { xs: 1.5, md: 3.25 },
                    py: { xs: 0.75, md: 1 },
                    minWidth: { xs: 70, md: "auto" },
                    boxShadow: "0px 2px 4px rgba(224, 122, 95, 0.12)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #B75C3B 0%, #F4A261 100%)",
                      boxShadow: "0px 4px 8px rgba(224, 122, 95, 0.18)",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Box>
        </Container>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
