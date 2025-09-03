// DEPRECATED: This component has been moved to _deprecated and is no longer used.
import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import { useTheme } from "@mui/material/styles";

/**
 * RoleIndicator - Reusable component for displaying user roles with consistent styling
 * Handles both header-style banners and compact badges
 *
 * Usage:
 * <RoleIndicator role="therapist" variant="header" childName="Emma" />
 * <RoleIndicator role="caregiver" variant="badge" />
 * <RoleIndicator role="primary_parent" variant="compact" size="small" />
 */
const RoleIndicator = ({
  role,
  variant = "badge", // 'badge', 'header', 'compact'
  childName,
  size = "medium", // 'small', 'medium', 'large'
  showIcon = true,
  showLabel = true,
  sx = {},
  ...props
}) => {
  const theme = useTheme();

  // Role configuration using centralized theme colors
  const getRoleConfig = (roleType) => {
    const roleConfigs = {
      therapist: {
        label: "Clinical Therapist",
        shortLabel: "Therapist",
        icon: theme.palette.roles.therapist.icon,
        colors: {
          primary: theme.palette.roles.therapist.primary,
          dark: theme.palette.roles.therapist.dark,
          light: theme.palette.roles.therapist.light,
          background: theme.palette.roles.therapist.background,
          gradient: theme.palette.roles.therapist.gradient,
          border: theme.palette.roles.therapist.border,
        },
      },
      caregiver: {
        label: "Caregiver",
        shortLabel: "Caregiver",
        icon: theme.palette.roles.caregiver.icon,
        colors: {
          primary: theme.palette.roles.caregiver.primary,
          dark: theme.palette.roles.caregiver.dark,
          light: theme.palette.roles.caregiver.light,
          background: theme.palette.roles.caregiver.background,
          gradient: theme.palette.roles.caregiver.gradient,
          border: theme.palette.roles.caregiver.border,
        },
      },
      primary_parent: {
        label: "Parent/Guardian",
        shortLabel: "Primary Parent",
        icon: theme.palette.roles.primary_parent.icon,
        colors: {
          primary: theme.palette.roles.primary_parent.primary,
          dark: theme.palette.roles.primary_parent.dark,
          light: theme.palette.roles.primary_parent.light,
          background: theme.palette.roles.primary_parent.background,
          gradient: theme.palette.roles.primary_parent.gradient,
          border: theme.palette.roles.primary_parent.border,
        },
      },
      co_parent: {
        label: "Co-Parent",
        shortLabel: "Co-Parent",
        icon: theme.palette.roles.co_parent.icon,
        colors: {
          primary: theme.palette.roles.co_parent.primary,
          dark: theme.palette.roles.co_parent.dark,
          light: theme.palette.roles.co_parent.light,
          background: theme.palette.roles.co_parent.background,
          gradient: theme.palette.roles.co_parent.gradient,
          border: theme.palette.roles.co_parent.border,
        },
      },
      family_member: {
        label: "Family Member",
        shortLabel: "Family",
        icon: theme.palette.roles.family_member.icon,
        colors: {
          primary: theme.palette.roles.family_member.primary,
          dark: theme.palette.roles.family_member.dark,
          light: theme.palette.roles.family_member.light,
          background: theme.palette.roles.family_member.background,
          gradient: theme.palette.roles.family_member.gradient,
          border: theme.palette.roles.family_member.border,
        },
      },
      unknown: {
        label: "Team Member",
        shortLabel: "Member",
        icon: theme.palette.roles.unknown.icon,
        colors: {
          primary: theme.palette.roles.unknown.primary,
          dark: theme.palette.roles.unknown.dark,
          light: theme.palette.roles.unknown.light,
          background: theme.palette.roles.unknown.background,
          gradient: theme.palette.roles.unknown.gradient,
          border: theme.palette.roles.unknown.border,
        },
      },
    };

    return roleConfigs[roleType] || roleConfigs.unknown;
  };

  // Size configurations
  const getSizeConfig = (sizeType) => {
    const sizeConfigs = {
      small: {
        fontSize: "0.75rem",
        padding: "4px 8px",
        iconSize: "14px",
        height: 20,
      },
      medium: {
        fontSize: "0.95rem",
        padding: "6px 12px",
        iconSize: "16px",
        height: 24,
      },
      large: {
        fontSize: "1.1rem",
        padding: "8px 16px",
        iconSize: "18px",
        height: 32,
      },
    };
    return sizeConfigs[sizeType] || sizeConfigs.medium;
  };

  const roleConfig = getRoleConfig(role);
  const sizeConfig = getSizeConfig(size);

  // Badge variant (Chip-based)
  if (variant === "badge") {
    return (
      <Chip
        label={
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {showIcon && (
              <Box component="span" sx={{ fontSize: sizeConfig.iconSize }}>
                {roleConfig.icon}
              </Box>
            )}
            {showLabel && (
              <Box component="span">
                {sizeConfig.fontSize === "0.75rem"
                  ? roleConfig.shortLabel
                  : roleConfig.label}
              </Box>
            )}
          </Box>
        }
        size={size === "large" ? "medium" : "small"}
        sx={{
          height: sizeConfig.height,
          fontSize: sizeConfig.fontSize,
          bgcolor: roleConfig.colors.light,
          color: roleConfig.colors.primary,
          fontWeight: 600,
          borderRadius: 1,
          ...sx,
        }}
        {...props}
      />
    );
  }

  // Compact variant (simple inline display)
  if (variant === "compact") {
    return (
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          px: 1,
          py: 0.5,
          borderRadius: 1,
          bgcolor: roleConfig.colors.light,
          color: roleConfig.colors.primary,
          fontSize: sizeConfig.fontSize,
          fontWeight: 600,
          ...sx,
        }}
        {...props}
      >
        {showIcon && (
          <Box component="span" sx={{ fontSize: sizeConfig.iconSize }}>
            {roleConfig.icon}
          </Box>
        )}
        {showLabel && (
          <Typography
            component="span"
            sx={{ fontSize: "inherit", fontWeight: "inherit" }}
          >
            {sizeConfig.fontSize === "0.75rem"
              ? roleConfig.shortLabel
              : roleConfig.label}
          </Typography>
        )}
      </Box>
    );
  }

  // Header variant (banner style like in ChildCard)
  if (variant === "header") {
    return (
      <Box
        sx={{
          background: roleConfig.colors.gradient,
          color: roleConfig.colors.primary,
          p: "12px 20px",
          fontSize: "16px",
          fontWeight: 600,
          borderBottom: `2px solid ${roleConfig.colors.border}`,
          display: "flex",
          alignItems: "center",
          gap: 1,
          ...sx,
        }}
        {...props}
      >
        {showIcon && (
          <Box component="span" sx={{ fontSize: "20px" }}>
            {roleConfig.icon}
          </Box>
        )}
        {showLabel && (
          <Box component="span" sx={{ flex: 1 }}>
            {roleConfig.label}
          </Box>
        )}
        {childName && (
          <Box
            component="span"
            sx={{
              fontSize: "18px",
              fontWeight: 700,
              color: roleConfig.colors.primary,
            }}
          >
            {childName}
          </Box>
        )}
      </Box>
    );
  }

  return null;
};

export default RoleIndicator;
