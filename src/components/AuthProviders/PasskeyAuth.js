import React, { useState, useEffect } from 'react';
import {
  Button,
  Box,
  Typography,
  Alert,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import {
  Fingerprint as FingerprintIcon,
  Security as SecurityIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  DevicesOther as DevicesIcon
} from '@mui/icons-material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../services/firebase';
import {
  isPasskeySupported,
  registerPasskey,
  authenticateWithPasskey,
  hasPasskeys,
  getUserPasskeys,
  removePasskey
} from '../../services/passkeyService';

const PasskeyAuth = ({ mode = 'signin' }) => { // mode can be 'signin', 'register', or 'manage'
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [userHasPasskeys, setUserHasPasskeys] = useState(false);
  const [passkeys, setPasskeys] = useState([]);
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(isPasskeySupported());
  }, []);

  useEffect(() => {
    if (user && (mode === 'manage' || mode === 'register')) {
      checkUserPasskeys();
    }
  }, [user, mode]);

  const checkUserPasskeys = async () => {
    if (!user) return;
    
    try {
      const hasKeys = await hasPasskeys(user.uid);
      setUserHasPasskeys(hasKeys);
      
      if (hasKeys) {
        const userPasskeys = await getUserPasskeys(user.uid);
        setPasskeys(userPasskeys);
      }
    } catch (error) {
      console.error('Error checking passkeys:', error);
    }
  };

  const handleRegisterPasskey = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await registerPasskey(user.uid, user.email, user.displayName);
      setSuccess('Passkey registered successfully! You can now use it to sign in quickly.');
      await checkUserPasskeys(); // Refresh passkeys list
    } catch (error) {
      setError(error.message || 'Failed to register passkey. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignInWithPasskey = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await authenticateWithPasskey();
      setSuccess('Authentication successful! Signing you in...');
      // Here you would typically sign the user into Firebase
      // This is a simplified implementation
    } catch (error) {
      setError(error.message || 'Failed to authenticate with passkey. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePasskey = async (credentialID) => {
    if (!user) return;
    
    try {
      await removePasskey(user.uid, credentialID);
      setSuccess('Passkey removed successfully.');
      await checkUserPasskeys(); // Refresh passkeys list
    } catch (error) {
      setError(error.message || 'Failed to remove passkey.');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!supported) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        <Typography variant="body2">
          Passkeys are not supported in this browser. Please use a modern browser that supports WebAuthn.
        </Typography>
      </Alert>
    );
  }

  // Sign-in mode - show sign-in button
  if (mode === 'signin') {
    return (
      <Box sx={{ width: '100%' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        
        <Button
          variant="contained"
          startIcon={<FingerprintIcon />}
          onClick={handleSignInWithPasskey}
          disabled={loading}
          fullWidth
          sx={{
            backgroundColor: "white",
            color: "#757575",
            border: "1px solid #dadce0",
            padding: "12px 24px",
            textTransform: "none",
            fontSize: "16px",
            fontWeight: 500,
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            "&:hover": { 
              backgroundColor: "#f8f9fa",
              boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
              border: "1px solid #c6c6c6"
            },
            "&:disabled": {
              backgroundColor: "#f5f5f5",
              color: "#9e9e9e"
            }
          }}
        >
          {loading ? 'Authenticating...' : 'Sign in with Passkey'}
        </Button>
      </Box>
    );
  }

  // Register mode - show registration option
  if (mode === 'register' && user) {
    return (
      <Box sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Secure Login
            </Typography>
          </Box>
          
          {userHasPasskeys && (
            <Chip
              label={`${passkeys.length} passkey${passkeys.length > 1 ? 's' : ''}`}
              color="success"
              size="small"
            />
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Add a passkey for quick and secure access to your account using your device's biometric authentication.
        </Typography>

        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleRegisterPasskey}
          disabled={loading}
          sx={{
            textTransform: "none",
            fontWeight: 500,
            mr: 1
          }}
        >
          {loading ? 'Setting up...' : 'Add Passkey'}
        </Button>

        {userHasPasskeys && (
          <Button
            variant="text"
            startIcon={<DevicesIcon />}
            onClick={() => setManageModalOpen(true)}
            sx={{ textTransform: "none" }}
          >
            Manage Passkeys
          </Button>
        )}

        {/* Manage Passkeys Modal */}
        <Dialog
          open={manageModalOpen}
          onClose={() => setManageModalOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SecurityIcon color="primary" />
              Manage Passkeys
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Your registered passkeys for quick sign-in:
            </Typography>
            
            {passkeys.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No passkeys registered yet.
              </Typography>
            ) : (
              <List>
                {passkeys.map((passkey, index) => (
                  <React.Fragment key={passkey.credentialID}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FingerprintIcon fontSize="small" />
                            <Typography variant="body2">
                              {passkey.deviceType === 'platform' ? 'This Device' : 'External Device'}
                            </Typography>
                          </Box>
                        }
                        secondary={`Added: ${formatDate(passkey.createdAt)}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemovePasskey(passkey.credentialID)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < passkeys.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setManageModalOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  return null;
};

export default PasskeyAuth;