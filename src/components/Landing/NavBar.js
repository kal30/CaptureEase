import { Link as RouterLink } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import { AppBar, Toolbar, Button, Box, Container } from "@mui/material";
import NavButton from "./NavButton";
import InfoIcon from "@mui/icons-material/Info";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import AvatarMenu from "./AvatarMenu";
import Wordmark from "../../assets/image/logo/logo-transparent.png";
import {
  getNavbarColorScheme,
  navbarIconStyles,
  appBarStyles,
  toolbarStyles,
  containerStyles,
  logoButtonStyles,
  logoImageStyles,
  navLinksContainerStyles,
  authButtonsContainerStyles,
  loginButtonStyles,
  signUpButtonStyles,
} from "../../assets/theme/navbarTheme";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const colorScheme = getNavbarColorScheme("current");

  return (
    <>
      <AppBar
        position="static"
        sx={(theme) => appBarStyles(theme, colorScheme)}
      >
        <Toolbar sx={toolbarStyles}>
          <Container maxWidth="lg" sx={containerStyles}>
            {/* Logo Text */}
            <Button
              component={RouterLink}
              to="/"
              aria-label="CaptureEz home"
              sx={logoButtonStyles}
            >
              <Box
                component="img"
                src={Wordmark}
                alt="CaptureEz"
                sx={logoImageStyles}
              />
            </Button>

            {/* Navigation Links - Hidden on mobile when logged out */}
            <Box
              sx={(theme) =>
                navLinksContainerStyles(theme, isLoggedIn, colorScheme)
              }
            >
              {!isLoggedIn && (
                <>
                  <NavButton
                    text="About Us"
                    icon={
                      <InfoIcon
                        sx={navbarIconStyles}
                        htmlColor={navbarIconStyles.color}
                      />
                    }
                    to="/about"
                  />
                </>
              )}

              {isLoggedIn && (
                <>
                  <NavButton
                    text="Dashboard"
                    icon={
                      <DashboardIcon
                        sx={navbarIconStyles}
                        htmlColor={navbarIconStyles.color}
                      />
                    }
                    to="/dashboard"
                  />
                  <NavButton
                    text="Care Team"
                    icon={
                      <GroupIcon
                        sx={navbarIconStyles}
                        htmlColor={navbarIconStyles.color}
                      />
                    }
                    to="/care-team"
                  />
                </>
              )}
            </Box>

            {/* Auth Buttons or Avatar - Mobile optimized */}
            <Box sx={authButtonsContainerStyles}>
              {isLoggedIn ? (
                <AvatarMenu user={getAuth().currentUser} />
              ) : (
                <>
                  <Button
                    variant="contained"
                    component={RouterLink}
                    to="/login"
                    sx={loginButtonStyles()}
                  >
                    Login
                  </Button>
                  <Button
                    variant="contained"
                    component={RouterLink}
                    to="/register"
                    sx={signUpButtonStyles}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </Box>
          </Container>
        </Toolbar>
      </AppBar>
      <Box
        component="svg"
        viewBox="0 0 1440 320"
        xmlns="http://www.w3.org/2000/svg"
        sx={{ width: "100%", height: "auto", display: "block", mt: "-30px" }}
      >
        <path
          fill="#c8d9e6"
          fillOpacity="1"
          d="M0,224L48,208C96,192,192,160,288,154.7C384,149,480,171,576,181.3C672,192,768,192,864,181.3C960,171,1056,149,1152,128C1248,107,1344,85,1392,74.7L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          // d="M0,160 C480,40 960,280 1440,160 L1440,320 L0,320 Z"
        />
      </Box>
    </>
  );
};

export default Navbar;
