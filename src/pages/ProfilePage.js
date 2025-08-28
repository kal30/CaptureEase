import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Box, Paper, CircularProgress, Alert, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles'; // Import useTheme
import { getAuth, updateProfile, updatePassword } from 'firebase/auth';
import PasskeyAuth from '../components/AuthProviders/PasskeyAuth';
import ResponsiveLayout from '../components/Layout/ResponsiveLayout';

const ProfilePage = () => {
  const theme = useTheme(); // Get theme object
  const auth = getAuth();
  const user = auth.currentUser;

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      if (user) {
        await updateProfile(user, { displayName: displayName });
        setMessage('Profile updated successfully!');
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password should be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      if (user && newPassword) {
        await updatePassword(user, newPassword);
        setMessage('Password updated successfully!');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err) {
      console.error("Error changing password:", err);
      if (err.code === 'auth/requires-recent-login') {
        setError('Please re-authenticate to change your password. Log out and log in again.');
      } else {
        setError('Failed to change password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResponsiveLayout pageTitle="Profile Settings">
      <Paper elevation={6} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: '12px', maxWidth: 'sm', mx: 'auto' }}>
        <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: theme.palette.primary.main }}>
          User Profile
        </Typography>

        {loading && <CircularProgress sx={{ mb: 2 }} />}
        {message && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleUpdateProfile} noValidate sx={{ mt: 1, width: '100%' }}>
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Update Display Name</Typography>
          <TextField
            margin="normal"
            fullWidth
            id="displayName"
            label="Display Name"
            name="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 2, mb: 2, backgroundColor: theme.palette.primary.main, '&:hover': { backgroundColor: theme.palette.primary.dark } }}
            disabled={loading}
          >
            Save Display Name
          </Button>
        </Box>

        <Divider sx={{ width: '100%', my: 3 }} />

        <Box component="form" onSubmit={handleChangePassword} noValidate sx={{ mt: 1, width: '100%' }}>
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Change Password</Typography>
          <TextField
            margin="normal"
            required
            fullWidth
            name="newPassword"
            label="New Password"
            type="password"
            id="newPassword"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmNewPassword"
            label="Confirm New Password"
            type="password"
            id="confirmNewPassword"
            autoComplete="new-password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 2, mb: 2, backgroundColor: theme.palette.primary.main, '&:hover': { backgroundColor: theme.palette.primary.dark } }}
            disabled={loading}
          >
            Change Password
          </Button>
        </Box>

        <Divider sx={{ width: '100%', my: 3 }} />

        {/* Passkey Management Section */}
        <Box sx={{ mt: 2, width: '100%' }}>
          <PasskeyAuth mode="register" />
        </Box>

        <Divider sx={{ width: '100%', my: 3 }} />

        <Box sx={{ mt: 2, width: '100%' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Your Email</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {email}
          </Typography>
_          <Typography variant="body2" color="text.secondary">
            To change your email, please contact support or use your Firebase console if you have direct access.
          </Typography>
        </Box>
      </Paper>
    </ResponsiveLayout>
  );
};

export default ProfilePage;