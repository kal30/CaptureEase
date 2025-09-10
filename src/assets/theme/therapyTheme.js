import { alpha } from "@mui/material/styles";
import { getRoleColor, getRoleColorAlpha, createRoleStyles } from "./roleColors";

/**
 * @deprecated Use roleColors.js instead
 * This is kept for backwards compatibility - all therapy components should use roleColors
 */

// Backwards compatibility - maps old therapyTheme to new role-based system
export const therapyTheme = {
  // Primary colors now use therapist role colors
  primary: getRoleColor("therapist", "primary"),    // Teal - medical, professional
  dark: getRoleColor("therapist", "accent"),        // Dark Teal - expertise, trust  
  light: getRoleColor("therapist", "secondary"),    // Light Cyan - clean, clinical
  
  // Background colors - keep neutral
  background: {
    main: "#F8FAFC",       // Very light background
    paper: "#FFFFFF",      // Clean white for cards
    subtle: "#F1F5F9",     // Subtle background variant
  },
  
  // Border colors - use therapist theme
  border: {
    main: getRoleColorAlpha("therapist", "primary", 0.3),  // Medium border
    light: getRoleColorAlpha("therapist", "primary", 0.2), // Light border  
    subtle: getRoleColorAlpha("therapist", "primary", 0.1), // Very subtle border
  },
  
  // Text colors - keep neutral
  text: {
    primary: "#1E293B",    // Dark text
    secondary: "#64748B",  // Medium text
    accent: getRoleColor("therapist", "accent"),  // Therapist accent
  },
  
  // Status colors - keep existing
  status: {
    observation: "#0F766E", // Teal - for observations
    progress: "#059669",    // Green - for progress notes  
    recommendation: "#7C2D12", // Brown - for recommendations
    question: "#B45309",    // Amber - for questions
    assessment: "#7C3AED",  // Purple - for assessments
    goal: "#DC2626",        // Red - for goals
  },
  
  // Icon and accent colors
  accent: {
    medical: "#0369A1",     // Blue - medical/clinical
    professional: getRoleColor("therapist", "primary"), // Therapist primary
    therapeutic: "#059669",  // Green - therapeutic
  }
};

/**
 * Get status color based on note type
 * @param {string} noteType - The type of therapy note
 * @returns {string} - Hex color code
 */
export const getTherapyNoteStatusColor = (noteType) => {
  return therapyTheme.status[noteType] || therapyTheme.status.observation;
};

/**
 * Get alpha version of therapy colors for backgrounds
 * @param {string} color - Hex color
 * @param {number} opacity - Alpha value (0-1)
 * @returns {string} - RGBA color
 */
export const getTherapyAlpha = (color, opacity = 0.1) => {
  return alpha(color, opacity);
};

/**
 * @deprecated Use createRoleStyles("therapist", theme) from roleColors.js instead
 * Therapy component styles factory - backwards compatibility wrapper
 */
export const createTherapyStyles = (theme) => {
  return createRoleStyles(theme, "therapist");
};

export default therapyTheme;