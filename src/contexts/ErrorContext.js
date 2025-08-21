// src/contexts/ErrorContext.js
import React, { createContext, useContext, useState } from "react";
import { Snackbar, Alert } from "@mui/material";

const ErrorContext = createContext();

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
};

export const ErrorProvider = ({ children }) => {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const showError = (message, duration = 6000) => {
    setError({ message, duration });
  };

  const showSuccess = (message, duration = 4000) => {
    setSuccess({ message, duration });
  };

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(null);

  return (
    <ErrorContext.Provider
      value={{ showError, showSuccess, clearError, clearSuccess }}
    >
      {children}

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={error?.duration}
        onClose={clearError}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={clearError} severity="error" sx={{ width: "100%" }}>
          {error?.message}
        </Alert>
      </Snackbar>

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={success?.duration}
        onClose={clearSuccess}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={clearSuccess} severity="success" sx={{ width: "100%" }}>
          {success?.message}
        </Alert>
      </Snackbar>
    </ErrorContext.Provider>
  );
};

// Error Boundary Component
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    // You could send this to an error reporting service like Sentry
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h2>Something went wrong</h2>
          <p>We're sorry, but something unexpected happened.</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}
