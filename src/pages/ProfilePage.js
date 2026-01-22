import React, { useState, useEffect } from 'react';
import { Typography, TextField, Box, Paper, Alert, Divider, Chip, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { EnhancedLoadingButton } from '../components/UI';
import { getAuth, updateProfile, updatePassword, onAuthStateChanged } from 'firebase/auth';
import ResponsiveLayout from '../components/Layout/ResponsiveLayout';
import { useLocation } from 'react-router-dom';
import PasskeyAuth from '../components/AuthProviders/PasskeyAuth';
import { sendVerificationEmail } from '../services/emailVerificationService';

const ProfilePage = () => {
  const theme = useTheme(); // Get theme object
  const SHOW_PASSKEYS = false;
  const auth = getAuth();
  const location = useLocation();
  const [user, setUser] = useState(auth.currentUser);

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const isEmailTest = new URLSearchParams(location.search).get('emailTest') === 'unverified';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser || null);
      setDisplayName(nextUser?.displayName || '');
      setEmail(nextUser?.email || '');
    });
    return () => unsubscribe();
  }, [auth]);

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

  const handleResendVerification = async () => {
    if (!user) return;
    setVerificationLoading(true);
    setMessage('');
    setError('');
    try {
      const result = await sendVerificationEmail({
        continueUrl: `${window.location.origin}/profile?verified=1`,
      });
      if (result?.success === false) {
        setMessage(result?.message || 'Email already verified.');
        return;
      }
      setMessage('Verification email sent. Please check your inbox.');
    } catch (err) {
      console.error('Error sending verification email:', err);
      setError('Failed to send verification email.');
    } finally {
      setVerificationLoading(false);
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
          <EnhancedLoadingButton
            type="submit"
            variant="gradient"
            loading={loading}
            loadingStyle="waves"
            loadingText="Saving name..."
            sx={{ mt: 2, mb: 2 }}
          >
            Save Display Name
          </EnhancedLoadingButton>
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
          <EnhancedLoadingButton
            type="submit"
            variant="outlined"
            color="secondary"
            loading={loading}
            loadingStyle="pulse"
            loadingText="Updating password..."
            sx={{ mt: 2, mb: 2 }}
          >
            Change Password
          </EnhancedLoadingButton>
        </Box>

        <Divider sx={{ width: '100%', my: 3 }} />

        {SHOW_PASSKEYS && (
          <>
            <Box sx={{ mt: 2, width: '100%' }}>
              <PasskeyAuth mode="register" />
            </Box>
            <Divider sx={{ width: '100%', my: 3 }} />
          </>
        )}

        <Box sx={{ mt: 2, width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="h6">Your Email</Typography>
          <Chip
            size="small"
            color={user?.emailVerified && !isEmailTest ? 'success' : 'warning'}
            label={user?.emailVerified && !isEmailTest ? 'Verified' : 'Not verified'}
            variant={user?.emailVerified && !isEmailTest ? 'filled' : 'outlined'}
          />
          </Box>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {email || user?.email || '—'}
          </Typography>
          {(!user?.emailVerified || isEmailTest) && (
            <Button
              size="small"
              variant="outlined"
              onClick={handleResendVerification}
              disabled={verificationLoading}
              sx={{ textTransform: 'none', mb: 1 }}
            >
              {verificationLoading ? 'Sending…' : 'Resend verification email'}
            </Button>
          )}
          <Typography variant="body2" color="text.secondary">
            Email changes aren’t self-serve yet. Contact support if you need to update it.
          </Typography>
        </Box>
      </Paper>
    </ResponsiveLayout>
  );
};

export default ProfilePage;
