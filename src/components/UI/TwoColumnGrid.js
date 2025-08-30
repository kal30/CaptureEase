// src/components/common/TwoColumnGrid.js
import React from "react";
import { Box } from "@mui/material";

export default function TwoColumnGrid({ children, sx = {} }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
        gap: 3,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
