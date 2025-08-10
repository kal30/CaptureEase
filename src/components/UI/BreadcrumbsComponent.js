// BreadcrumbsComponent.js
import React from "react";
import { Breadcrumbs, Link, Typography, Box, Container } from "@mui/material";
import { useLocation, Link as RouterLink } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

const BreadcrumbsComponent = () => {
  const location = useLocation();

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
    profile: "Profile",
  };

  // Build the breadcrumbs items
  const breadcrumbsItems = [];

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
          color: "#6366F1",
          fontWeight: 500,
          textDecoration: "none",
          "&:hover": {
            color: "#4F46E5",
            textDecoration: "underline",
          },
        }}
      >
        <HomeIcon sx={{ fontSize: 18 }} />
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
        <HomeIcon sx={{ fontSize: 18, color: "#6366F1" }} />
        Dashboard
      </Typography>
    );
  }

  let currentPath = "";
  pathnames.forEach((value, index) => {
    // Skip 'dashboard' as it's the root of our breadcrumbs
    if (value === "dashboard") {
      return;
    }

    // Build the path incrementally
    currentPath += `/${value}`;
    const isLast = index === pathnames.length - 1;
    const name = breadcrumbNameMap[value] || value;

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
            color: "#6366F1",
            fontWeight: 500,
            textDecoration: "none",
            "&:hover": {
              color: "#4F46E5",
              textDecoration: "underline",
            },
          }}
        >
          {decodeURIComponent(name)}
        </Link>
      );
    }
  });

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",
        borderBottom: "1px solid #E2E8F0",
        padding: "20px 0",
        marginBottom: 2,
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(99, 102, 241, 0.2) 50%, transparent 100%)",
        },
      }}
    >
      <Container maxWidth="xl">
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
