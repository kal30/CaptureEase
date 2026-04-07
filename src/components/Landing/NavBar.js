import { Link as RouterLink } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Container,
  Skeleton,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import { useRole } from "../../contexts/RoleContext";
import NavButton from "./NavButton";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import AvatarMenu from "./AvatarMenu";
import {
  getNavbarColorScheme,
  navbarIconStyles,
  appBarStyles,
  toolbarStyles,
  containerStyles,
  logoButtonStyles,
  navLinksContainerStyles,
  authButtonsContainerStyles,
  loginButtonStyles,
} from "../../assets/theme/navbarTheme";
import colors from "../../assets/theme/colors";

const Navbar = () => {
  const auth = getAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!auth.currentUser);
  const [authReady, setAuthReady] = useState(false);
  const { childrenWithAccess } = useRole();
  const isDashboardRoute = location.pathname.startsWith("/dashboard");
  const isLandingRoute = location.pathname === "/";
  const colorScheme = getNavbarColorScheme(
    isLandingRoute ? "pastel" : "current"
  );

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, [auth]);

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
              aria-label="lifelog home"
              sx={logoButtonStyles}
            >
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
                <Typography
                  component="span"
                  sx={{
                    fontSize: { xs: "1.45rem", md: "1.7rem", lg: "1.9rem" },
                    fontWeight: 700,
                    letterSpacing: "-0.05em",
                    color: colorScheme.textColor,
                    textTransform: "lowercase",
                    lineHeight: 1,
                  }}
                >
                  lifelog
                </Typography>
                <Box
                  component="span"
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: colors.landing.cyanPop,
                    boxShadow: `0 0 0 4px ${colors.landing.cyanPop}22`,
                    display: { xs: "inline-flex", md: "inline-flex" },
                  }}
                />
              </Box>
            </Button>

            {/* Navigation Links - Hidden on mobile when logged out */}
            <Box
              sx={(theme) =>
                navLinksContainerStyles(theme, isLoggedIn, colorScheme)
              }
            >
              {authReady && isLoggedIn && !isMobile && (
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
              {authReady ? (
                isLoggedIn ? (
                  <AvatarMenu user={auth.currentUser} />
                ) : (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Button
                      variant="text"
                      component={RouterLink}
                      to="/login"
                      sx={{
                        color: colorScheme.textColor,
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
                )
              ) : isDashboardRoute ? (
                <Skeleton
                  variant="circular"
                  width={40}
                  height={40}
                  sx={{ bgcolor: colors.navbar.current.skeletonBg }}
                />
              ) : (
                <Box sx={{ width: 40, height: 40 }} />
              )}
            </Box>
          </Container>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Navbar;
