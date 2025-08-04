import React from "react";
import { AppBar, Toolbar, Button, Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import logo from "../../assets/image/landing/carelog.png";

const MinimalHeader = () => {
  return (
    <AppBar
      position="static"
      sx={{
        boxShadow: "none",
        backgroundColor: "#FFFFFF",
      }}
    >
      <Toolbar
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Button
          component={RouterLink}
          to="/"
          sx={{ padding: 0, minWidth: "auto", borderRadius: "50%" }}
        >
          <img
            src={logo}
            alt="Logo"
            style={{ height: "120px", cursor: "pointer" }}
          />
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default MinimalHeader;
