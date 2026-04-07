import React, { useEffect } from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { handlePostAuthRedirect } from "../../services/auth/navigation";
import { Box, Button } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google"; // Import Google Icon

const getGoogleAuthErrorMessage = (error) => {
  switch (error?.code) {
    case "auth/popup-closed-by-user":
      return "The Google sign-in window was closed before login finished. Please try again.";
    case "auth/cancelled-popup-request":
      return "A Google sign-in request was cancelled. Please try again.";
    case "auth/popup-blocked":
      return "Your browser blocked the Google sign-in popup. Please allow popups and try again.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized for Google sign-in.";
    case "auth/configuration-not-found":
      return "Google sign-in is not enabled for this Firebase project yet.";
    case "auth/network-request-failed":
      return "Network error during Google sign-in. Please check your connection and try again.";
    default:
      return "Google sign-in could not complete. Please try again.";
  }
};

const GoogleAuth = ({ buttonText, onError }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();
  const user = auth.currentUser;

  // Check if the user is already logged in, and redirect appropriately
  useEffect(() => {
    if (user) {
      handlePostAuthRedirect(navigate, location, user);
    }
  }, [user, navigate, location]);

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

      // Use shared post-auth redirect utility
      handlePostAuthRedirect(navigate, location, user);
    } catch (error) {
      const message = getGoogleAuthErrorMessage(error);
      if (onError) {
        onError(message);
      }
      if (
        ![
          "auth/popup-closed-by-user",
          "auth/cancelled-popup-request",
          "auth/popup-blocked",
          "auth/unauthorized-domain",
          "auth/configuration-not-found",
          "auth/network-request-failed",
        ].includes(error?.code)
      ) {
        console.error("Error during sign-in", error);
      }
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Button
        fullWidth
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
          justifyContent: "center",
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
        {buttonText}
      </Button>
    </Box>
  );
};

export default GoogleAuth;
