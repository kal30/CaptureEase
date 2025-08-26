// BreadcrumbsComponent.js
import React, { useState, useEffect } from "react";
import { Breadcrumbs, Link, Typography, Box, Container } from "@mui/material";
import { useLocation, Link as RouterLink } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../services/firebase";

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
    log: "Child Log",
    medical: "Medical Log",
    templates: "Templates",
    "care-team": "Care Team",
    "daily-activities": "Daily Activities",
    "health-info": "Health Info",
    "progress-notes": "Progress Notes",
    "daily-log": "Daily Log",
    "daily-note": "Daily Log",
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
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            color: "#5B8C51",
            fontWeight: 500,
            textDecoration: "none",
            "&:hover": {
              color: "#4B7345",
              textDecoration: "underline",
            },
          }}
        >
          <HomeIcon sx={{ fontSize: 18, color: "#5B8C51" }} />
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
          <HomeIcon sx={{ fontSize: 18, color: "#5B8C51" }} />
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
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            color: "#5B8C51",
            fontWeight: 500,
            textDecoration: "none",
            "&:hover": {
              color: "#4B7345",
              textDecoration: "underline",
            },
          }}
        >
          <HomeIcon sx={{ fontSize: 18, color: "#5B8C51" }} />
          Home
        </Link>
      );
    }
  }

  // Special handling for Daily Log hierarchy
  if (location.pathname === "/log" || location.pathname === "/log/daily-note") {
    // Add "Child Log" as non-clickable parent
    breadcrumbsItems.push(
      <Typography
        color="text.secondary"
        key="child-log-parent"
        sx={{
          fontWeight: 500,
          color: "#64748B",
        }}
      >
        Child Log
      </Typography>
    );
    
    // Add "Daily Log" as final breadcrumb
    breadcrumbsItems.push(
      <Typography
        color="text.primary"
        key="daily-log"
        sx={{
          fontWeight: 600,
          color: "#1E293B",
        }}
      >
        Daily Log
      </Typography>
    );
  } else {
    // Original logic for other routes
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
          <Typography
            color="text.primary"
            key={currentPath}
            sx={{
              fontWeight: 600,
              color: "#1E293B",
            }}
          >
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
            sx={{
              color: "#5B8C51",
              fontWeight: 500,
              textDecoration: "none",
              "&:hover": {
                color: "#4B7345",
                textDecoration: "underline",
              },
            }}
          >
            {decodeURIComponent(name)}
          </Link>
        );
      }
    });
  }

  return (
    <Box
      sx={{
        backgroundColor: (theme) => theme.palette.background.default,
        borderBottom: "none",
        padding: "20px 0",
        marginBottom: 2,
        position: "relative",
      }}
    >
      <Container
        disableGutters
        maxWidth="xl"
        sx={{ px: 2, background: "transparent" }}
      >
        <Breadcrumbs
          separator={
            <NavigateNextIcon fontSize="small" sx={{ color: "#94A3B8" }} />
          }
          aria-label="breadcrumb"
          sx={{
            "& ol": {
              display: "flex",
              flexWrap: "nowrap",
              alignItems: "center",
              margin: 0,
              padding: 0,
              listStyle: "none",
            },
            "& li": {
              display: "flex",
              alignItems: "center",
            },
          }}
        >
          {breadcrumbsItems}
        </Breadcrumbs>
      </Container>
    </Box>
  );
};

export default BreadcrumbsComponent;