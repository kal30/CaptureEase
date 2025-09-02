// BreadcrumbsComponent.js
import React, { useState, useEffect } from "react";
import { Breadcrumbs, Link, Typography, Box, Container } from "@mui/material";
import { useLocation, Link as RouterLink } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../services/firebase";
import {
  containerStyles as breadcrumbsContainer,
  listStyles as breadcrumbsList,
  linkStyles as breadcrumbLink,
  homeIconStyles as breadcrumbHomeIcon,
  parentTextStyles as breadcrumbParentText,
  activeTextStyles as breadcrumbActiveText,
  separatorIconStyles as breadcrumbSeparatorIcon,
} from "../../assets/theme/breadcrumbsTheme";

const BreadcrumbsComponent = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const isLoggedIn = !!user;

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // Get the current path and split it into an array
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Map route segments to display names
  const breadcrumbNameMap = {
    dashboard: "Dashboard",
    messages: "Messages",
    journal: "Journal",
    sensory: "Sensory",
    log: "Daily Log",
    medical: "Medical Log",
    templates: "Templates",
    "care-team": "Care Team",
    "daily-activities": "Daily Activities",
    "health-info": "Health Info",
    "progress-notes": "Progress Notes",
    profile: "Profile",
  };

  // Build the breadcrumbs items
  const breadcrumbsItems = [];

  // Handle first crumb based on login status
  if (isLoggedIn) {
    // Always include the Dashboard link if not on the dashboard
    if (location.pathname !== "/dashboard") {
      breadcrumbsItems.push(
        <Link
          component={RouterLink}
          underline="hover"
          color="inherit"
          to="/dashboard"
          key="dashboard"
          sx={(theme) => breadcrumbLink(theme)}
        >
          <HomeIcon sx={(theme) => breadcrumbHomeIcon(theme)} />
          Dashboard
        </Link>
      );
    } else {
      breadcrumbsItems.push(
        <Typography
          color="text.primary"
          key="dashboard"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            fontWeight: 600,
          }}
        >
          <HomeIcon sx={(theme) => breadcrumbHomeIcon(theme)} />
          Dashboard
        </Typography>
      );
    }
  } else {
    // Not logged in
    // If pathname includes 'dashboard', skip rendering dashboard crumb
    if (!location.pathname.includes("dashboard")) {
      breadcrumbsItems.push(
        <Link
          component={RouterLink}
          underline="hover"
          color="inherit"
          to="/"
          key="home"
          sx={(theme) => breadcrumbLink(theme)}
        >
          <HomeIcon sx={(theme) => breadcrumbHomeIcon(theme)} />
          Home
        </Link>
      );
    }
  }

  // Build breadcrumbs for all routes
  let currentPath = "";
  pathnames.forEach((value, index) => {
    // Skip 'dashboard' as it's the root of our breadcrumbs
    if (value === "dashboard") {
      return;
    }

    // Build the path incrementally
    currentPath += `/${value}`;
    const isLast = index === pathnames.length - 1;
    const rawName = breadcrumbNameMap[value] || value;
    const name = capitalize(rawName);

    if (isLast) {
      breadcrumbsItems.push(
        <Typography color="text.primary" key={currentPath} sx={(theme) => breadcrumbActiveText(theme)}>
          {decodeURIComponent(name)}
        </Typography>
      );
    } else {
      breadcrumbsItems.push(
        <Link
          component={RouterLink}
          underline="hover"
          color="inherit"
          to={currentPath}
          key={currentPath}
          sx={(theme) => breadcrumbLink(theme)}
        >
          {decodeURIComponent(name)}
        </Link>
      );
    }
  });

  return (
    <Box sx={(theme) => breadcrumbsContainer(theme)}>
      <Container
        disableGutters
        maxWidth="xl"
        sx={{ px: 2, background: "transparent" }}
      >
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" sx={(theme) => breadcrumbSeparatorIcon(theme)} />}
          aria-label="breadcrumb"
          sx={breadcrumbsList}
        >
          {breadcrumbsItems}
        </Breadcrumbs>
      </Container>
    </Box>
  );
};

export default BreadcrumbsComponent;
