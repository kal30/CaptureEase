// Centralized brand tokens for palette and typography

import colors from "./colors";

const brand = {
  colors: {
    // Core brand colors
    ink: colors.brand.ink, // deep blue for primary actions / text on buttons
    tint: colors.brand.tint, // light blue tint for accents / secondary backgrounds

    // Extended blue scale (reference palette provided)
    scale: colors.brand,
  },

  // Palette mapping used by MUI theme
  palette: {
    primary: {
      main: colors.brand.ink, // ink
      dark: colors.brand.navy, // navy
      light: colors.brand.lightBlue, // lightBlue
    },
    secondary: {
      main: colors.brand.tint, // tint
      light: colors.brand.ice, // ice
      dark: colors.brand.deep, // deep
    },
  },

  typography: {
    buttonFontFamily: "'Harmattan','Poppins','Inter','Roboto',sans-serif",
  },

  radii: {
    button: 14,
  },
};

export default brand;
