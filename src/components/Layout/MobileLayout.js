import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  BottomNavigation,
  BottomNavigationAction,
  Fab
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  Timeline as TimelineIcon,
  Person as PersonIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../services/firebase';
import colors from '../../assets/theme/colors';
import BrandWordmark from '../UI/BrandWordmark';
import { PRODUCT_NAME_TITLE } from '../../constants/config';

const MobileLayout = ({ children, pageTitle, showBottomNav = true }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useAuthState(auth);
  const [navValue, setNavValue] = useState(0);
  const isDashboardRoute = location.pathname.startsWith('/dashboard');
  const isDashboardHome = isDashboardRoute && (!pageTitle || pageTitle === 'Dashboard');

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

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/dashboard');
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      pb: showBottomNav ? 7 : 0 // Space for bottom navigation
    }}>
      {/* Mobile App Bar */}
      <AppBar 
        position={isDashboardRoute ? 'static' : 'sticky'}
        elevation={0}
        sx={{ 
          bgcolor: colors.landing.surface,
          color: colors.landing.heroText,
          borderBottom: `1px solid ${colors.landing.borderLight}`,
          backgroundImage: 'none',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
          pt: 'env(safe-area-inset-top)',
          zIndex: isDashboardRoute ? 'auto' : theme.zIndex.appBar,
        }}
      >
        <Toolbar
          sx={{
            minHeight: '56px !important',
            height: '56px',
            px: 1.25,
          }}
        >
          <Box
            sx={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
              {isDashboardHome ? (
                <BrandWordmark variant="compact" />
              ) : (
                <IconButton
                  onClick={handleBack}
                  aria-label="Go back"
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2.25,
                    bgcolor: colors.landing.surfaceSoft,
                    border: `1px solid ${colors.landing.borderLight}`,
                    boxShadow: '0 4px 10px rgba(15, 23, 42, 0.05)',
                    color: colors.landing.heroText,
                    '&:hover': {
                      bgcolor: colors.landing.panelSoft,
                    },
                  }}
                >
                  <ArrowBackIcon sx={{ fontSize: 20 }} />
                </IconButton>
              )}
            </Box>

            <Typography
              variant="h6"
              noWrap
              sx={{
                textAlign: 'center',
                fontWeight: 700,
                fontSize: '1rem',
                letterSpacing: '-0.015em',
                color: colors.landing.heroText,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {pageTitle || (isDashboardHome ? 'Dashboard' : PRODUCT_NAME_TITLE)}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', minWidth: 0 }}>
              <Avatar
                sx={{ width: 32, height: 32, bgcolor: colors.brand.ink, color: colors.landing.heroText, fontWeight: 700 }}
                src={user?.photoURL}
              >
                {user?.displayName?.[0] || user?.email?.[0] || 'U'}
              </Avatar>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Content */}
      <Box sx={{ p: 2 }}>
        {children}
      </Box>

      {/* Floating Action Button */}
      <Fab
        sx={{
          position: 'fixed',
          bottom: showBottomNav ? 80 : 16,
          right: 16,
          zIndex: 1000
          , bgcolor: colors.brand.ink,
          color: colors.landing.heroText,
          '&:hover': {
            bgcolor: colors.brand.navy,
          }
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
            borderTop: `1px solid ${colors.landing.borderLight}`,
            bgcolor: colors.landing.pageBackground
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
