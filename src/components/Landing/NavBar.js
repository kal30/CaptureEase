import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useEffect, useMemo, useState } from "react";
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
  Divider,
  useMediaQuery,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useRole } from "../../contexts/RoleContext";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import GroupIcon from "@mui/icons-material/Group";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import AddToHomeScreenIcon from "@mui/icons-material/AddToHomeScreen";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import usePWAInstallPrompt from "../../hooks/usePWAInstallPrompt";
import colors from "../../assets/theme/colors";
import { ACTIVE_CHILD_STORAGE_KEY } from "../../features/dashboard/shared/DashboardViewContext";
import ChildActionsMenuContent from "../Dashboard/shared/ChildActionsMenuContent";
import { getRoleDisplay } from "../../constants/roles";
import { PRODUCT_NAME_TITLE } from "../../constants/config";
import BrandWordmark from "../UI/BrandWordmark";

const Navbar = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktopDashboard = useMediaQuery("(min-width:1024px)");
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!auth.currentUser);
  const [authReady, setAuthReady] = useState(false);
  const { childrenWithAccess, getUserRoleForChild } = useRole();
  const pwaInstallPrompt = usePWAInstallPrompt();
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [dashboardChildMenuAnchor, setDashboardChildMenuAnchor] = useState(null);
  const [dashboardActionsAnchor, setDashboardActionsAnchor] = useState(null);
  const [dashboardActiveChildId, setDashboardActiveChildId] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(ACTIVE_CHILD_STORAGE_KEY) || "";
  });
  const isDashboardRoute = location.pathname.startsWith("/dashboard");
  const isInstallRoute = location.pathname.startsWith("/install");
  const isMobileDashboardHeader = isDashboardRoute && !isDesktopDashboard;
  const useCompactDashboardHeader = isDashboardRoute && isDesktopDashboard;
  const canSeeSwitchChild = isLoggedIn && (childrenWithAccess?.length || 0) > 1;
  const showInstallAction = !isDashboardRoute && !isInstallRoute && !pwaInstallPrompt.isInstalled && (pwaInstallPrompt.canInstall || pwaInstallPrompt.isIOS);
  const dashboardActiveChild = useMemo(
    () => childrenWithAccess.find((child) => child.id === dashboardActiveChildId) || childrenWithAccess[0] || null,
    [childrenWithAccess, dashboardActiveChildId]
  );
  const dashboardActiveRoleLabel = useMemo(() => {
    const role = getUserRoleForChild?.(dashboardActiveChild?.id);
    const label = getRoleDisplay(role)?.label || '';
    return label.replace(/^[^\w]+/, '').trim();
  }, [dashboardActiveChild?.id, getUserRoleForChild]);
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

  useEffect(() => {
    if (!dashboardActiveChildId && childrenWithAccess[0]?.id) {
      setDashboardActiveChildId(childrenWithAccess[0].id);
      return;
    }

    if (dashboardActiveChildId && !childrenWithAccess.some((child) => child.id === dashboardActiveChildId)) {
      setDashboardActiveChildId(childrenWithAccess[0]?.id || "");
    }
  }, [childrenWithAccess, dashboardActiveChildId]);

  useEffect(() => {
    const handleActiveChildChanged = (event) => {
      const nextChildId = event?.detail?.childId || window.localStorage.getItem(ACTIVE_CHILD_STORAGE_KEY) || "";
      setDashboardActiveChildId(nextChildId);
    };

    const handleStorage = (event) => {
      if (event.key === ACTIVE_CHILD_STORAGE_KEY) {
        setDashboardActiveChildId(event.newValue || "");
      }
    };

    window.addEventListener("captureez:active-child-changed", handleActiveChildChanged);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("captureez:active-child-changed", handleActiveChildChanged);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

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

  const handleDashboardChildMenuOpen = (event) => {
    setDashboardChildMenuAnchor(event.currentTarget);
  };

  const handleDashboardChildMenuClose = () => {
    setDashboardChildMenuAnchor(null);
  };

  const handleDashboardActionsOpen = (event) => {
    setDashboardActionsAnchor(event.currentTarget);
  };

  const handleDashboardActionsClose = () => {
    setDashboardActionsAnchor(null);
  };

  const handleDashboardAction = (action) => {
    handleDashboardActionsClose();
    window.dispatchEvent(new CustomEvent("captureez:dashboard-action", {
      detail: {
        action,
        childId: dashboardActiveChild?.id || "",
      },
    }));
  };

  const handleDashboardChildSelect = (childId) => {
    handleDashboardChildMenuClose();
    window.dispatchEvent(new CustomEvent("captureez:set-active-child", {
      detail: { childId },
    }));
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar,
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
          px: { xs: 2.5, sm: 2, md: 3 },
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: "0 !important",
          }}
        >
          <Button
            component={RouterLink}
            to="/"
            aria-label={`${PRODUCT_NAME_TITLE} home`}
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
            <BrandWordmark variant="navbar" />
          </Button>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              ml: "auto",
            }}
          >
            {authReady ? (
              isLoggedIn ? (
                <>
                  {isDashboardRoute && isDesktopDashboard ? null : showInstallAction ? (
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
                  {isLoggedIn ? (
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
                  ) : null}
                </>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
                      px: 2.25,
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

      <Menu
        anchorEl={dashboardChildMenuAnchor}
        open={Boolean(dashboardChildMenuAnchor)}
        onClose={handleDashboardChildMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 250,
            borderRadius: '18px',
            border: `1px solid ${colors.landing.borderLight}`,
            boxShadow: `0 24px 60px ${colors.landing.shadowPanel}`,
            bgcolor: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(16px)',
          },
        }}
      >
        {childrenWithAccess.map((child) => (
          <MenuItem
            key={child.id}
            onClick={() => handleDashboardChildSelect(child.id)}
            sx={{ gap: 1.25, py: 1.25, px: 1.5, minHeight: 48 }}
          >
            <Avatar
              src={child.profilePhoto || child.photoURL || child.avatarUrl || undefined}
              sx={{
                width: 28,
                height: 28,
                bgcolor: colors.roles.careOwner.primary,
                color: '#fff',
                fontSize: '0.78rem',
              }}
            >
              {(child.name || 'C').charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600, color: colors.landing.heroText, lineHeight: 1.1 }}>
                {child.name}
              </Typography>
              <Typography variant="caption" sx={{ color: colors.landing.textMuted }}>
                Switch profile
              </Typography>
            </Box>
          </MenuItem>
        ))}
        <MenuItem
          onClick={() => {
            handleDashboardChildMenuClose();
            window.dispatchEvent(new CustomEvent("captureez:dashboard-action", {
              detail: { action: 'add-child', childId: dashboardActiveChild?.id || '' },
            }));
          }}
          sx={{ gap: 1.25, py: 1.25, px: 1.5, minHeight: 48 }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <PersonAddAlt1OutlinedIcon sx={{ fontSize: 18, color: colors.brand.ink }} />
          </ListItemIcon>
          Add a new person to track
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={dashboardActionsAnchor}
        open={Boolean(dashboardActionsAnchor)}
        onClose={handleDashboardActionsClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 280,
            borderRadius: '18px',
            border: `1px solid ${colors.landing.borderLight}`,
            boxShadow: `0 24px 60px ${colors.landing.shadowPanel}`,
            bgcolor: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(16px)',
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{ px: 0.5 }}>
          <ChildActionsMenuContent
            child={dashboardActiveChild}
            userRole={getUserRoleForChild?.(dashboardActiveChild?.id)}
            careTeamCount={Array.isArray(dashboardActiveChild?.users?.members) ? dashboardActiveChild.users.members.length : 0}
            onAddChild={() => handleDashboardAction('add-child')}
            onGoToCareTeam={() => handleDashboardAction('view-care-team')}
            onEditChild={() => handleDashboardAction('edit-child')}
            onInviteTeamMember={() => handleDashboardAction('invite-caregiver')}
            onDeleteChild={() => handleDashboardAction('delete-child')}
            onPrepForTherapy={() => handleDashboardAction('prep-for-therapy')}
            onImportLogs={() => handleDashboardAction('import-logs')}
          />
        </Box>
        <Box sx={{ px: 1.5, pb: 0.75, pt: 1 }}>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: colors.landing.textMuted }}>
            Account
          </Typography>
        </Box>
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
