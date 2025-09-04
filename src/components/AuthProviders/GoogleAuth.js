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
          role: 'care_owner', // Default role for new Google sign-ups - CLEAN
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

        <Button
          variant="contained"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleLogin}
          sx={{
            backgroundColor: "white",
            color: "#757575",
            border: "1px solid #dadce0",
            padding: "12px 24px",
            textTransform: "none",
            fontSize: "16px",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            "&:hover": { 
              backgroundColor: "#f8f9fa",
              boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
              border: "1px solid #c6c6c6"
            },
            "&:active": {
              backgroundColor: "#f1f3f4"
            }
          }}
        >
          {buttonText} {/* Use custom button text */}
        </Button>
      </Box>
    </Container>
  );
};

export default GoogleAuth;
