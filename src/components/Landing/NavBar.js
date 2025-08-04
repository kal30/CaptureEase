import React from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
} from "@mui/material";
import NavButton from "./NavButton";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import AvatarMenu from "./AvatarMenu"; // Import the avatar menu component
import logo from "../../assets/image/landing/carelog.png";

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

  return (
    <AppBar
      position="static"
      sx={{
        boxShadow: "none", // Remove shadow for a flat look
        backgroundImage: "linear-gradient(to right, #2A9D8F, #92C7C1)", // Gradient effect using the new primary color
        color: "#fff", // White text for better contrast
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Button
          component={RouterLink}
          to="/"
          sx={{ padding: 0, minWidth: "auto", borderRadius: "50%" }}
        >
          <img
            src={logo}
            alt="Logo"
            style={{ height: "120px", cursor: "pointer" }}
          />
        </Button>

        {/* Navigation Links */}
        <Box sx={{ display: "flex", gap: 4 }}>
          {isLandingPage && (
            <>
              <NavButton text="Features" icon={<HomeIcon />} to="#features" />
              <NavButton text="About Us" icon={<InfoIcon />} to="#about" />
            </>
          )}

          {isLoggedIn && (
            <>
              <NavButton
                text="Dashboard"
                icon={<DashboardIcon />}
                to="/dashboard"
              />
              <NavButton
                text="Care Team"
                icon={<GroupIcon />}
                to="/care-team"
              />
            </>
          )}
        </Box>

        {/* Auth Buttons or Avatar */}
        <Box sx={{ display: "flex", gap: 2 }}>
          {isLoggedIn ? (
            <AvatarMenu user={getAuth().currentUser} />
          ) : (
            <>
              <Button
                variant="outlined"
                component={RouterLink}
                to="/login"
                sx={{
                  borderColor: "#fff", // White border
                  color: "#fff", // White text
                  "&:hover": { borderColor: "#B3E5FC", color: "#B3E5FC" }, // Consistent hover color
                }}
              >
                Login
              </Button>
              <Button
                variant="contained"
                component={RouterLink}
                to="/register"
                sx={{
                  backgroundColor: "#027a79", // Darker teal for prominence
                  color: "#fff",
                  "&:hover": { backgroundColor: "#B3E5FC" }, // Consistent hover color // Slightly darker shade for hover
                }}
              >
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
