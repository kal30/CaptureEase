import React, { useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./Routes"; // Import the Routes file
import { Link as RouterLink } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth"; // Make sure to import these functions
import "../App.css";
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme";
import { auth } from "../services/firebase"; // Import Firebase authentication

// Import your logo
import logo from "../image/niceLogo.png";
import captureEase from "../image/captureEaseImage.png";

function App() {
  const [user, setUser] = useState(null); // Track the logged-in user
  const [anchorEl, setAnchorEl] = useState(null); // State for controlling the dropdown menu

  useEffect(() => {
    // Firebase listener to track authentication state
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, []);

  // Handle opening the avatar menu
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle closing the avatar menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle logging out
  // const handleLogout = () => {
  //   auth.signOut();
  //   handleMenuClose();
  // };

  const handleLogout = () => {
    const auth = getAuth(); // Get the authentication instance

    signOut(auth)
      .then(() => {
        console.log("User logged out successfully");
        // Redirect or update UI after logout
        window.location.href = "/login"; // Redirect to login page (or any other route)
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Box sx={{ flexGrow: 1 }}>
          {/* Updated AppBar to include the logo */}
          <AppBar
            position="static"
            color="transparent"
            sx={{ backgroundColor: "#ffff", boxShadow: "none", padding: 0 }}
          >
            <Toolbar
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {/* Use a smaller logo inline with the app name */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <img
                  src={logo}
                  alt="CaptureEase Logo"
                  style={{ height: "150px" }}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  mt: 5,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <Typography
                    variant="h1"
                    sx={{
                      fontWeight: 900,
                      letterSpacing: "0.05em",
                    }}
                  >
                    <span style={{ color: "#df4c0a" }}>Capture</span>
                    <span style={{ color: "#661f8d" }}>Ease</span>
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 500,
                      color: "#006400",
                      fontFamily: "'Brush Script MT', cursive", // Cursive font
                      // letterSpacing: "normal", // Normal spacing for cursive
                      // mt: 0.5, // Reduced margin to decrease the gap
                    }}
                  >
                    Caring made simple
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                {/* If the user is logged in, show avatar and menu */}
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
                    {/* If the user is logged out, show Login and Register */}
                    <Button
                      color="inherit"
                      component={RouterLink}
                      to="/login"
                      sx={{
                        color: "#49274A",
                        fontWeight: "bold",
                        fontSize: "1rem",
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      color="inherit"
                      component={RouterLink}
                      to="/register"
                      sx={{
                        color: "#49274A",
                        fontWeight: "bold",
                        fontSize: "1rem",
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
        <AppRoutes />
      </Router>
    </ThemeProvider>
  );
}

export default App;
