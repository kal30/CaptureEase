import React, { useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth"; // Firebase auth
import AppRoutes from "./Routes"; // Import the Routes file
import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme";
import Navbar from "./Landing/NavBar"; // Import the Navbar component
import { auth } from "../services/firebase";

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Navbar user={user} />
        <AppRoutes />
      </Router>
    </ThemeProvider>
  );
};

export default App;
