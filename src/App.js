import React, { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";

import AppRoutes from "./routes/Routes"; // Import the Routes file
import { ThemeProvider } from "@mui/material/styles";
import theme from "./assets/theme/light";
import Navbar from "./components/Landing/NavBar"; // Import the Navbar component
import { auth } from "./services/firebase";
import { ChildProvider } from "./contexts/ChildContext";
import { ErrorBoundary } from "./contexts/ErrorContext";

const App = () => {
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // setUser(user);
      } else {
        // setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <ChildProvider>
        <Router>
          <ErrorBoundary>
            <Navbar />
            <AppRoutes />
          </ErrorBoundary>
        </Router>
      </ChildProvider>
    </ThemeProvider>
  );
};

export default App;
