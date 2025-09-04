import { alpha } from "@mui/material/styles";

// CLEAN: Role hex mapping with new role names
const roleHex = {
  care_owner: "#4F7ABB",      // brand ink - main responsible person
  care_partner: "#97CADB",    // light blue - family/friends
  caregiver: "#0097A7",       // teal-blue - professional helpers
  therapist: "#F7EA8C",       // yellow - professional advisors
  default: "#c8d9e6",         // brand tint (fallback)
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
    alignItems: "center",
    gap: 2,
    p: 2,
    flexWrap: { xs: "wrap", md: "nowrap" },
    minHeight: { xs: "auto", md: 100 },
    background: makeSoftGradientFromHex(theme, baseHex),
  };
};
