import React, { useState, useEffect } from 'react';
import {
  Alert,
  AlertTitle,
  Button,
  Box,
  Typography,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
  Close as CloseIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { requestNotificationPermission } from '../../services/followUpService';

const NotificationPermissionPrompt = ({ onPermissionGranted, onDismiss }) => {
  const [permissionStatus, setPermissionStatus] = useState('default');
  const [isVisible, setIsVisible] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Check initial permission status
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
      
      // Show prompt if permission is default (not asked yet)
      setIsVisible(Notification.permission === 'default');
    }
  }, []);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const granted = await requestNotificationPermission();
      setPermissionStatus(Notification.permission);
      
      if (granted) {
        setIsVisible(false);
        onPermissionGranted?.();
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const handleManualSettings = () => {
    // Open browser settings info
    alert(
      'To enable notifications manually:\n\n' +
      '1. Click the 🔒 or ⓘ icon in your address bar\n' +
      '2. Change "Notifications" to "Allow"\n' +
      '3. Refresh the page\n\n' +
      'Or go to your browser settings and allow notifications for this site.'
    );
  };

  // Don't show if notifications aren't supported
  if (!('Notification' in window)) {
    return null;
  }

  return (
    <Collapse in={isVisible}>
      <Alert 
        severity={permissionStatus === 'denied' ? 'warning' : 'info'}
        sx={{ 
          mb: 3,
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={handleDismiss}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
      >
        <AlertTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {permissionStatus === 'denied' ? (
            <NotificationsOffIcon fontSize="small" />
          ) : (
            <NotificationsIcon fontSize="small" />
          )}
          {permissionStatus === 'denied' 
            ? 'Notifications Blocked' 
            : 'Enable Follow-up Notifications'
          }
        </AlertTitle>
        
        <Typography variant="body2" sx={{ mb: 2 }}>
          {permissionStatus === 'denied' 
            ? 'Notifications are currently blocked. You can still use follow-ups, but you won\'t get automatic reminders.'
            : 'Get timely reminders to check how effective your remedies were. We\'ll send smart notifications based on the incident type.'
          }
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {permissionStatus === 'denied' ? (
            <Button
              size="small"
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={handleManualSettings}
            >
              Enable in Browser Settings
            </Button>
          ) : (
            <Button
              size="small"
              variant="contained"
              startIcon={<NotificationsIcon />}
              onClick={handleRequestPermission}
              disabled={isRequesting}
            >
              {isRequesting ? 'Requesting...' : 'Enable Notifications'}
            </Button>
          )}
        </Box>
      </Alert>
    </Collapse>
  );
};

export default NotificationPermissionPrompt;