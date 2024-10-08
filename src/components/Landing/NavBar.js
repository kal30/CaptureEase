import React from "react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  IconButton,
  Avatar,
} from "@mui/material";
import NavButton from "./NavButton";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AvatarMenu from "./AvatarMenu"; // Import the avatar menu component
import logo from "../../image/oneMoreLogo.png";

const Navbar = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Get the current route

  // Check if we are on the landing page
  const isLandingPage = location.pathname === "/";

  // If the user is logged in and clicks "Register" or "Join Now", redirect to the dashboard
  const handleRegisterRedirect = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/register");
    }
  };

  return (
    <AppBar
      position="static"
      sx={{
        boxShadow: "none", // Remove shadow for a flat look
        backgroundImage: "linear-gradient(to right, #E0F7FA, #B2EBF2)", // Gradient effect
        color: "#000", // Black text for consistency
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Button
          component={RouterLink}
          to="/"
          sx={{ padding: 0, minWidth: "auto", borderRadius: "50%" }}
        >
          <img
            src={logo}
            alt="Logo"
            style={{ height: "120px", cursor: "pointer" }}
          />
        </Button>

        {/* Navigation Links */}
        <Box sx={{ display: "flex", gap: 4 }}>
          {isLandingPage && (
            <>
              <NavButton text="Features" icon={<HomeIcon />} href="#features" />
              <NavButton text="About Us" icon={<InfoIcon />} href="#about" />
              <NavButton
                text="Contact"
                icon={<ContactMailIcon />}
                href="#contact"
              />
            </>
          )}

          {!isLandingPage && user && (
            <>
              <NavButton
                text="Dashboard"
                icon={<DashboardIcon />}
                href="/dashboard"
              />
            </>
          )}
        </Box>

        {/* Auth Buttons or Avatar */}
        <Box sx={{ display: "flex", gap: 2 }}>
          {user ? (
            <AvatarMenu user={user} />
          ) : (
            <>
              <Button
                variant="contained"
                component={RouterLink}
                to="/login"
                sx={{
                  backgroundColor: "#00CFFF",
                  color: "#fff",
                  "&:hover": { backgroundColor: "#027a79" },
                }}
              >
                Login
              </Button>
              <Button
                variant="outlined"
                onClick={handleRegisterRedirect} // Handle the redirect logic here
                sx={{ color: "#49274A", borderColor: "#49274A" }}
              >
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
