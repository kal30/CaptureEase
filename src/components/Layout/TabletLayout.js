import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  NotificationsNone as NotificationsIcon,
  Settings as SettingsIcon,
  Home as HomeIcon,
  Timeline as TimelineIcon,
  Person as PersonIcon,
  ChildCare as ChildIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../services/firebase';

const DRAWER_WIDTH = 240;

const TabletLayout = ({ children, pageTitle, showSidebar = true }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useAuthState(auth);

  const navigationItems = [
    { label: 'Dashboard', icon: <HomeIcon />, path: '/dashboard' },
    { label: 'Timeline', icon: <TimelineIcon />, path: '/timeline' },
    { label: 'Children', icon: <ChildIcon />, path: '/children' },
    { label: 'Profile', icon: <PersonIcon />, path: '/profile' },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Tablet Sidebar */}
      {showSidebar && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: `1px solid ${theme.palette.divider}`,
              bgcolor: 'background.paper'
            },
          }}
        >
          {/* Sidebar Header */}
          <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
              CaptureEz
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {pageTitle}
            </Typography>
          </Box>

          {/* User Profile Section */}
          <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar 
                sx={{ width: 40, height: 40 }}
                src={user?.photoURL}
              >
                {user?.displayName?.[0] || 'U'}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {user?.displayName || 'User'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Tablet View
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Navigation */}
          <List sx={{ flex: 1, pt: 2 }}>
            {navigationItems.map((item) => (
              <ListItem
                key={item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  cursor: 'pointer',
                  mx: 1,
                  borderRadius: 1,
                  bgcolor: location.pathname === item.path ? 'primary.light' + '20' : 'transparent',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  sx={{ 
                    '& .MuiListItemText-primary': {
                      fontWeight: location.pathname === item.path ? 600 : 400,
                      color: location.pathname === item.path ? 'primary.main' : 'text.primary'
                    }
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Drawer>
      )}

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Tablet App Bar */}
        <AppBar 
          position="static" 
          elevation={0}
          sx={{ 
            bgcolor: 'white',
            color: 'text.primary',
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
              {pageTitle || 'Dashboard'}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton>
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              <IconButton>
                <SettingsIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Tablet Content */}
        <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default TabletLayout;