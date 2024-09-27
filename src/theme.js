import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#94618E', // Grape
    },
    secondary: {
      main: '#49274A', // Eggplant
    },
    background: {
      default: '#F4DECB', // Sand
      paper: '#F8EEE7',  // Shell for cards and panels
    },
    text: {
      primary: '#333333',  // Dark gray for main text
      secondary: '#757575',  // Lighter gray for secondary text
    },
    textWhite: {
      primary: '#ffff',  // Dark gray for main text
      secondary: '#757575',  // Lighter gray for secondary text
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    button: {
      textTransform: 'none', // Disable uppercase for buttons
    },
    h6: {
      fontWeight: 500,
      color: '#49274A',  // Darker shade for headings (Eggplant)
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#94618E', // Primary (Grape) for AppBar
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',  // Slightly rounded buttons for modern look
        },
      },
    },
  },
});

export default theme;