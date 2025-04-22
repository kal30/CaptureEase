// BreadcrumbsComponent.js
import React from "react";
import { Breadcrumbs, Link, Typography } from "@mui/material";
import { useLocation, Link as RouterLink } from "react-router-dom";

const BreadcrumbsComponent = () => {
  const location = useLocation();

  // Get the current path and split it into an array
  let pathnames = location.pathname.split("/").filter((x) => x);

  // Exclude 'child' and the segment immediately after it (the child ID)
  pathnames = pathnames.filter((segment, index, arr) => {
    // Exclude 'child' segment
    if (segment === "child") {
      return false;
    }
    // Exclude the segment that comes immediately after 'child' (the child ID)
    if (arr[index - 1] === "child") {
      return false;
    }
    return true;
  });

  // Remove 'dashboard' from pathnames if it's the first segment
  if (pathnames[0] === "dashboard") {
    pathnames.shift();
  }

  // Map route segments to display names
  const breadcrumbNameMap = {
    dashboard: "Dashboard",
    messages: "Messages",
    journal: "Journal",
    sensory: "Sensory",
    // Add any other mappings as needed
  };

  // Build the breadcrumbs items
  const breadcrumbsItems = [];

  // Always include the Dashboard link
  breadcrumbsItems.push(
    <Link
      component={RouterLink}
      underline="hover"
      color="inherit"
      to="/dashboard"
      key="dashboard"
    >
      Dashboard
    </Link>
  );

  // Map over the remaining path segments
  pathnames.forEach((value, index) => {
    const to = `/${pathnames.slice(0, index + 1).join("/")}`;
    const isLast = index === pathnames.length - 1;

    // Determine display name
    let name = breadcrumbNameMap[value] || value;

    if (isLast) {
      breadcrumbsItems.push(
        <Typography color="text.primary" key={to}>
          {decodeURIComponent(name)}
        </Typography>
      );
    } else {
      breadcrumbsItems.push(
        <Link
          component={RouterLink}
          underline="hover"
          color="inherit"
          to={to}
          key={to}
        >
          {decodeURIComponent(name)}
        </Link>
      );
    }
  });

  return (
    <Breadcrumbs
      separator={
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          /
        </Typography>
      }
      aria-label="breadcrumb"
      sx={{
        margin: "16px",
        "& ol": {
          display: "flex",
          flexWrap: "nowrap",
          alignItems: "center",
          color: "blue",
        },
        "& li": {
          display: "flex",
          alignItems: "center",
        },
      }}
    >
      {breadcrumbsItems}
    </Breadcrumbs>
  );
};

export default BreadcrumbsComponent;
