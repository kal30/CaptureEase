import React, { useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./Routes"; // Import the Routes file
import { Link as RouterLink } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth"; // Firebase auth
import NavButton from "../components/Landing/NavButton";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import "../App.css"; // Your global styles
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme"; // Import your theme
import { auth } from "../services/firebase"; // Firebase config

import logo from "../image/oneMoreLogo.png"; // Import your logo

function App() {
  const [user, setUser] = useState(null); // Track the logged-in user
  const [anchorEl, setAnchorEl] = useState(null); // For avatar menu

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  // Handle avatar menu open/close
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle logout
  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        console.log("User logged out successfully");
        window.location.href = "/login";
      })
      .catch((error) => console.error("Error logging out:", error));
  };

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Box sx={{ flexGrow: 1, backgroundColor: "background.default" }}>
          <AppBar
            position="static"
            color="transparent"
            sx={{
              backgroundColor: "#FFFFFF", // White background for the header
              boxShadow: "none",
              borderBottom: "2px solid transparent", // Gradient as a border
              backgroundImage: "linear-gradient(to right, #E0F7FA, #B2EBF2)", // Gradient effect as a bottom border
              padding: "10px 0",
            }}
          >
            <Toolbar
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {/* Left Side: Logo */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <img
                  src={logo}
                  alt="CaptureEase Logo"
                  style={{ height: "150px" }}
                />
              </Box>

              {/* Center: Navigation Links */}
              <Box sx={{ display: "flex", gap: 4 }}>
                <NavButton
                  text="Features"
                  icon={<HomeIcon />}
                  href="#features"
                />
                <NavButton text="About Us" icon={<InfoIcon />} href="#about" />
                <NavButton
                  text="Contact"
                  icon={<ContactMailIcon />}
                  href="#contact"
                />
              </Box>

              {/* Right Side: Auth Links */}
              <Box sx={{ display: "flex", gap: 2 }}>
                {user ? (
                  <>
                    <IconButton onClick={handleMenuOpen}>
                      <Avatar
                        alt={user.displayName || "User"}
                        src={user.photoURL || "/default-avatar.png"}
                      />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleMenuClose}
                    >
                      <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
                      <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
                      <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu>
                  </>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: "#00CFFF",
                        color: "#fff",
                        fontWeight: "bold",
                        "&:hover": {
                          backgroundColor: "#027a79",
                          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", // Add subtle hover shadow
                        },
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      variant="outlined"
                      component={RouterLink}
                      to="/register"
                      sx={{
                        color: "#49274A",
                        fontWeight: "bold",
                        fontSize: "1rem",
                        borderColor: "#49274A",
                      }}
                    >
                      Register
                    </Button>
                  </>
                )}
              </Box>
            </Toolbar>
          </AppBar>
        </Box>

        {/* Renders the Routes based on AppRoutes */}
        <AppRoutes />
      </Router>
    </ThemeProvider>
  );
}

export default App;
