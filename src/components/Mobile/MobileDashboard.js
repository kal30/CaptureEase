import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Fab,
  BottomNavigation,
  BottomNavigationAction,
  AppBar,
  Toolbar,
  Badge
} from '@mui/material';
import MobileChildCard from './MobileChildCard';
import {
  Add as AddIcon,
  Home as HomeIcon,
  Timeline as TimelineIcon,
  Person as PersonIcon,
  NotificationsNone as NotificationsIcon,
  Menu as MenuIcon,
  ChildCare as ChildIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const MobileDashboard = ({ 
  children, 
  user, 
  onEditChild,
  onDeleteChild,
  onInviteTeamMember,
  onLogMood,
  userRole,
  modals, // Pass modals from parent
  onAddChild // Add child handler
}) => {
  const theme = useTheme();
  const [navValue, setNavValue] = React.useState(0);

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      pb: 7 // Space for bottom navigation
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
              CaptureEz
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
              {user?.displayName?.[0]}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Content */}
      <Box sx={{ p: 2 }}>
        {/* Quick Stats Cards */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3, overflowX: 'auto' }}>
          {[
            { label: 'Children', value: children?.length || 0, icon: <ChildIcon />, color: 'primary.main' },
            { label: 'This Week', value: '12', icon: <TimelineIcon />, color: 'success.main' },
            { label: 'Total Entries', value: '156', icon: <HomeIcon />, color: 'warning.main' }
          ].map((stat, index) => (
            <Card 
              key={index}
              sx={{ 
                minWidth: 120,
                bgcolor: `${stat.color}10`,
                border: `1px solid ${stat.color}20`
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ color: stat.color, fontSize: 16 }}>
                    {stat.icon}
                  </Box>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Children List - Mobile Optimized with Tabs */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, px: 1 }}>
            Your Children
          </Typography>
          
          {children?.map((child) => (
            <MobileChildCard
              key={child.id}
              child={child}
              onEditChild={onEditChild}
              onDeleteChild={onDeleteChild}
              onInviteTeamMember={onInviteTeamMember}
              onLogMood={onLogMood}
              userRole={userRole}
            />
          ))}
          
          {(!children || children.length === 0) && (
            <Card elevation={0} sx={{ border: `1px dashed ${theme.palette.divider}`, textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No children added yet. Tap + to add your first child.
              </Typography>
            </Card>
          )}
        </Box>

        {/* Recent Activity - Mobile Card */}
        <Card 
          elevation={0} 
          sx={{ 
            mt: 2,
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Recent Activity
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { type: 'mood', time: '2h ago', child: 'Emma', content: 'Happy mood logged' },
                { type: 'note', time: '4h ago', child: 'Liam', content: 'Daily progress note added' },
                { type: 'behavior', time: '6h ago', child: 'Emma', content: 'Behavior observation recorded' }
              ].map((activity, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: 2,
                    p: 2,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>
                    {activity.child[0]}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {activity.content}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activity.child} • {activity.time}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        onClick={onAddChild}
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          zIndex: 1000
        }}
      >
        <AddIcon />
      </Fab>

      {/* Bottom Navigation */}
      <BottomNavigation
        value={navValue}
        onChange={(event, newValue) => setNavValue(newValue)}
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
      
      {/* Render modals if provided */}
      {modals}
    </Box>
  );
};

export default MobileDashboard;