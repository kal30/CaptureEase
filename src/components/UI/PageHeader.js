import React from "react";
import { Box, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { AutoAwesome as SparkleIcon } from "@mui/icons-material";
import colors from "../../assets/theme/colors";

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
        mb: { xs: 2.5, md: 5 },
        width: '100%',
        maxWidth: 1200,
        mx: 'auto',
        background: `linear-gradient(135deg, ${alpha(
          colors.landing.pageBackground,
          0.98
        )} 0%, ${alpha(colors.landing.panelSoft, 0.92)} 100%)`,
        py: { xs: 2.5, md: 3.5 },
        px: { xs: 1.5, sm: 2.5, md: 3 },
        borderRadius: { xs: 2, md: 3 },
        border: `1px solid ${alpha(colors.landing.borderLight, 0.9)}`,
        boxShadow: `0 10px 24px ${colors.landing.shadowSoft}`,
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
            sx={{ fontSize: { xs: 28, md: 38 }, color: colors.brand.ink, mr: { xs: 1, md: 1.75 } }}
          />
          <Box>
            <Typography
              sx={{
                fontWeight: 800,
                color: colors.landing.heroText,
                textAlign: "left",
                fontSize: { xs: "1.45rem", sm: "1.9rem", md: "2.45rem" },
                lineHeight: 1.12,
                letterSpacing: "-0.03em",
              }}
            >
              {title}
            </Typography>
            <Typography
              color="text.secondary"
              sx={{
                fontWeight: 500,
                textAlign: "left",
                fontSize: { xs: "0.92rem", md: "1.02rem" },
                mt: 0.5,
                lineHeight: 1.55,
                maxWidth: 720,
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
