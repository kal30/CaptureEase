import { alpha } from "@mui/material/styles";

// Normalize role names
const normalizeRole = (role) => {
  if (!role) return null;
  if (role.includes("parent")) return "primary_parent";
  return role;
};

// Explicit hex mapping per role (brand-aligned blues)
const roleHex = {
  therapist: "#F7EA8C", // "#02457A",       // deep blue
  caregiver: "#0097A7", // teal-blue
  primary_parent: "#4F7ABB", // brand ink
  co_parent: "#081f5c", // same as primary parent
  family_member: "#97CADB", // light blue
  default: "#c8d9e6", // brand tint (fallback)
};

// Build a soft gradient from a hex color
const makeSoftGradientFromHex = (theme, baseHex) => {
  const start = alpha(baseHex, 0.08);
  const end = alpha(baseHex, 0.12);
  return `linear-gradient(135deg, ${start} 0%, ${end} 100%)`;
};

export const childCardHeaderStyles = (theme, userRole) => {
  const key = normalizeRole(userRole || "");
  const baseHex = roleHex[key] || roleHex.default;
  return {
    display: "flex",
    alignItems: "center",
    gap: 2,
    p: 2,
    flexWrap: { xs: "wrap", md: "nowrap" },
    minHeight: { xs: "auto", md: 100 },
    background: makeSoftGradientFromHex(theme, baseHex),
  };
};
