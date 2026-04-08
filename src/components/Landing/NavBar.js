import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Container,
  Skeleton,
  Typography,
  Avatar,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import { useRole } from "../../contexts/RoleContext";
import GroupIcon from "@mui/icons-material/Group";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import AddToHomeScreenIcon from "@mui/icons-material/AddToHomeScreen";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import usePWAInstallPrompt from "../../hooks/usePWAInstallPrompt";
import colors from "../../assets/theme/colors";

const Navbar = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!auth.currentUser);
  const [authReady, setAuthReady] = useState(false);
  const { childrenWithAccess } = useRole();
  const pwaInstallPrompt = usePWAInstallPrompt();
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const isDashboardRoute = location.pathname.startsWith("/dashboard");
  const canSeeSwitchChild = isLoggedIn && (childrenWithAccess?.length || 0) > 1;
  const showInstallAction = !pwaInstallPrompt.isInstalled && (pwaInstallPrompt.canInstall || pwaInstallPrompt.isIOS);
  const userAvatarLabel =
    auth.currentUser?.displayName?.trim()?.charAt(0)?.toUpperCase() ||
    auth.currentUser?.email?.trim()?.charAt(0)?.toUpperCase() ||
    "U";

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleSwitchChild = () => {
    if (location.pathname.startsWith("/dashboard")) {
      window.dispatchEvent(new CustomEvent("captureez:open-switchboard"));
      return;
    }
    navigate("/dashboard");
  };

  const handleInstall = async () => {
    if (pwaInstallPrompt.canInstall) {
      await pwaInstallPrompt.promptInstall();
      return;
    }

    if (pwaInstallPrompt.isIOS) {
      window.alert("On iPhone or iPad, tap Share, then choose Add to Home Screen.");
    }
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleProfile = () => {
    handleUserMenuClose();
    navigate("/profile");
  };

  const handleLogoutClick = async () => {
    handleUserMenuClose();
    await handleLogout();
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: colors.landing.surface,
        color: colors.landing.heroText,
        borderBottom: `1px solid ${colors.landing.borderLight}`,
        pt: "env(safe-area-inset-top)",
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          minHeight: "calc(52px + env(safe-area-inset-top))",
          height: "calc(52px + env(safe-area-inset-top))",
          px: { xs: 1.25, sm: 2, md: 3 },
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: {
              xs: "auto 1fr auto",
              md: "1fr auto 1fr",
            },
            alignItems: "center",
            columnGap: 1.5,
            px: "0 !important",
          }}
        >
          <Button
            component={RouterLink}
            to="/"
            aria-label="lifelog home"
            sx={{
              minWidth: "auto",
              px: 0,
              py: 0,
              justifySelf: "start",
              textTransform: "none",
              bgcolor: "transparent",
              boxShadow: "none",
              "&:hover": {
                bgcolor: "transparent",
                boxShadow: "none",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
              <Typography
                component="span"
                sx={{
                  fontSize: { xs: "1.45rem", md: "1.7rem", lg: "1.9rem" },
                  fontWeight: 700,
                  letterSpacing: "-0.05em",
                  color: colors.landing.heroText,
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
                }}
              />
            </Box>
          </Button>

          <Box
            sx={{
              justifySelf: "center",
              display: { xs: "none", md: canSeeSwitchChild ? "block" : "none" },
            }}
          >
            <Button
              variant="outlined"
              onClick={handleSwitchChild}
              startIcon={<GroupIcon sx={{ fontSize: 18, color: colors.landing.textMuted }} />}
              sx={{
                minHeight: 36,
                px: 2,
                borderRadius: "9999px",
                borderColor: colors.landing.borderLight,
                color: colors.landing.textMuted,
                bgcolor: "transparent",
                textTransform: "none",
                fontWeight: 700,
                boxShadow: "none",
                "&:hover": {
                  borderColor: colors.landing.borderMedium,
                  bgcolor: colors.landing.surfaceSoft,
                  boxShadow: "none",
                },
              }}
            >
              Switch Child
            </Button>
          </Box>

          <Box
            sx={{
              justifySelf: "end",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {authReady ? (
              isLoggedIn ? (
                <>
                  {showInstallAction ? (
                    <Tooltip title={pwaInstallPrompt.isIOS ? "Add to Home Screen" : "Install app"}>
                      <IconButton
                        onClick={handleInstall}
                        aria-label={pwaInstallPrompt.isIOS ? "Add to Home Screen" : "Install app"}
                        size="small"
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "9999px",
                          border: `1px solid ${colors.landing.borderLight}`,
                          color: colors.landing.textMuted,
                          bgcolor: colors.landing.surface,
                          boxShadow: "none",
                          "&:hover": {
                            bgcolor: colors.landing.surfaceSoft,
                            borderColor: colors.landing.borderMedium,
                            boxShadow: "none",
                          },
                        }}
                      >
                        {pwaInstallPrompt.isIOS ? (
                          <PhoneIphoneIcon sx={{ fontSize: 18 }} />
                        ) : (
                          <AddToHomeScreenIcon sx={{ fontSize: 18 }} />
                        )}
                      </IconButton>
                    </Tooltip>
                  ) : null}
                  <Button
                    onClick={handleUserMenuOpen}
                    aria-label="Profile options"
                    sx={{
                      minWidth: 0,
                      p: 0,
                      ml: 0.5,
                      borderRadius: "9999px",
                      bgcolor: "transparent",
                      boxShadow: "none",
                      "&:hover": {
                        bgcolor: "transparent",
                        boxShadow: "none",
                      },
                    }}
                  >
                    <Avatar
                      alt={auth.currentUser?.displayName || "User"}
                      src={auth.currentUser?.photoURL || undefined}
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: colors.landing.cyanPop,
                        color: colors.landing.deepNavy,
                        fontSize: "0.88rem",
                        fontWeight: 700,
                        border: `1px solid ${colors.landing.borderMedium}`,
                        boxShadow: "0 4px 10px rgba(15, 23, 42, 0.08)",
                      }}
                    >
                      {userAvatarLabel}
                    </Avatar>
                  </Button>
                </>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Button
                    variant="text"
                    component={RouterLink}
                    to="/login"
                    sx={{
                      color: colors.landing.textMuted,
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
                    sx={{
                      borderRadius: "9999px",
                      minHeight: 36,
                      px: 2,
                      textTransform: "none",
                      fontWeight: 700,
                      bgcolor: colors.brand.ink,
                      color: colors.landing.heroText,
                      boxShadow: `0 10px 24px ${colors.landing.shadowHero}`,
                      "&:hover": {
                        bgcolor: colors.brand.navy,
                      },
                    }}
                  >
                    Get Started
                  </Button>
                </Box>
              )
            ) : isDashboardRoute ? (
              <Skeleton
                variant="circular"
                width={32}
                height={32}
                sx={{ bgcolor: colors.navbar.current.skeletonBg }}
              />
            ) : (
              <Box sx={{ width: 32, height: 32 }} />
            )}
          </Box>
        </Container>
      </Toolbar>
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 220,
            borderRadius: '18px',
            border: `1px solid ${colors.landing.borderLight}`,
            boxShadow: `0 24px 60px ${colors.landing.shadowPanel}`,
            bgcolor: 'rgba(255, 255, 255, 0.98)',
          },
        }}
      >
          <MenuItem onClick={handleProfile} sx={{ gap: 1.1, py: 1.25, px: 1.5, minHeight: 48 }}>
            <ListItemIcon sx={{ minWidth: 34 }}>
              <PersonOutlineIcon sx={{ fontSize: 18, color: colors.brand.ink }} />
            </ListItemIcon>
          Profile page
          </MenuItem>
        <MenuItem onClick={handleLogoutClick} sx={{ gap: 1.1, py: 1.25, px: 1.5, minHeight: 48 }}>
          <ListItemIcon sx={{ minWidth: 34 }}>
            <LogoutIcon sx={{ fontSize: 18, color: colors.landing.textMuted }} />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Navbar;
