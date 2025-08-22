import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Badge,
  BottomNavigation,
  BottomNavigationAction,
  Fab
} from '@mui/material';
import {
  Menu as MenuIcon,
  NotificationsNone as NotificationsIcon,
  Home as HomeIcon,
  Timeline as TimelineIcon,
  Person as PersonIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../services/firebase';

const MobileLayout = ({ children, pageTitle, showBottomNav = true }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useAuthState(auth);
  const [navValue, setNavValue] = useState(0);

  // Determine current nav value based on route
  React.useEffect(() => {
    const path = location.pathname;
    if (path === '/dashboard') setNavValue(0);
    else if (path.includes('/child/')) setNavValue(1);
    else if (path === '/profile') setNavValue(2);
  }, [location]);

  const handleNavChange = (event, newValue) => {
    setNavValue(newValue);
    switch (newValue) {
      case 0:
        navigate('/dashboard');
        break;
      case 1:
        // Navigate to timeline/child log - you can customize this
        navigate('/dashboard'); // Or wherever timeline should go
        break;
      case 2:
        navigate('/profile');
        break;
      default:
        break;
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      pb: showBottomNav ? 7 : 0 // Space for bottom navigation
    }}>
      {/* Mobile App Bar */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          bgcolor: 'white',
          color: 'text.primary',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: '56px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton size="small">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {pageTitle || 'CaptureEz'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="small">
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Avatar 
              sx={{ width: 32, height: 32 }}
              src={user?.photoURL}
            >
              {user?.displayName?.[0] || 'U'}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Content */}
      <Box sx={{ p: 2 }}>
        {children}
      </Box>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: showBottomNav ? 80 : 16,
          right: 16,
          zIndex: 1000
        }}
      >
        <AddIcon />
      </Fab>

      {/* Bottom Navigation */}
      {showBottomNav && (
        <BottomNavigation
          value={navValue}
          onChange={handleNavChange}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper'
          }}
        >
          <BottomNavigationAction 
            label="Home" 
            icon={<HomeIcon />} 
          />
          <BottomNavigationAction 
            label="Timeline" 
            icon={<TimelineIcon />} 
          />
          <BottomNavigationAction 
            label="Profile" 
            icon={<PersonIcon />} 
          />
        </BottomNavigation>
      )}
    </Box>
  );
};

export default MobileLayout;