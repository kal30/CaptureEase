// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#42a5f5',
    },
    secondary: {
      main: '#5c6bc0',
    },
    background: {
      default: '#f5f7fa',
      paper: '#fff',
      messageBox: '#e1f5fe',  // Custom color for message box background
    },
    text: {
      primary: '#000',
      secondary: '#757575',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none',
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
        },
      },
    },
  },
});

export default theme;