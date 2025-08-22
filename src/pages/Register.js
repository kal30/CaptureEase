import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Paper,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import GoogleAuth from "../components/AuthProviders/GoogleAuth"; // Keep Google Auth
import ResponsiveLayout from "../components/Layout/ResponsiveLayout";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState(""); // New state for full name
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      if (user) {
        await updateProfile(user, { displayName: fullName });
        await user.sendEmailVerification();
        navigate("/login", {
          state: {
            message:
              "Registration successful! Please check your email to verify your account.",
          },
        });
      } else {
        setError(
          "Registration successful, but could not send verification email. Please try logging in."
        );
      }
    } catch (err) {
      console.error("Registration error:", err);
      // Firebase error codes for user feedback
      if (err.code === "auth/email-already-in-use") {
        setError("The email address is already in use by another account.");
      } else if (err.code === "auth/invalid-email") {
        setError("The email address is not valid.");
      } else if (err.code === "auth/weak-password") {
        setError("The password is too weak. Please use at least 6 characters.");
      } else {
        setError("Failed to register. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResponsiveLayout pageTitle="Sign Up" showBottomNav={false}>
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
          Sign Up for CaptureEz
        </Typography>
        {error && (
          <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box
          component="form"
          onSubmit={handleRegister}
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
            id="fullName"
            label="Full Name"
            name="fullName"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              backgroundColor: "primary.main",
              "&:hover": { backgroundColor: "primary.dark" },
            }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Register"
            )}
          </Button>
        </Box>
        <Divider sx={{ width: "100%", my: 2 }}>OR</Divider>
        <GoogleAuth buttonText="Sign Up with Google" />
        <Box sx={{ mt: 2 }}>
          <Link
            to="/login"
            variant="body2"
            style={{ textDecoration: "none", color: "#1976d2" }}
          >
            {"Already have an account? Sign In"}
          </Link>
        </Box>
      </Paper>
      </Box>
    </ResponsiveLayout>
  );
};

export default Register;
