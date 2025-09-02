/****
 * Landing Page Theme Configuration
 * Separate theme file for landing page specific typography and styling
 * Keeps main theme clean and focused on app UI
 */

export const landingColors = {
  brandAccent: "#081f5c", // Existing primary navy
  productHighlight: "#4CAF50", // CTA green (kept as-is)

  // New extended palette
  deepNavy: "#001B48", // For shadows or strong accents
  midNavy: "#02457A", // For gradients
  cyanPop: "#018ABE", // CTA buttons or icons
  pastelAqua: "#97CADB", // Light, cool aqua
  softBackground: "#D6E8EE", // Backgrounds or hover

  heroText: "#081f5c",
  bodyText: "#333333",
};

export const landingTypography = {
  // Landing page hero styles
  heroMain: {
    fontSize: { xs: "1.2rem", md: "1.6rem", lg: "1.8rem" },
    fontFamily: '"Coco Gothic", sans-serif',
    fontWeight: 300,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    lineHeight: { xs: 0.95, md: 0.95, lg: 0.95 },
    marginBottom: { xs: 0.5, md: 1, lg: 1.5 },
  },
  heroSubtitle: {
    marginTop: { xs: 1, md: 1.5, lg: 2 },
    fontFamily: '"ITC New Baskerville", serif',
    fontWeight: 700,
    lineHeight: 0.5,
    textTransform: "uppercase",
    letterSpacing: "0.02em",
    fontSize: { xs: "1.6rem", md: "2.0rem", lg: "2.2rem" },
    maxWidth: { xs: "100%", md: "90%", lg: "85%" },
  },
  heroBody: {
    marginTop: { xs: 3, md: 4, lg: 5 }, // Increased spacing
    fontSize: { xs: "1.1rem", md: "1.3rem", lg: "1.4rem" },
    lineHeight: { xs: 1.6, md: 1.7, lg: 1.8 },
    color: landingColors.bodyText,
    textAlign: "center",
    fontFamily: '"Lancelot", "Inter", "Segoe UI", Roboto, sans-serif',
    fontWeight: 300,
    maxWidth: { xs: "100%", md: "90%", lg: "85%" },
    mx: "auto",
  },

  brandAccent: {
    fontFamily: '"Dancing Script", cursive',
    fontWeight: 600,
  },

  productHighlight: {
    fontWeight: "bold",
  },
};

export const landingLayout = {
  heroSection: {
    padding: {
      xs: { pt: 2, pb: 4 },
      md: { pt: 3, pb: 6 },
      lg: { pt: 4, pb: 8 },
    },
    container: {
      gap: { xs: 3, md: 4, lg: 5 },
      padding: { xs: 1, md: 2, lg: 3 },
    },
    leftColumn: {
      width: { xs: "100%", md: "50%", lg: "45%" },
      paddingRight: { md: 2, lg: 4 },
    },
    rightColumn: {
      width: { xs: "100%", md: "50%", lg: "55%" },
      marginTop: { xs: 4, md: 0 },
      minHeight: { xs: 300, md: 400, lg: 500, xl: 600 },
    },
  },
  floatingCircle: {
    width: { xs: 180, md: 260, lg: 320, xl: 380 },
    height: { xs: 180, md: 260, lg: 320, xl: 380 },
    opacity: 0.04,
    position: {
      top: { xs: "-10%", md: "-15%", lg: "-12%" },
      right: { xs: "-8%", md: "-10%", lg: "-8%" },
    },
  },
  heroHeading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    gap: 0,
    mt: { xs: -2, md: -3, lg: -4 },
  },
};
