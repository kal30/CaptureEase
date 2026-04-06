import { alpha } from "@mui/material/styles";
import colors from "./colors";
import { getRoleColor } from "./roleColors";

// Role hex mapping using centralized role color system
const roleHex = {
  care_owner: getRoleColor("careOwner", "primary"),     // Royal Blue - leadership, trust
  care_partner: getRoleColor("carePartner", "primary"), // Violet - supportive, collaborative  
  caregiver: getRoleColor("caregiver", "primary"),      // Emerald Green - helping, professional
  therapist: getRoleColor("therapist", "primary"),      // Teal - medical, clinical
  default: colors.brand.tint,                           // brand tint (fallback)
};

// Build a soft gradient from a hex color
const makeSoftGradientFromHex = (theme, baseHex) => {
  const start = alpha(baseHex, 0.08);
  const end = alpha(baseHex, 0.12);
  return `linear-gradient(135deg, ${start} 0%, ${end} 100%)`;
};

export const childCardHeaderStyles = (theme, userRole) => {
  const baseHex = roleHex[userRole] || roleHex.default;
  return {
    display: "flex",
    alignItems: "flex-start",
    gap: theme.spacing(1.25),
    p: { xs: 1.25, md: 2 },
    flexWrap: { xs: "wrap", md: "nowrap" },
    minHeight: { xs: "auto", md: 100 },
    background: makeSoftGradientFromHex(theme, baseHex),
  };
};
