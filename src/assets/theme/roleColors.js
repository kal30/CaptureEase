import { alpha } from "@mui/material/styles";

/**
 * Role-Based Color System for CaptureEz
 * Provides distinct, user-friendly colors for each care team role
 * while maintaining accessibility and professional appearance
 */

export const roleColors = {
  // Care Owner - Primary family member (Blue - trustworthy, reliable)
  careOwner: {
    primary: "#2C74D4",    // Royal Blue - matches brand, conveys leadership
    secondary: "#A7C7E7",  // Sky Blue - soft, approachable 
    accent: "#081F5C",     // Deep Navy - authority, trust
    name: "Care Owner",
    description: "Primary caregiver with full access",
    icon: "👑"
  },

  // Care Partner - Family/Friends (Purple - supportive, caring)
  carePartner: {
    primary: "#8B5CF6",    // Violet - supportive, collaborative
    secondary: "#C4B5FD",  // Light Lavender - gentle, caring
    accent: "#4C1D95",     // Deep Purple - commitment, loyalty
    name: "Care Partner", 
    description: "Family member or friend helper",
    icon: "👥"
  },

  // Caregiver - Professional Helper (Green - helping, growth)
  caregiver: {
    primary: "#059669",    // Emerald Green - professional, helping
    secondary: "#A7F3D0",  // Mint Green - fresh, supportive
    accent: "#065F46",     // Forest Green - stability, expertise
    name: "Caregiver",
    description: "Professional daily care provider", 
    icon: "🤝"
  },

  // Therapist - Medical Professional (Teal - medical, clinical)
  therapist: {
    primary: "#0891B2",    // Teal - medical, professional, calming
    secondary: "#A5F3FC",  // Light Cyan - clean, clinical
    accent: "#164E63",     // Dark Teal - expertise, trust
    name: "Therapist",
    description: "Licensed healthcare professional",
    icon: "🩺"
  }
};

/**
 * Get role color by role key and color type
 * @param {string} role - Role key (careOwner, carePartner, caregiver, therapist)
 * @param {string} colorType - Color type (primary, secondary, accent)
 * @returns {string} - Hex color code
 */
export const getRoleColor = (role, colorType = 'primary') => {
  return roleColors[role]?.[colorType] || roleColors.careOwner.primary;
};

/**
 * Get alpha version of role color
 * @param {string} role - Role key
 * @param {string} colorType - Color type (primary, secondary, accent)
 * @param {number} opacity - Alpha value (0-1)
 * @returns {string} - RGBA color
 */
export const getRoleColorAlpha = (role, colorType = 'primary', opacity = 0.1) => {
  const color = getRoleColor(role, colorType);
  return alpha(color, opacity);
};

/**
 * Get role information including colors and metadata
 * @param {string} role - Role key
 * @returns {object} - Complete role information
 */
export const getRoleInfo = (role) => {
  return roleColors[role] || roleColors.careOwner;
};

/**
 * Role styling utilities for consistent component styling
 */
export const createRoleStyles = (theme, role) => ({
  // Role-specific card styling
  card: {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${getRoleColorAlpha(role, 'primary', 0.2)}`,
    borderLeft: `4px solid ${getRoleColor(role, 'primary')}`,
    borderRadius: '12px',
    boxShadow: `0 2px 8px ${getRoleColorAlpha(role, 'primary', 0.1)}`,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      boxShadow: `0 4px 16px ${getRoleColorAlpha(role, 'primary', 0.15)}`,
      transform: 'translateY(-2px)',
    }
  },

  // Role-specific header styling
  header: {
    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${getRoleColorAlpha(role, 'secondary', 0.1)} 100%)`,
    borderLeft: `4px solid ${getRoleColor(role, 'primary')}`,
    padding: theme.spacing(2.5),
    borderRadius: '12px',
    marginBottom: theme.spacing(2),
    boxShadow: `0 1px 4px ${getRoleColorAlpha(role, 'primary', 0.1)}`,
    border: `1px solid ${getRoleColorAlpha(role, 'primary', 0.1)}`,
  },

  // Role-specific button styling
  button: {
    backgroundColor: getRoleColor(role, 'primary'),
    color: '#FFFFFF',
    fontWeight: 600,
    borderRadius: '12px',
    textTransform: 'none',
    boxShadow: `0 2px 6px ${getRoleColorAlpha(role, 'primary', 0.25)}`,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: getRoleColor(role, 'accent'),
      boxShadow: `0 4px 12px ${getRoleColorAlpha(role, 'primary', 0.35)}`,
      transform: 'translateY(-1px)',
    },
    '&:active': {
      transform: 'translateY(0px)',
      boxShadow: `0 2px 4px ${getRoleColorAlpha(role, 'primary', 0.3)}`,
    },
    '&:disabled': {
      backgroundColor: theme.palette.grey[300],
      color: theme.palette.grey[500],
      boxShadow: 'none',
      transform: 'none',
    },
  },

  // Role-specific input styling
  input: {
    backgroundColor: theme.palette.background.paper,
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: theme.palette.background.paper,
      transition: 'all 0.2s ease-in-out',
      boxShadow: `0 1px 3px ${getRoleColorAlpha(role, 'primary', 0.08)}`,
      '& fieldset': {
        borderColor: getRoleColorAlpha(role, 'primary', 0.3),
        borderWidth: '1px',
      },
      '&:hover': {
        backgroundColor: getRoleColorAlpha(role, 'secondary', 0.05),
        boxShadow: `0 2px 6px ${getRoleColorAlpha(role, 'primary', 0.12)}`,
        '& fieldset': {
          borderColor: getRoleColorAlpha(role, 'primary', 0.5),
        },
      },
      '&.Mui-focused': {
        backgroundColor: theme.palette.background.paper,
        boxShadow: `0 0 0 3px ${getRoleColorAlpha(role, 'primary', 0.15)}, 0 2px 8px ${getRoleColorAlpha(role, 'primary', 0.1)}`,
        '& fieldset': {
          borderColor: getRoleColor(role, 'primary'),
          borderWidth: '2px',
        },
      },
    },
    '& .MuiInputLabel-root': {
      color: theme.palette.text.secondary,
      fontWeight: 500,
      '&.Mui-focused': {
        color: getRoleColor(role, 'primary'),
      },
    },
  },

  // Role-specific chip styling
  chip: {
    backgroundColor: getRoleColorAlpha(role, 'primary', 0.1),
    color: getRoleColor(role, 'accent'),
    borderRadius: '8px',
    fontSize: '0.75rem',
    fontWeight: 500,
    border: `1px solid ${getRoleColorAlpha(role, 'primary', 0.2)}`,
  },

  // Role-specific badge styling
  badge: {
    backgroundColor: getRoleColor(role, 'primary'),
    color: '#FFFFFF',
    fontSize: '0.75rem',
    fontWeight: 600,
    padding: '4px 8px',
    borderRadius: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
});

/**
 * Export for MUI theme integration
 */
export const themeRoles = {
  careOwner: roleColors.careOwner,
  carePartner: roleColors.carePartner, 
  caregiver: roleColors.caregiver,
  therapist: roleColors.therapist,
};

export default roleColors;