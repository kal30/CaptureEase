import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Paper,
  Alert,
  Divider,
} from "@mui/material";
import { EnhancedLoadingButton } from "../components/UI";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import GoogleAuth from "../components/AuthProviders/GoogleAuth";
import ResponsiveLayout from "../components/Layout/ResponsiveLayout";
import { createUserProfile } from "../services/userService";
import colors from "../assets/theme/colors";
import { PRODUCT_NAME_TITLE, PRODUCT_NAME } from "../constants/config";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const prefilledEmail = params.get("email");
    if (prefilledEmail) {
      setEmail(prefilledEmail);
    }
  }, [location.search]);

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

        await createUserProfile(user.uid, {
          displayName: fullName,
          name: fullName,
          email: email,
          photoURL: user.photoURL,
        });

        await user.sendEmailVerification();
        navigate("/dashboard", { replace: true });
      } else {
        setError(
          "Registration successful, but could not send verification email. Please try logging in."
        );
      }
    } catch (err) {
      console.error("Registration error:", err);
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
            position: "relative",
            overflow: "hidden",
            p: { xs: 3, sm: 4 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            maxWidth: 400,
            borderRadius: "12px",
          }}
        >
          <Box
            aria-hidden="true"
            sx={{
              position: "absolute",
              top: 18,
              right: -6,
              fontSize: { xs: "3rem", sm: "3.4rem" },
              fontWeight: 800,
              letterSpacing: "-0.08em",
              lineHeight: 1,
              color: colors.brand.ink,
              opacity: 0.08,
              pointerEvents: "none",
              userSelect: "none",
              textTransform: "lowercase",
            }}
          >
            {PRODUCT_NAME}
          </Box>
          <Typography
            component="h1"
            variant="h5"
            sx={{
              mb: 1.5,
              fontWeight: "bold",
              color: "primary.main",
              position: "relative",
              zIndex: 1,
            }}
          >
            Sign Up for {PRODUCT_NAME_TITLE}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              textAlign: "center",
              position: "relative",
              zIndex: 1,
            }}
          >
            Use Google first for the quickest setup, or register with email below.
          </Typography>
          {error && (
            <Alert
              severity="error"
              sx={{ width: "100%", mb: 2, position: "relative", zIndex: 1 }}
            >
              {error}
            </Alert>
          )}
          <Box sx={{ width: "100%", mb: 2, position: "relative", zIndex: 1 }}>
            <GoogleAuth buttonText="Sign Up with Google" onError={setError} />
          </Box>
          <Divider sx={{ width: "100%", my: 2, position: "relative", zIndex: 1 }}>
            or use email
          </Divider>
          <Box
            component="form"
            onSubmit={handleRegister}
            noValidate
            sx={{ mt: 1, width: "100%", position: "relative", zIndex: 1 }}
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
            <EnhancedLoadingButton
              type="submit"
              fullWidth
              variant="success-gradient"
              loading={loading}
              loadingStyle="pulse"
              loadingText="Creating account..."
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
              }}
            >
              Register
            </EnhancedLoadingButton>
          </Box>
          <Box sx={{ mt: 2, position: "relative", zIndex: 1 }}>
            <Link
              to="/login"
              variant="body2"
              style={{ textDecoration: "none", color: colors.brand.deep }}
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
