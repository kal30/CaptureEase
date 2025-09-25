import React, { useState } from 'react';
import {
  Box,
  Switch,
  Tooltip,
  Snackbar,
  Alert,
  IconButton
} from '@mui/material';
import { 
  Sms as SmsIcon,
  SmsOutlined as SmsOutlinedIcon
} from '@mui/icons-material';
import { httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { functions } from '../../../services/firebase';
import { usePhoneStatus } from '../../../hooks/usePhoneStatus';

/**
 * SMS Toggle Component for ChildCard
 * Clean, simple SMS logging toggle that integrates with ChildCard design
 */
const SmsToggle = ({ child, onSettingsUpdate }) => {
  const auth = getAuth();
  const navigate = useNavigate();
  
  // Use centralized functions instance
  const updateChildSmsSettingsCallable = httpsCallable(functions, 'updateChildSmsSettings');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Get phone status for the user and this specific child  
  const { verified: phoneVerified, loading: phoneLoading } = usePhoneStatus(null, child);
  
  // Get current SMS enabled status
  const smsEnabled = child?.settings?.notifications?.smsEnabled || false;

  const handleToggle = async (event) => {
    event.stopPropagation(); // Prevent card expansion
    
    // Check if user is authenticated
    if (!auth.currentUser) {
      showSnackbar('Please log in to manage SMS settings', 'error');
      return;
    }
    
    // Check if phone is verified first
    if (!phoneVerified) {
      showSnackbar('Verify your phone number in Phone & Messaging Settings to enable SMS logging.', 'warning');
      return;
    }

    const newSmsEnabled = event.target.checked;
    
    if (!child?.id) {
      showSnackbar('Child ID not available', 'error');
      return;
    }

    setLoading(true);
    try {
      console.log('Calling updateChildSmsSettings with:', { childId: child.id, smsEnabled: newSmsEnabled });
      console.log('Current user:', auth.currentUser?.uid);
      console.log('Auth token exists:', !!await auth.currentUser?.getIdToken());
      
      // Ensure we have a fresh auth token
      if (auth.currentUser) {
        await auth.currentUser.getIdToken(true);
      }
      
      const result = await updateChildSmsSettingsCallable({
        childId: child.id,
        smsEnabled: newSmsEnabled
      });

      console.log('SMS settings updated:', result.data);
      showSnackbar(result.data.message || `SMS logging ${newSmsEnabled ? 'enabled' : 'disabled'} for ${child.name}`, 'success');
      
      // Update parent component if callback provided
      // Note: The usePhoneStatus hook will automatically refresh and show the new state
      if (onSettingsUpdate) {
        onSettingsUpdate({
          ...child,
          settings: {
            ...child.settings,
            notifications: {
              ...child.settings?.notifications,
              smsEnabled: newSmsEnabled
            }
          }
        });
      }

    } catch (error) {
      console.error('Error updating SMS settings:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      
      let message = 'Failed to update SMS settings';
      
      if (error.code === 'functions/permission-denied' || error.code === 'functions/unauthenticated') {
        message = 'Authentication error. Please refresh and try again.';
      } else if (error.code === 'functions/not-found') {
        message = 'Child not found';
      } else if (error.code === 'functions/internal') {
        message = 'Internal error. Please try again.';
      } else if (error.message) {
        message = error.message;
      }
      
      showSnackbar(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerificationClick = (event) => {
    event.stopPropagation(); // Prevent card expansion
    navigate('/settings/messaging');
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Don't render while loading
  if (phoneLoading) {
    return null;
  }

  // Simple, clean design that fits with the card actions
  return (
    <>
      <Tooltip 
        title={
          !phoneVerified 
            ? `Verify your phone to enable SMS logging for ${child.name}`
            : `SMS logging for ${child.name} is ${smsEnabled ? 'enabled' : 'disabled'}`
        }
        arrow
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {!phoneVerified ? (
            // Phone not verified - show setup button
            <IconButton
              size="small"
              onClick={handlePhoneVerificationClick}
              aria-label={`Set up SMS logging for ${child.name}`}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'action.hover',
                  color: 'primary.main'
                }
              }}
            >
              <SmsOutlinedIcon fontSize="small" />
            </IconButton>
          ) : (
            // Phone verified - show toggle
            <>
              <IconButton
                size="small"
                aria-label={`SMS logging for ${child.name}`}
                sx={{
                  color: smsEnabled ? 'success.main' : 'text.secondary',
                  cursor: 'default',
                  '&:hover': {
                    backgroundColor: 'transparent'
                  }
                }}
              >
                {smsEnabled ? <SmsIcon fontSize="small" /> : <SmsOutlinedIcon fontSize="small" />}
              </IconButton>
              
              <Switch
                checked={smsEnabled}
                onChange={handleToggle}
                disabled={loading}
                size="small"
                inputProps={{
                  'aria-label': `${smsEnabled ? 'Disable' : 'Enable'} SMS logging for ${child.name}`
                }}
                sx={{
                  ml: -0.5, // Tighter spacing
                  '& .MuiSwitch-track': {
                    backgroundColor: smsEnabled ? 'success.light' : 'grey.300'
                  }
                }}
              />
            </>
          )}
        </Box>
      </Tooltip>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={closeSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SmsToggle;