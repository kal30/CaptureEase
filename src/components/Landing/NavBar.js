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
    </>
  );
};

export default Navbar;
