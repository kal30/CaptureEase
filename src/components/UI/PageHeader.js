import React from "react";
import { Box, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { AutoAwesome as SparkleIcon } from "@mui/icons-material";

/**
 * A reusable page header component with a consistent style.
 * @param {object} props
 * @param {string | React.ReactNode} props.title - The main title for the header.
 * @param {string | React.ReactNode} props.subtitle - The subtitle text displayed below the main title.
 * @param {React.ReactNode} props.actions - The action buttons or other elements to display on the right side.
 */
const PageHeader = ({ title, subtitle, actions }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        mb: 6,
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.05
        )} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        py: 4,
        px: 3,
        borderRadius: theme.spacing(0.5),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: 3, md: 0 },
        }}
      >
        {/* Left: Title and Subtitle */}
        <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
          <SparkleIcon
            sx={{ fontSize: 40, color: theme.palette.primary.main, mr: 2 }}
          />
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textAlign: "left",
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{
                fontWeight: 500,
                textAlign: "left",
                fontSize: "1.1rem",
                mt: 0.5,
              }}
            >
              {subtitle}
            </Typography>
          </Box>
        </Box>

        {/* Right: Action Buttons */}
        {actions && (
          <Box
            sx={{
              display: "flex",
              gap: { xs: 1, md: 2 },
              flexDirection: { xs: "column", sm: "row" },
              width: { xs: "100%", md: "auto" },
              alignSelf: { xs: "stretch", md: "flex-end" },
            }}
          >
            {actions}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PageHeader;
