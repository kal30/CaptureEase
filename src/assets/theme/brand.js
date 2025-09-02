// Centralized brand tokens for palette and typography

const brand = {
  colors: {
    // Core brand colors
    ink: "#081f5c", // deep blue for primary actions / text on buttons
    tint: "#c8d9e6", // light blue tint for accents / secondary backgrounds

    // Extended blue scale (reference palette provided)
    scale: {
      navy: "#001B48",
      deep: "#02457A",
      tealBlue: "#018ABE",
      lightBlue: "#97CADB",
      ice: "#D6EBEE",
    },
  },

  // Palette mapping used by MUI theme
  palette: {
    primary: {
      main: "#081f5c", // ink
      dark: "#001B48", // navy
      light: "#97CADB", // lightBlue
    },
    secondary: {
      main: "#c8d9e6", // tint
      light: "#D6EBEE", // ice
      dark: "#02457A", // deep
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

