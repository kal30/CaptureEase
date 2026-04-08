// Centralized brand tokens for palette and typography

import colors from "./colors";

const brand = {
  colors: {
    // Core brand colors
    ink: colors.brand.ink, // teal for primary actions / buttons
    tint: colors.brand.tint, // lavender tint for accents / supportive backgrounds

    // Extended brand scale
    scale: colors.brand,
  },

  // Palette mapping used by MUI theme
  palette: {
    primary: {
      main: colors.brand.ink, // teal
      dark: colors.brand.navy, // deep teal
      light: colors.brand.lightBlue, // soft teal
    },
    secondary: {
      main: colors.brand.tint, // lavender
      light: colors.brand.ice, // soft lavender
      dark: colors.brand.deep, // deeper lavender
    },
  },

  typography: {
    buttonFontFamily: "'Outfit', sans-serif",
  },

  radii: {
    button: 12,
  },
};

export default brand;
