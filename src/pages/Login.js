// src/pages/Login.js
import React, { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../services/firebase";
import { Button, Container, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom"; // For redirection after login
import GoogleIcon from "@mui/icons-material/Google"; // Import Google icon

const Login = () => {
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize navigate for redirection

  // Google sign-in handler
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate("/dashboard"); // Redirect to dashboard after successful login
    } catch (error) {
      setError("Failed to sign in with Google.");
      console.error(error);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Login with Google
        </Typography>
        {error && <Typography color="error">{error}</Typography>}

        <Button
          variant="contained"
          startIcon={<GoogleIcon />} // Or use a custom Google logo image
          onClick={handleGoogleLogin}
          sx={{
            backgroundColor: "#4285F4", // Google Blue background
            color: "#fff",
            padding: "10px 20px",
            textTransform: "none",
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            ":hover": { backgroundColor: "#357ae8" }, // Slightly darker blue on hover
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Subtle shadow for depth
          }}
        >
          Sign in with Google
        </Button>
      </Box>
    </Container>
  );
};

export default Login;
