import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import AppRoutes from './Routes';  // Import the new Routes file
import { AppBar, Toolbar, Button, Typography, Box } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme'

function App() {
  return (
    <ThemeProvider theme={theme}>  {/* Wrap the app in ThemeProvider */}
      <Router>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static" color="primary">  {/* Use primary color from theme */}
            <Toolbar>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                CaptureEase
              </Typography>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
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