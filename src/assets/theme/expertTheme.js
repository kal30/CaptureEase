/**
 * Expert Section Theme
 * Centralizes layout, colors, and typography styles for the Expert section
 */

// Section wrapper styles with decorative background shape
export const expertSectionStyles = {
  position: "relative",
  bgcolor: "transparent",
  px: { xs: 2, md: 5 },
  pt: { xs: 1, md: 3 },
  pb: { xs: 8, md: 10 },
  overflow: "visible",
  "&::before": {
    content: '""',
    position: "absolute",
    top: { xs: "10%", md: "-5%" },
    right: { xs: "-10%", md: "-4%" },
    width: { xs: 220, md: 360 },
    height: { xs: 220, md: 360 },
    backgroundImage: `url("data:image/svg+xml;utf8,<svg width='500' height='500' viewBox='0 0 500 500' fill='none' xmlns='http://www.w3.org/2000/svg'><path fill='%23F4DECB' fill-opacity='0.15' d='M421.5 322.5Q380 405 292 428Q204 451 168.5 374.5Q133 298 106 241.5Q79 185 140 124Q201 63 272.5 98Q344 133 398 171Q452 209 421.5 322.5Z'/></svg>")`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "contain",
    opacity: 0.08,
    pointerEvents: "none",
    zIndex: 0,
  },
};

// Card container styles
export const expertCardStyles = {
  bgcolor: "transparent", // transparent background
  borderRadius: 1,
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  position: "relative",
  p: { xs: 3, md: 5 },
  maxWidth: 1200,
  mx: "auto",
  display: "flex",
  flexDirection: { xs: "column", md: "row" },
  alignItems: "center",
  justifyContent: "space-between",
  gap: { xs: 3, md: 6 },
};

// Left column text wrapper
export const expertLeftColumnStyles = {
  flex: 1,
  pr: { md: 5 },
  marginBottom: { xs: 4, md: 0 },
  position: "relative",
  zIndex: 1,
};

// Title typography
export const expertTitleStyles = {
  fontWeight: 200,
  lineHeight: 1.2,
  mb: "20px",
  color: "#001B48", // deepNavy
  fontSize: { xs: "2rem", md: "2.75rem" },
  textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
  fontFamily: '"Coco Gothic", "Inter", "Segoe UI", sans-serif',
};

export const expertSubTitleStyles = {
  marginBottom: 2,
  fontSize: "1.5rem",
  fontStyle: "italic",
  color: "#02457A",
};

// Reusable body text styles
export const expertBodyTextStyles = {
  marginBottom: "10px",
  color: "#081f5c", // brandAccent
  lineHeight: 1.6,
  fontWeight: 300,
  fontSize: { xs: "1.1rem", md: "1.3rem", lg: "1.4rem" },
  fontFamily: '"Lancelot", "Inter", "Segoe UI", sans-serif',
};

// CTA button styling (kept minimal; global button theme handles most)
export const expertCtaButtonStyles = {
  px: 3,
  py: 1.25,
  borderRadius: 1.5,
};

// Image/avatar styles
export const expertImageStyles = {
  width: "100%",
  height: "auto",
  borderRadius: 2,
  maxHeight: 420,
  objectFit: "cover",
};
