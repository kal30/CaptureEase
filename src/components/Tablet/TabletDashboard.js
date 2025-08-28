import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Drawer,
  Toolbar,
  AppBar,
  IconButton,
  Badge
} from '@mui/material';
import {
  NotificationsNone as NotificationsIcon,
  Settings as SettingsIcon,
  ChildCare as ChildIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';

const DRAWER_WIDTH = 280;

// Helper to safely resolve color strings like 'primary.main' from the theme
const resolveColor = (theme, colorString) => {
  if (!colorString || typeof colorString !== 'string') return theme.palette.text.primary;
  const path = colorString.split('.');
  let color = theme.palette;
  for (let key of path) {
    if (color[key] === undefined) return theme.palette.text.primary; // Fallback
    color = color[key];
  }
  return color;
};

const TabletDashboard = ({ children, user }) => {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Tablet Sidebar */}
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
          <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
            CaptureEz
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tablet Dashboard
          </Typography>
        </Box>

        {/* User Profile Section */}
        <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              sx={{ width: 48, height: 48 }}
              src={user?.photoURL}
            >
              {user?.displayName?.[0]}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {user?.displayName || 'User'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {children?.length || 0} children
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Navigation Stats */}
        <Box sx={{ p: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
            QUICK STATS
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { label: 'Total Entries', value: '156', icon: <TimelineIcon />, color: 'primary.main' },
              { label: 'This Week', value: '12', icon: <TrendingIcon />, color: 'success.main' },
              { label: 'Children', value: children?.length || 0, icon: <ChildIcon />, color: 'warning.main' }
            ].map((stat, index) => {
              const resolvedStatColor = resolveColor(theme, stat.color);
              return (
                <Card 
                  key={index}
                  elevation={0}
                  sx={{ 
                    bgcolor: alpha(resolvedStatColor, 0.08),
                    border: `1px solid ${alpha(resolvedStatColor, 0.2)}`
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ color: resolvedStatColor }}>
                        {stat.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {stat.value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {stat.label}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Box>
      </Drawer>

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
              Dashboard Overview
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

        {/* Tablet Content Grid */}
        <Box sx={{ flex: 1, p: 3 }}>
          <Grid container spacing={3}>
            {/* Children Grid - Tablet Optimized */}
            <Grid item xs={12} lg={8}>
              <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, height: 'fit-content' }}>
                <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Your Children
                  </Typography>
                </Box>
                
                <Grid container spacing={0}>
                  {children?.map((child, index) => (
                    <Grid item xs={6} key={child.id}>
                      <Box
                        sx={{
                          p: 3,
                          borderRight: index % 2 === 0 ? `1px solid ${theme.palette.divider}` : 'none',
                          borderBottom: index < children.length - 2 ? `1px solid ${theme.palette.divider}` : 'none',
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: 'action.hover'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: theme.palette.primary.main,
                              width: 56,
                              height: 56
                            }}
                          >
                            {child.name[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {child.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Age: {child.age}
                            </Typography>
                            <Typography variant="caption" color="success.main">
                              Last entry: 2 hours ago
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>

            {/* Activity Feed - Tablet Sidebar */}
            <Grid item xs={12} lg={4}>
              <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Recent Activity
                  </Typography>
                </Box>
                
                <List sx={{ p: 0 }}>
                  {[
                    { type: 'mood', time: '2h ago', child: 'Emma', content: 'Happy mood logged', color: 'success.main' },
                    { type: 'note', time: '4h ago', child: 'Liam', content: 'Daily progress note', color: 'primary.main' },
                    { type: 'behavior', time: '6h ago', child: 'Emma', content: 'Behavior observation', color: 'warning.main' },
                    { type: 'sensory', time: '1d ago', child: 'Liam', content: 'Sensory log updated', color: 'info.main' }
                  ].map((activity, index) => {
                    const resolvedActivityColor = resolveColor(theme, activity.color);
                    return (
                      <ListItem 
                        key={index}
                        sx={{
                          py: 2,
                          borderBottom: index < 3 ? `1px solid ${theme.palette.divider}` : 'none'
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar 
                            sx={{ 
                              bgcolor: alpha(resolvedActivityColor, 0.2),
                              color: resolvedActivityColor,
                              width: 40,
                              height: 40
                            }}
                          >
                            {activity.child[0]}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {activity.content}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {activity.child} • {activity.time}
                            </Typography>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Paper>
            </Grid>

            {/* Weekly Summary - Tablet Chart Area */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Weekly Overview
                </Typography>
                
                {/* Placeholder for charts/graphs */}
                <Box 
                  sx={{ 
                    height: 200,
                    bgcolor: 'background.default',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px dashed ${theme.palette.divider}`
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Charts and analytics would go here
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default TabletDashboard;
