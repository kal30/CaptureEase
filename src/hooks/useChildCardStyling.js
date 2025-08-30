import { useMemo } from 'react';
import { alpha, useTheme } from '@mui/material/styles';

/**
 * useChildCardStyling - Styling hook for ChildCard component
 * Generates group-based styling and theming for child cards
 * 
 * @param {string} groupType - Group type: 'own', 'family', 'professional'
 * @param {string} userRole - User role for this child
 * @param {boolean} completedToday - Whether daily care is completed
 * @returns {Object} Styling objects and theme data
 */
export const useChildCardStyling = (groupType, userRole, completedToday) => {
  const theme = useTheme();

  // Group-specific styling
  const groupStyle = useMemo(() => {
    switch (groupType) {
      case "own":
        return {
          borderColor: alpha(theme.palette.primary.main, 0.4),
          backgroundColor: alpha(theme.palette.primary.main, 0.03),
          headerGradient: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`,
          hoverShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
        };
      case "family":
        return {
          borderColor: alpha(theme.palette.calendar.accent, 0.4),
          backgroundColor: alpha(theme.palette.calendar.accent, 0.03),
          headerGradient: `linear-gradient(135deg, ${alpha(theme.palette.calendar.accent, 0.15)} 0%, ${alpha(theme.palette.calendar.accent, 0.08)} 100%)`,
          hoverShadow: `0 8px 32px ${alpha(theme.palette.calendar.accent, 0.2)}`,
        };
      case "professional":
        const professionalColor = theme.palette.success?.main || '#4caf50';
        return {
          borderColor: alpha(professionalColor, 0.4),
          backgroundColor: alpha(professionalColor, 0.03),
          headerGradient: `linear-gradient(135deg, ${alpha(professionalColor, 0.15)} 0%, ${alpha(professionalColor, 0.08)} 100%)`,
          hoverShadow: `0 8px 32px ${alpha(professionalColor, 0.2)}`,
        };
      default:
        return {
          borderColor: alpha(theme.palette.grey[300], 0.4),
          backgroundColor: theme.palette.background.paper,
          headerGradient: 'none',
          hoverShadow: theme.shadows[4],
        };
    }
  }, [groupType, theme]);

  // Role-based styling
  const roleStyle = useMemo(() => {
    return {
      boxShadow:
        userRole === "therapist"
          ? "0 2px 8px rgba(25,118,210,0.08)"
          : userRole === "caregiver"
            ? "0 2px 8px rgba(245,124,0,0.08)"
            : userRole && userRole.includes("parent")
              ? "0 2px 8px rgba(56,142,60,0.08)"
              : "0 1px 3px rgba(0,0,0,0.05)",
      hoverBoxShadow:
        userRole === "therapist"
          ? "0 4px 16px rgba(25,118,210,0.15)"
          : userRole === "caregiver"
            ? "0 4px 16px rgba(245,124,0,0.15)"
            : userRole && userRole.includes("parent")
              ? "0 4px 16px rgba(56,142,60,0.15)"
              : "0 2px 8px rgba(0,0,0,0.1)",
      hoverBorderColor:
        userRole === "therapist"
          ? "#BBDEFB"
          : userRole === "caregiver"
            ? "#FFCC80"
            : userRole && userRole.includes("parent")
              ? "#C8E6C9"
              : "#ddd",
    };
  }, [userRole]);

  // Card container styling
  const cardStyles = useMemo(() => ({
    border: "1px solid",
    borderColor: groupStyle.borderColor,
    borderRadius: 3,
    overflow: "hidden",
    bgcolor: groupStyle.backgroundColor,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    boxShadow: roleStyle.boxShadow,
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: roleStyle.hoverBoxShadow,
      borderColor: roleStyle.hoverBorderColor,
    },
  }), [groupStyle, roleStyle]);

  // Header styling
  const headerStyles = useMemo(() => ({
    display: "flex",
    alignItems: "center",
    p: 2,
    background: completedToday
      ? `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`
      : groupStyle.headerGradient,
    position: "relative",
    cursor: "pointer",
    flexWrap: { xs: "wrap", md: "nowrap" },
    gap: { xs: 1, md: 0 },
    "&:hover": {
      bgcolor: alpha(theme.palette.primary.main, 0.02),
    },
  }), [completedToday, groupStyle.headerGradient, theme]);

  // Avatar styling
  const avatarStyles = useMemo(() => ({
    bgcolor: completedToday
      ? theme.palette.success.main
      : theme.palette.primary.main,
    width: 40,
    height: 40,
    fontSize: "1.2rem",
    fontWeight: 700,
    borderRadius: 1,
  }), [completedToday, theme]);

  return {
    groupStyle,
    roleStyle,
    cardStyles,
    headerStyles,
    avatarStyles,
    theme
  };
};