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
        mb: { xs: 3, md: 6 },
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.05
        )} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        py: { xs: 3, md: 4 },
        px: { xs: 2, md: 3 },
        borderRadius: { xs: 2, md: theme.spacing(0.5) },
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
            sx={{ fontSize: { xs: 32, md: 40 }, color: theme.palette.primary.main, mr: { xs: 1.25, md: 2 } }}
          />
          <Box>
            <Typography
              sx={{
                fontWeight: 800,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textAlign: "left",
                fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.75rem" },
                lineHeight: 1.08,
              }}
            >
              {title}
            </Typography>
            <Typography
              color="text.secondary"
              sx={{
                fontWeight: 500,
                textAlign: "left",
                fontSize: { xs: "0.98rem", md: "1.1rem" },
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
              "& .MuiButton-root": {
                width: { xs: "100%", sm: "auto" },
              },
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
