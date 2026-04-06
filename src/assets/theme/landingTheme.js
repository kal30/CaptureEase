import colors from "./colors";

export const landingColors = {
  brandAccent: colors.landing.heroText,
  productHighlight: colors.landing.productHighlight,
  deepNavy: colors.landing.deepNavy,
  midNavy: colors.landing.midNavy,
  cyanPop: colors.landing.cyanPop,
  pastelAqua: colors.landing.pastelAqua,
  pageBackground: colors.landing.pageBackground,
  heroText: colors.landing.heroText,
  bodyText: colors.landing.bodyText,
  textStrong: colors.landing.textStrong,
  textMuted: colors.landing.textMuted,
  textSoft: colors.landing.textSoft,
  surface: colors.landing.surface,
  surfaceSoft: colors.landing.surfaceSoft,
  surfaceTint: colors.landing.surfaceTint,
  panelSoft: colors.landing.panelSoft,
  borderSoft: colors.landing.borderSoft,
  borderLight: colors.landing.borderLight,
  borderMedium: colors.landing.borderMedium,
  borderStrong: colors.landing.borderStrong,
  borderFocus: colors.landing.borderFocus,
  borderActive: colors.landing.borderActive,
  shadowSoft: colors.landing.shadowSoft,
  shadowMedium: colors.landing.shadowMedium,
  shadowPanel: colors.landing.shadowPanel,
  shadowStrong: colors.landing.shadowStrong,
  shadowHero: colors.landing.shadowHero,
  shadowHeroStrong: colors.landing.shadowHeroStrong,
  quoteBadge: colors.landing.quoteBadge,
  quoteGradientStart: colors.landing.quoteGradientStart,
  quoteGradientEnd: colors.landing.quoteGradientEnd,
};

export const landingTypography = {
  // Landing page hero styles
  heroMain: {
    fontSize: { xs: "1.55rem", md: "2rem", lg: "2.3rem" },
    fontFamily: '"Coco Gothic", sans-serif',
    fontWeight: 300,
    letterSpacing: "0.015em",
    textTransform: "none",
    lineHeight: { xs: 1.2, md: 1.18, lg: 1.15 },
    marginBottom: { xs: 0.5, md: 0.75, lg: 1 },
    maxWidth: { xs: "100%", md: "18ch", lg: "18ch" },
    mx: { xs: "auto", md: 0 },
    textAlign: { xs: "center", md: "left" },
  },
  heroSubtitle: {
    marginTop: { xs: 1, md: 1.5, lg: 2 },
    fontFamily: '"ITC New Baskerville", serif',
    fontWeight: 700,
    lineHeight: 1.1,
    textTransform: "uppercase",
    letterSpacing: "0.02em",
    fontSize: { xs: "1.6rem", md: "2.0rem", lg: "2.2rem" },
    maxWidth: { xs: "100%", md: "90%", lg: "85%" },
  },
  heroBody: {
    marginTop: { xs: 1.5, md: 2, lg: 2.25 },
    fontSize: { xs: "1.0rem", md: "1.0rem", lg: "1.2rem" },
    lineHeight: { xs: 1.6, md: 1.7, lg: 1.8 },
    color: landingColors.bodyText,
    textAlign: { xs: "center", md: "left" },
    fontFamily: '"Lancelot", "Inter", "Segoe UI", Roboto, sans-serif',
    fontWeight: 300,
    maxWidth: { xs: "100%", md: "32rem", lg: "34rem" },
    mx: { xs: "auto", md: 0 },
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
      xs: { pt: 0, pb: 2 },
      md: { pt: 0, pb: 3.5 },
      lg: { pt: 0, pb: 4.5 },
    },
    container: {
      gap: { xs: 2.5, md: 4, lg: 5 },
      padding: { xs: 1, md: 2, lg: 3 },
      maxWidth: { md: 1220, lg: 1280 },
      mx: "auto",
    },
    leftColumn: {
      width: { xs: "100%", md: "50%", lg: "47%" },
      paddingRight: { md: 1, lg: 2 },
    },
    rightColumn: {
      width: { xs: "100%", md: "50%", lg: "53%" },
      marginTop: { xs: 2, md: 0 },
      minHeight: { xs: 280, md: 380, lg: 470, xl: 560 },
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
    alignItems: { xs: "center", md: "flex-start" },
    justifyContent: "center",
    textAlign: { xs: "center", md: "left" },
    gap: { xs: 0.5, md: 0.5, lg: 0.5 },
    mt: { xs: 0, md: 0, lg: 0 },
    mb: { xs: 1, md: 1.25, lg: 1.5 },
  },
};

// Landing page component styles
export const landingPageStyles = {
  backgroundColor: colors.landing.pageBackground,
  minHeight: "100vh",
};
