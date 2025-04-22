import React, { useEffect } from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth"; // Firebase authentication
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography, Container } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google"; // Import Google Icon

const GoogleAuth = ({ buttonText }) => {
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  // Check if the user is already logged in, and redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Handle Google sign-in
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate("/dashboard"); // Redirect to dashboard after successful login
    } catch (error) {
      console.error("Error during sign-in", error);
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
          {buttonText} {/* Use custom button text */}
        </Typography>

        <Button
          variant="contained"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleLogin}
          sx={{
            backgroundColor: "#4285F4", // Google blue
            color: "#fff",
            padding: "10px 20px",
            textTransform: "none",
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            ":hover": { backgroundColor: "#357ae8" },
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          {buttonText} {/* Use custom button text */}
        </Button>
      </Box>
    </Container>
  );
};

export default GoogleAuth;
