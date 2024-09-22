// src/pages/Login.js
import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { Button, Container, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';  // For redirection after login

const Login = () => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();  // Initialize navigate for redirection

  // Google sign-in handler
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard');  // Redirect to dashboard after successful login
    } catch (error) {
      setError('Failed to sign in with Google.');
      console.error(error);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Login with Google
        </Typography>
        {error && <Typography color="error">{error}</Typography>}
        <Button
          fullWidth
          variant="outlined"
          color="secondary"
          onClick={handleGoogleSignIn}
          sx={{ mt: 3, mb: 2 }}
        >
          Sign in with Google
        </Button>
      </Box>
    </Container>
  );
};

export default Login;