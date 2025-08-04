import React, { useEffect } from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
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
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Create a user document in Firestore if it doesn't exist
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // New user: set initial data including role
        await setDoc(userRef, {
          displayName: user.displayName,
          email: user.email,
          role: 'parent', // Default role for new Google sign-ups
          createdAt: new Date(),
        });
      } else {
        // Existing user: update display name and email if they changed
        await setDoc(userRef, {
          displayName: user.displayName,
          email: user.email,
        }, { merge: true });
      }

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
