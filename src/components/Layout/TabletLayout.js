import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  NotificationsNone as NotificationsIcon,
  Settings as SettingsIcon,
  Home as HomeIcon,
  Timeline as TimelineIcon,
  Person as PersonIcon,
  ChildCare as ChildIcon
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles'; // Import alpha
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../services/firebase';
import colors from '../../assets/theme/colors';
import { PRODUCT_NAME_TITLE } from '../../constants/config';
import ResponsiveHeaderBar from './shared/ResponsiveHeaderBar';
import PWAUpdateBanner from '../UI/PWAUpdateBanner';

const DRAWER_WIDTH = 240;

const TabletLayout = ({ children, pageTitle, showSidebar = true }) => {
  const theme = useTheme();
  const { t } = useTranslation(['nav', 'terms']);
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useAuthState(auth);

  const navigationItems = [
    { label: t('nav:dashboard'), icon: <HomeIcon />, path: '/dashboard' },
    { label: t('nav:timeline'), icon: <TimelineIcon />, path: '/timeline' },
    { label: t('nav:profiles'), icon: <ChildIcon />, path: '/children' },
    { label: t('nav:profile'), icon: <PersonIcon />, path: '/profile' },
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
              borderRight: `1px solid ${colors.landing.borderLight}`,
              bgcolor: colors.landing.pageBackground,
            },
          }}
        >
          {/* Sidebar Header */}
          <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: colors.landing.heroText }}>
              {PRODUCT_NAME_TITLE}
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
                  bgcolor: location.pathname === item.path ? alpha(theme.palette.primary.light, 0.2) : 'transparent',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <ListItemIcon sx={{ color: location.pathname === item.path ? theme.palette.primary.main : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  sx={{ 
                    '& .MuiListItemText-primary': {
                      fontWeight: location.pathname === item.path ? 600 : 400,
                      color: location.pathname === item.path ? theme.palette.primary.main : 'text.primary'
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
        <ResponsiveHeaderBar
          position="static"
          height={56}
          backgroundColor={colors.landing.pageBackground}
          boxShadow="0 4px 16px rgba(15, 23, 42, 0.05)"
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: colors.landing.heroText }}>
            {pageTitle || t('nav:dashboard')}
          </Typography>

          <Box />

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
        </ResponsiveHeaderBar>

        <PWAUpdateBanner />

        {/* Tablet Content */}
        <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default TabletLayout;
