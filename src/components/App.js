import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import AppRoutes from './Routes';  // Import the new Routes file
import { AppBar, Toolbar, Button, Typography, Box, Avatar, Menu, MenuItem, IconButton } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import { auth } from '../services/firebase';  // Import Firebase authentication

function App() {
  const [user, setUser] = useState(null);  // Track the logged-in user
  const [anchorEl, setAnchorEl] = useState(null);  // State for controlling the dropdown menu

  useEffect(() => {
    // Firebase listener to track authentication state
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();  // Cleanup listener on component unmount
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
  const handleLogout = () => {
    auth.signOut();
    handleMenuClose();
  };

  return (
    <ThemeProvider theme={theme}>  {/* Wrap the app in ThemeProvider */}
      <Router>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static" color="primary">  {/* Use primary color from theme */}
            <Toolbar>
              <Typography variant="h4" sx={{ flexGrow: 1, color:'whitesmoke' }}>
                CaptureEase
              </Typography>

              {/* If the user is logged in, show avatar and menu */}
              {user ? (
                <>
                  <IconButton onClick={handleMenuOpen}>
                    <Avatar alt={user.displayName || "User"} src={user.photoURL || "/default-avatar.png"} />
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
                  <Button color="inherit" component={Link} to="/login">
                    Login
                  </Button>
                  <Button color="inherit" component={Link} to="/register">
                    Register
                  </Button>
                </>
              )}
            </Toolbar>
          </AppBar>
        </Box>

        {/* Render all routes */}
        <AppRoutes />
      </Router>
    </ThemeProvider>
  );
}

export default App;