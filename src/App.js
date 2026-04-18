import React, { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";

import AppRoutes from "./routes/Routes"; // Import the Routes file
import { ThemeProvider } from "@mui/material/styles";
import theme from "./assets/theme/light";
import Navbar from "./components/Landing/NavBar"; // Import the Navbar component
import { auth } from "./services/firebase";
import { ChildProvider } from "./contexts/ChildContext";
import { RoleProvider } from "./contexts/RoleContext";
import { ErrorBoundary } from "./contexts/ErrorContext";
import "./services/messaging/setupTests";
import { register as registerServiceWorker } from "./serviceWorkerRegistration";

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

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const scheduleRegistration = () => {
      registerServiceWorker();
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(scheduleRegistration, { timeout: 3000 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = window.setTimeout(scheduleRegistration, 1500);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <ChildProvider>
        <RoleProvider>
          <Router>
            <ErrorBoundary>
              <Navbar />
              <AppRoutes />
            </ErrorBoundary>
          </Router>
        </RoleProvider>
      </ChildProvider>
    </ThemeProvider>
  );
};

export default App;
