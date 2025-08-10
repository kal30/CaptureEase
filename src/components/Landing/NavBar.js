import React from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Container,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import NavButton from "./NavButton";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import AvatarMenu from "./AvatarMenu"; // Import the avatar menu component

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

  // Check if we are on the landing page
  const isLandingPage = location.pathname === "/";

  const style = navStyles.current;

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
          maxWidth="lg"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo Text */}
          <Button
            component={RouterLink}
            to="/"
            sx={{
              p: 0,
              pl: 0,
              minWidth: "auto",
              backgroundColor: "transparent",
              "&:hover": { backgroundColor: "transparent", opacity: 0.9 },
              textTransform: "none",
              display: "flex",
              alignItems: "center",
              height: { xs: 32, md: 40 },
              borderRadius: 0,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontFamily:
                  "'Raleway', 'Nunito', 'Poppins', 'Roboto', sans-serif",
                fontWeight: 800,
                letterSpacing: 0.2,
                fontSize: { xs: "1.45rem", md: "1.7rem" },
                display: "flex",
                alignItems: "center",
                height: "100%",
              }}
            >
              <Box component="span" sx={{ color: "#E07A5F", fontWeight: 800 }}>
                Capture
              </Box>
              <Box component="span" sx={{ color: "#5B8C51", fontWeight: 700 }}>
                Ease
              </Box>
              <AssignmentOutlinedIcon
                sx={{
                  fontSize: { xs: 24, md: 28 },
                  verticalAlign: "middle",
                  strokeWidth: 1.5,
                  color: "#E07A5F",
                }}
              />
            </Typography>
          </Button>

          {/* Navigation Links - Right Aligned */}
          <Box
            sx={(theme) => ({
              display: "flex",
              gap: 0.2,
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
            {isLandingPage && (
              <>
                <NavButton
                  text="Features"
                  icon={
                    <HomeIcon
                      sx={{
                        fontSize: { xs: 24, md: 28 },
                        verticalAlign: "middle",
                      }}
                      htmlColor="#E07A5F"
                    />
                  }
                  to="#features"
                />
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
                  to="#about"
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

          {/* Auth Buttons or Avatar */}
          <Box sx={{ display: "flex", gap: 2, ml: 2 }}>
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
                    fontWeight: 750,
                    fontSize: "1rem",
                    borderRadius: "8px",
                    textTransform: "none",
                    px: 3.2,
                    py: 0.95,
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
                    borderRadius: "8px",
                    px: 3,
                    py: 1,
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
