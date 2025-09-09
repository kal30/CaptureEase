import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Container,
  Paper,
  Alert,
  Divider,
} from "@mui/material";
import { EnhancedLoadingButton } from "../components/UI";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { handlePostAuthRedirect } from "../services/auth/navigation";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import GoogleAuth from "../components/AuthProviders/GoogleAuth";
import PasskeyAuth from "../components/AuthProviders/PasskeyAuth";
import ResponsiveLayout from "../components/Layout/ResponsiveLayout";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();

  useEffect(() => {
    if (location.state && location.state.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after a few seconds or on component unmount
      const timer = setTimeout(() => {
        setSuccessMessage("");
        navigate(location.pathname, { replace: true, state: {} }); // Clear state to prevent message reappearing on refresh
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state, navigate, location.pathname]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      // Use shared post-auth redirect utility
      handlePostAuthRedirect(navigate, location, result.user);
    } catch (err) {
      console.error("Login error:", err);
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        setError("Invalid email or password.");
      } else if (err.code === "auth/invalid-email") {
        setError("The email address is not valid.");
      } else if (err.code === "auth/user-disabled") {
        setError("This user account has been disabled.");
      } else {
        setError("Failed to log in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResponsiveLayout pageTitle="Sign In" showBottomNav={false}>
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
        }}
      >
        <Paper
        elevation={6}
        sx={{
          p: { xs: 3, sm: 4 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: 400,
          borderRadius: "12px",
        }}
      >
        <Typography
          component="h1"
          variant="h5"
          sx={{ mb: 3, fontWeight: "bold", color: "primary.main" }}
        >
          Sign In to CaptureEz
        </Typography>
        {successMessage && (
          <Alert severity="success" sx={{ width: "100%", mb: 2 }}>
            {successMessage}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box
          component="form"
          onSubmit={handleLogin}
          noValidate
          sx={{ mt: 1, width: "100%" }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <EnhancedLoadingButton
            type="submit"
            fullWidth
            variant="gradient"
            loading={loading}
            loadingStyle="spinner"
            loadingText="Signing in..."
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
            }}
          >
            Sign In
          </EnhancedLoadingButton>
        </Box>
        <Divider sx={{ width: "100%", my: 2 }}>OR</Divider>
        <Box sx={{ width: "100%", mb: 2 }}>
          <PasskeyAuth mode="signin" />
        </Box>
        <GoogleAuth buttonText="Sign In with Google" />
        <Box sx={{ mt: 2 }}>
          <Link
            to="/register"
            variant="body2"
            style={{ textDecoration: "none", color: "#1976d2" }}
          >
            {"Don't have an account? Sign Up"}
          </Link>
        </Box>
      </Paper>
      </Box>
    </ResponsiveLayout>
  );
};

export default Login;
