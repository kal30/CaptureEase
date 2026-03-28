import { Link as RouterLink } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import { AppBar, Toolbar, Button, Box, Container } from "@mui/material";
import { useRole } from "../../contexts/RoleContext";
import NavButton from "./NavButton";
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
} from "../../assets/theme/navbarTheme";

const Navbar = () => {
  const auth = getAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!auth.currentUser);
  const [authReady, setAuthReady] = useState(() => !!auth.currentUser);
  const { childrenWithAccess } = useRole();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, [auth]);

  const colorScheme = getNavbarColorScheme("current");

  // Simple check - only show if user has children (let page handle role validation)
  const canSeeCareTeamMenu = isLoggedIn && childrenWithAccess && childrenWithAccess.length > 0;

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
              {authReady && isLoggedIn && (
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
                  {canSeeCareTeamMenu && (
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
                  )}
                </>
              )}
            </Box>

            {/* Auth Buttons or Avatar - Mobile optimized */}
            <Box sx={authButtonsContainerStyles}>
              {authReady && isLoggedIn ? (
                <AvatarMenu user={auth.currentUser} />
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Button
                    variant="text"
                    component={RouterLink}
                    to="/login"
                    sx={{
                      color: navbarIconStyles.color,
                      textTransform: "none",
                      fontWeight: 600,
                      px: 1.5,
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="contained"
                    component={RouterLink}
                    to="/register"
                    sx={loginButtonStyles()}
                  >
                    Get Started Free
                  </Button>
                </Box>
              )}
            </Box>
          </Container>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Navbar;
